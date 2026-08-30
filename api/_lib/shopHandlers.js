import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  PUBLIC_PRODUCT_SELECT,
  SHOP_STORAGE_BUCKET,
  attachProductAssetUrls,
  attachProductAssetUrlsToMany,
  buildOrderLineItems,
  isMissingShopTable,
  isShopColumnMismatch,
  isShopSchemaCacheStale,
  loadPublishedProductsByIds,
  matchesShopSearch,
  missingShopColumnName,
  normalizeProductInput,
  parseBasketItems,
  productIsFeatured,
  productIsPublished,
  normalizeShopProductRow,
  safeShopErrorMessage,
  shopSetupReason,
  shopSupabaseConfig,
  signedShopAssetUrl,
  slugifyProductTitle,
  toPublicProduct,
  toAdminProduct,
  applyShopProductUpdate,
  persistShopProductRow,
  checkoutRejectionForProduct,
  EXTERNAL_CHECKOUT_ERROR,
  deleteObsoleteSeededUnit1Products,
  correctSpecialisedCellsClassification,
} from './shop.js';
import { ensureMissingUnit1ShopProducts } from './publishUnit1OriginalLessons.js';
import { copyResourceToShop, copyResourcesToShopBulk } from './copyResourceToShop.js';
import { parseRequestBody, safeTrim } from './tutors.js';
import { hasAcceptedTerms, TERMS_ACCEPTANCE_ERROR, TERMS_VERSION } from './requireTerms.js';

function shopKind(req) {
  const kind = safeTrim(req.query?.kind, 40);
  const url = String(req.url || '');
  if (kind === 'shop-order' || url.includes('/api/shop-order')) return 'shop-order';
  if (kind === 'shop-download' || url.includes('/api/shop-download')) return 'shop-download';
  if (kind === 'shop-products' || url.includes('/api/shop-products')) return 'shop-products';
  return '';
}

export function wantsShopPublicRequest(req) {
  return Boolean(shopKind(req));
}

function shopProductsResponse(res, payload, { check = false } = {}) {
  const body = { ok: true, ...payload };
  if (check) {
    body.setupRequired = Boolean(payload.setupRequired);
  } else if ('setupRequired' in payload && payload.setupRequired === false) {
    delete body.setupRequired;
  } else if (payload.setupRequired) {
    body.setupRequired = true;
  }
  return res.status(200).json(body);
}

async function probeShopStorageBucket(supabase) {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      return { exists: false, error: safeShopErrorMessage(error) };
    }
    const exists = (data || []).some((bucket) => bucket.name === SHOP_STORAGE_BUCKET);
    return { exists, error: null };
  } catch (err) {
    return { exists: false, error: safeShopErrorMessage(err) };
  }
}

async function runShopProductsDiagnostics(supabase, config) {
  const { data: allRows, error } = await supabase
    .from('shop_products')
    .select('*');

  const storage = await probeShopStorageBucket(supabase);
  const rows = (allRows || []).map(normalizeShopProductRow);
  const publishedRows = rows.filter(productIsPublished);
  const featuredRows = rows.filter(productIsFeatured);

  return {
    projectRef: config.projectRef,
    expectedProjectRef: 'xugsznxfvpbifpzpuoek',
    projectRefMatchesExpected: config.projectRef === 'xugsznxfvpbifpzpuoek',
    supabaseUrlConfigured: Boolean(config.supabaseUrl),
    serviceRoleConfigured: Boolean(config.serviceRoleKey),
    setupReason: shopSetupReason(error),
    setupRequired: isMissingShopTable(error),
    schemaCacheStale: isShopSchemaCacheStale(error),
    columnMismatch: isShopColumnMismatch(error),
    missingColumn: missingShopColumnName(error),
    error: error ? safeShopErrorMessage(error) : null,
    errorCode: error?.code || null,
    querySucceeded: !error,
    totalProductCount: rows.length,
    publishedProductCount: publishedRows.length,
    featuredProductCount: featuredRows.length,
    isPublishedTrueCount: rows.filter((row) => row.is_published === true).length,
    publishedTrueCount: rows.filter((row) => row.published === true).length,
    isFeaturedTrueCount: rows.filter((row) => row.is_featured === true).length,
    featuredTrueCount: rows.filter((row) => row.featured === true).length,
    externalProductCount: rows.filter((row) => row.opens_external && row.external_url).length,
    publishedProductTitles: publishedRows.map((row) => row.title).filter(Boolean).slice(0, 10),
    storageBucket: SHOP_STORAGE_BUCKET,
    storageBucketExists: storage.exists,
    storageError: storage.error,
  };
}

async function buildPublicShopProductsResponse(supabase, filters = {}) {
  const result = await loadPublishedShopProducts(supabase, filters);
  if (!result.ok) {
    return { ok: false, products: [], error: result.error };
  }
  const withAssets = await attachProductAssetUrlsToMany(supabase, result.data || []);
  return {
    ok: true,
    products: withAssets.map(toPublicProduct),
    error: null,
  };
}

function logShopProductsError(context, error, diagnostics = null) {
  const message = safeShopErrorMessage(error);
  console.warn(`[shop-products] ${context}: ${message}`, diagnostics ? JSON.stringify(diagnostics) : '');
}

async function loadPublishedShopProducts(supabase, filters = {}) {
  const { data, error } = await supabase
    .from('shop_products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    if (isShopColumnMismatch(error)) {
      const { data: fallbackData, error: fallbackError } = await supabase.from('shop_products').select('*');
      if (!fallbackError) {
        return { ok: true, data: filterPublishedShopProducts(fallbackData || [], filters), error: null, usedFallbackSelect: true };
      }
    }
    return { ok: false, data: [], error };
  }

  return {
    ok: true,
    data: filterPublishedShopProducts(data || [], filters),
    error: null,
  };
}

function filterPublishedShopProducts(rows, filters = {}) {
  let products = (rows || []).map(normalizeShopProductRow).filter(productIsPublished);

  if (filters.featured) products = products.filter(productIsFeatured);
  if (filters.level) products = products.filter((product) => product.level === filters.level);
  if (filters.subject) products = products.filter((product) => product.subject === filters.subject);
  if (filters.examBoard) products = products.filter((product) => product.exam_board === filters.examBoard);
  if (filters.productType) products = products.filter((product) => product.product_type === filters.productType);
  if (filters.productKind) products = products.filter((product) => product.product_kind === filters.productKind);

  return products;
}

export async function handleShopPublicRequest(req, res) {
  const kind = shopKind(req);
  const config = shopSupabaseConfig();
  const check = req.query?.check === '1' || req.query?.check === 'true';
  if (!config.supabaseUrl || !config.serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for shop.' });
  }
  const supabase = createClient(config.supabaseUrl, config.serviceRoleKey);
  let obsoleteSeedCleanup = null;
  let specialisedCellsFix = null;
  let unit1Ensure = null;
  if (kind === 'shop-products') {
    obsoleteSeedCleanup = await deleteObsoleteSeededUnit1Products(supabase);
    specialisedCellsFix = await correctSpecialisedCellsClassification(supabase);
    const wantsEnsure = req.query?.ensure_unit1 === '1' || req.query?.ensure_unit1 === 'true';
    if (wantsEnsure) {
      try {
        unit1Ensure = await ensureMissingUnit1ShopProducts(supabase, { maxCreate: 10 });
      } catch (err) {
        unit1Ensure = { ok: false, error: safeShopErrorMessage(err) };
      }
    }
  }

  if (kind === 'shop-order') {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const sessionId = safeTrim(req.query?.session_id || req.query?.sessionId, 120);
    if (!sessionId) return res.status(400).json({ error: 'Session ID is required.' });
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return res.status(500).json({ error: 'Order lookup is not configured.' });
    try {
      const stripe = new Stripe(secretKey);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') return res.status(403).json({ error: 'Payment not completed.' });
      const { data: order, error } = await supabase.from('shop_orders').select('*').eq('stripe_session_id', sessionId).maybeSingle();
      if (error && !isMissingShopTable(error)) return res.status(500).json({ error: error.message || 'Failed to load order.' });
      let items = order?.items;
      if (!Array.isArray(items) || !items.length) {
        try { items = JSON.parse(session.metadata?.items_json || '[]'); } catch { items = []; }
      }
      return res.status(200).json({
        ok: true,
        order: {
          stripe_session_id: sessionId,
          customer_email: order?.customer_email || session.customer_email || session.metadata?.customer_email || null,
          customer_name: order?.customer_name || session.metadata?.customer_name || null,
          items,
          total_pence: order?.total_pence || session.amount_total || 0,
          payment_status: 'paid',
          has_digital: order?.has_digital ?? session.metadata?.has_digital === 'true',
          has_physical: order?.has_physical ?? session.metadata?.has_physical === 'true',
        },
      });
    } catch (err) {
      return res.status(500).json({ error: err?.message || 'Failed to load order.' });
    }
  }

  if (kind === 'shop-download') {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) return res.status(500).json({ error: 'Download service is not configured.' });
    const body = parseRequestBody(req.body) || {};
    const sessionId = safeTrim(body.session_id || body.sessionId, 120);
    const productId = safeTrim(body.product_id || body.productId, 80);
    const customerEmail = safeTrim(body.email, 160).toLowerCase();
    if (!sessionId || !productId || !customerEmail) {
      return res.status(400).json({ error: 'Session, product and email are required.' });
    }
    try {
      const stripe = new Stripe(secretKey);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') return res.status(403).json({ error: 'Payment has not been completed for this order.' });
      const sessionEmail = String(session.customer_email || session.metadata?.customer_email || '').toLowerCase();
      if (sessionEmail !== customerEmail) return res.status(403).json({ error: 'This download link does not match your email address.' });
      const { data: order } = await supabase.from('shop_orders').select('items').eq('stripe_session_id', sessionId).maybeSingle();
      const items = Array.isArray(order?.items) ? order.items : JSON.parse(session.metadata?.items_json || '[]');
      const line = items.find((item) => String(item.product_id) === String(productId));
      if (!line || !line.is_digital) return res.status(404).json({ error: 'Digital download not found for this order.' });
      const { data: product } = await supabase.from('shop_products').select('id, title, download_path, product_kind').eq('id', productId).maybeSingle();
      if (!product?.download_path || product.product_kind !== 'digital') return res.status(404).json({ error: 'Download file not available.' });
      const downloadUrl = await signedShopAssetUrl(supabase, product.download_path, 900);
      if (!downloadUrl) return res.status(500).json({ error: 'Could not create a secure download link.' });
      return res.status(200).json({ ok: true, title: product.title, download_url: downloadUrl, expires_in_seconds: 900, bucket: SHOP_STORAGE_BUCKET });
    } catch (err) {
      return res.status(500).json({ error: err?.message || 'Failed to prepare download.' });
    }
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const slug = safeTrim(req.query?.slug, 80);
    const featured = req.query?.featured === '1' || req.query?.featured === 'true';
    const search = safeTrim(req.query?.q, 120);
    const level = safeTrim(req.query?.level, 40);
    const subject = safeTrim(req.query?.subject, 80);
    const examBoard = safeTrim(req.query?.exam_board || req.query?.examBoard, 40);
    const productType = safeTrim(req.query?.product_type || req.query?.productType, 40);
    const productKind = safeTrim(req.query?.product_kind || req.query?.productKind, 20);

    if (check) {
      const diagnostics = await runShopProductsDiagnostics(supabase, config);
      const listed = await buildPublicShopProductsResponse(supabase);
      logShopProductsError('diagnostics', diagnostics.error ? { message: diagnostics.error, code: diagnostics.errorCode } : null, diagnostics);
      return shopProductsResponse(res, {
        products: listed.products,
        setupRequired: diagnostics.setupRequired,
        diagnostics: {
          ...diagnostics,
          productsReturned: listed.products.length,
          listError: listed.ok ? null : safeShopErrorMessage(listed.error),
          obsoleteSeedCleanup: obsoleteSeedCleanup
            ? {
                deletedIds: obsoleteSeedCleanup.deletedIds || [],
                error: obsoleteSeedCleanup.error ? safeShopErrorMessage(obsoleteSeedCleanup.error) : null,
              }
            : null,
        },
      }, { check: true });
    }

    if (slug) {
      const { data, error } = await supabase.from('shop_products').select('*').eq('slug', slug).maybeSingle();
      if (error) {
        logShopProductsError('single-product', error);
        if (isMissingShopTable(error)) {
          return shopProductsResponse(res, { product: null, setupRequired: true });
        }
        if (isShopSchemaCacheStale(error)) {
          return shopProductsResponse(res, {
            product: null,
            setupRequired: false,
            schemaCacheStale: true,
            error: safeShopErrorMessage(error),
          });
        }
        return res.status(500).json({ error: safeShopErrorMessage(error) });
      }
      const product = normalizeShopProductRow(data);
      if (!product || !productIsPublished(product)) return res.status(404).json({ error: 'Product not found.' });
      const withAssets = await attachProductAssetUrls(supabase, product);
      return res.status(200).json({ ok: true, product: toPublicProduct(withAssets) });
    }

    const result = await loadPublishedShopProducts(supabase, {
      featured,
      level,
      subject,
      examBoard,
      productType,
      productKind,
    });

    if (!result.ok) {
      const { error } = result;
      logShopProductsError('list-products', error);
      if (isMissingShopTable(error)) {
        return shopProductsResponse(res, { products: [], setupRequired: true });
      }
      if (isShopSchemaCacheStale(error)) {
        return shopProductsResponse(res, {
          products: [],
          setupRequired: false,
          schemaCacheStale: true,
          error: safeShopErrorMessage(error),
        });
      }
      return res.status(500).json({
        error: safeShopErrorMessage(error),
        setupReason: shopSetupReason(error),
        missingColumn: missingShopColumnName(error),
      });
    }

    const filtered = (result.data || []).filter((product) => matchesShopSearch(product, search));
    const withAssets = await attachProductAssetUrlsToMany(supabase, filtered);
    const extra = {};
    if (unit1Ensure) {
      extra.unit1Ensure = {
        ok: unit1Ensure.ok !== false,
        created: unit1Ensure.created || 0,
        updated: unit1Ensure.updated || 0,
        skipped: unit1Ensure.skipped || 0,
        reason: unit1Ensure.reason || null,
        error: unit1Ensure.error || null,
      };
    }
    if (specialisedCellsFix?.updated) extra.specialisedCellsFixed = true;
    return shopProductsResponse(res, {
      products: withAssets.map(toPublicProduct),
      setupRequired: false,
      ...extra,
    });
  } catch (err) {
    logShopProductsError('unexpected', err);
    return res.status(500).json({ error: safeShopErrorMessage(err) });
  }
}

async function uploadBase64File(supabase, { folder, filename, contentType, base64 }) {
  const buffer = Buffer.from(base64, 'base64');
  if (!buffer.length) return { ok: false, error: 'Uploaded file is empty.' };
  if (buffer.length > 25 * 1024 * 1024) return { ok: false, error: 'File is too large (max 25 MB).' };
  const safeName = safeTrim(filename, 120).replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 80) || 'file';
  const path = `${folder}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(SHOP_STORAGE_BUCKET).upload(path, buffer, {
    contentType: contentType || 'application/octet-stream',
    upsert: false,
  });
  if (error) return { ok: false, error: error.message || 'Upload failed.' };
  return { ok: true, path };
}

export function wantsShopAdminRequest(req, body) {
  const scope = safeTrim(req.query?.scope, 40);
  const url = String(req.url || '');
  const action = safeTrim(body?.action, 30);
  return scope === 'shop' || scope === 'shop-orders' || url.includes('/api/admin-shop')
    || [
      'shop-list',
      'shop-create',
      'shop-update',
      'shop-delete',
      'shop-upload',
      'shop-orders',
      'shop-copy-from-resource',
      'shop-copy-from-resources',
    ].includes(action);
}

export async function handleShopAdminRequest(req, res, body, supabase) {
  const scope = safeTrim(req.query?.scope, 40);
  const action = safeTrim(body.action, 30) || (scope === 'shop-orders' ? 'shop-orders' : 'shop-list');

  if (action === 'shop-orders' || scope === 'shop-orders') {
    const { data, error } = await supabase.from('shop_orders').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) {
      if (isMissingShopTable(error)) return res.status(200).json({ ok: true, orders: [], setupRequired: true });
      throw error;
    }
    return res.status(200).json({ ok: true, orders: data || [] });
  }

  if (action === 'shop-upload' || action === 'upload') {
    const folder = safeTrim(body.folder, 20);
    if (!['images', 'previews', 'downloads'].includes(folder)) return res.status(400).json({ error: 'Invalid upload folder.' });
    const upload = await uploadBase64File(supabase, {
      folder,
      filename: body.filename,
      contentType: body.contentType,
      base64: body.base64,
    });
    if (!upload.ok) return res.status(400).json({ error: upload.error });
    const url = await signedShopAssetUrl(supabase, upload.path, 3600);
    return res.status(200).json({ ok: true, path: upload.path, url });
  }

  if (action === 'shop-list' || action === 'list') {
    await deleteObsoleteSeededUnit1Products(supabase);
    await correctSpecialisedCellsClassification(supabase);
    const { data, error } = await supabase.from('shop_products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) {
      if (isMissingShopTable(error)) return res.status(200).json({ ok: true, products: [], setupRequired: true });
      throw error;
    }
    const withAssets = await attachProductAssetUrlsToMany(supabase, data || [], { includeDownload: true });
    return res.status(200).json({
      ok: true,
      products: withAssets.map((product) => toAdminProduct(product)),
    });
  }

  if (action === 'shop-create' || action === 'create') {
    const normalized = normalizeProductInput(body.product || body);
    if (!normalized.ok) return res.status(400).json({ error: normalized.error });
    const fields = {
      ...normalized.fields,
      slug: normalized.fields.slug || slugifyProductTitle(normalized.fields.title),
      is_featured: normalized.fields.is_featured ?? false,
      featured: normalized.fields.featured ?? normalized.fields.is_featured ?? false,
      is_published: normalized.fields.is_published ?? false,
      published: normalized.fields.published ?? normalized.fields.is_published ?? false,
      sort_order: normalized.fields.sort_order ?? 0,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await persistShopProductRow(supabase, { mode: 'insert', fields });
    if (error) throw error;
    const withAssets = await attachProductAssetUrls(supabase, data, { includeDownload: true });
    return res.status(200).json({ ok: true, product: toAdminProduct(withAssets) });
  }

  if (action === 'shop-update' || action === 'update') {
    const id = safeTrim(body.id || body.product?.id, 80);
    if (!id) return res.status(400).json({ error: 'Product ID is required.' });
    const { data: existing, error: loadError } = await supabase.from('shop_products').select('*').eq('id', id).maybeSingle();
    if (loadError) throw loadError;
    if (!existing) return res.status(404).json({ error: 'Product not found.' });
    const incoming = body.product || body;
    const merged = applyShopProductUpdate(existing, incoming, {
      clear_image: Boolean(incoming.clear_image || body.clear_image),
      clear_preview: Boolean(incoming.clear_preview || body.clear_preview),
      clear_download: Boolean(incoming.clear_download || body.clear_download),
    });
    if (!merged.ok) return res.status(400).json({ error: merged.error });
    if (merged.slugChanged) {
      const { data: clash, error: clashError } = await supabase
        .from('shop_products')
        .select('id')
        .eq('slug', merged.fields.slug)
        .neq('id', id)
        .maybeSingle();
      if (clashError) throw clashError;
      if (clash?.id) return res.status(400).json({ error: 'That slug is already used by another product.' });
    }
    const { data, error } = await persistShopProductRow(supabase, { mode: 'update', id, fields: merged.fields });
    if (error) {
      if (/duplicate key|unique/i.test(error.message || '')) {
        return res.status(400).json({ error: 'That slug is already used by another product.' });
      }
      throw error;
    }
    const withAssets = await attachProductAssetUrls(supabase, data, { includeDownload: true });
    return res.status(200).json({ ok: true, product: toAdminProduct(withAssets) });
  }

  if (action === 'shop-delete' || action === 'delete') {
    const id = safeTrim(body.id, 80);
    if (!id) return res.status(400).json({ error: 'Product ID is required.' });
    const { data: existing, error: loadError } = await supabase.from('shop_products').select('id, title').eq('id', id).maybeSingle();
    if (loadError) throw loadError;
    if (!existing) return res.status(404).json({ error: 'Product not found.' });
    const { error } = await supabase.from('shop_products').delete().eq('id', id);
    if (error) throw error;
    const { data: stillThere, error: confirmError } = await supabase.from('shop_products').select('id').eq('id', id).maybeSingle();
    if (confirmError) throw confirmError;
    if (stillThere?.id) return res.status(500).json({ error: 'Product row was not deleted.' });
    return res.status(200).json({ ok: true, deletedId: id });
  }

  if (action === 'shop-copy-from-resource') {
    const result = await copyResourceToShop(supabase, {
      resourceId: body.resource_id ?? body.resourceId ?? body.id,
      price_pence: body.price_pence ?? body.pricePence,
      product_type: body.product_type,
      publish: body.publish !== false && body.is_published !== false,
    });
    if (!result.ok && !result.skipped) {
      return res.status(result.status || 400).json({ error: result.error || 'Copy to Shop failed.' });
    }
    return res.status(200).json(result);
  }

  if (action === 'shop-copy-from-resources') {
    const items = Array.isArray(body.items)
      ? body.items
      : (Array.isArray(body.resource_ids) ? body.resource_ids.map((resourceId) => ({
        resource_id: resourceId,
        price_pence: body.price_pence ?? body.pricePence,
        product_type: body.product_type,
      })) : []);
    const result = await copyResourcesToShopBulk(supabase, items);
    if (!result.ok && result.failed === items.length) {
      return res.status(400).json({
        error: result.error || result.results?.[0]?.error || 'Copy to Shop failed for all selected resources.',
        ...result,
      });
    }
    return res.status(200).json(result);
  }

  return res.status(400).json({ error: 'Unknown shop admin action.' });
}

export async function handleShopCheckoutRequest(req, res, body) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Payment is not configured yet. Please contact info@jdscience.co.uk.' });
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for shop checkout.' });
  }

  const customerName = safeTrim(body.name, 120);
  const customerEmail = safeTrim(body.email, 160).toLowerCase();
  const shippingPhone = safeTrim(body.shipping_phone || body.phone, 40);
  const basketItems = parseBasketItems(body);

  if (!customerName || !customerEmail) return res.status(400).json({ error: 'Name and email are required.' });
  if (!hasAcceptedTerms(body)) return res.status(400).json({ error: TERMS_ACCEPTANCE_ERROR });
  if (!basketItems.length) return res.status(400).json({ error: 'Your basket is empty.' });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const products = await loadPublishedProductsByIds(supabase, basketItems.map((item) => item.product_id));
  const externalItem = products.find((product) => checkoutRejectionForProduct(product));
  if (externalItem) {
    return res.status(400).json({ error: EXTERNAL_CHECKOUT_ERROR });
  }
  const order = buildOrderLineItems(products, basketItems);
  if (!order.ok) return res.status(400).json({ error: order.error });

  const shipping = order.has_physical ? {
    shipping_name: safeTrim(body.shipping_name, 120),
    shipping_line1: safeTrim(body.shipping_line1, 160),
    shipping_line2: safeTrim(body.shipping_line2, 160),
    shipping_city: safeTrim(body.shipping_city, 80),
    shipping_postcode: safeTrim(body.shipping_postcode, 20),
    shipping_country: safeTrim(body.shipping_country, 40) || 'GB',
  } : {};

  if (order.has_physical && (!shipping.shipping_name || !shipping.shipping_line1 || !shipping.shipping_city || !shipping.shipping_postcode)) {
    return res.status(400).json({ error: 'Delivery name and address are required for physical products.' });
  }

  const stripe = new Stripe(secretKey);
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = (process.env.SITE_URL || (host ? `${proto}://${host}` : '')).replace(/\/$/, '');

  const sessionConfig = {
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: order.lines.map((line) => ({
      price_data: {
        currency: 'gbp',
        product_data: {
          name: line.title,
          description: line.is_digital ? 'Digital download' : 'Physical product',
        },
        unit_amount: line.unit_price_pence,
      },
      quantity: line.quantity,
    })),
    mode: 'payment',
    success_url: `${baseUrl}/shop?shop_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/shop?shop_canceled=true`,
    metadata: {
      order_type: 'shop',
      customer_name: customerName,
      customer_email: customerEmail,
      shipping_phone: shippingPhone || '',
      items_json: JSON.stringify(order.lines).slice(0, 4500),
      subtotal_pence: String(order.subtotal_pence),
      total_pence: String(order.total_pence),
      has_physical: order.has_physical ? 'true' : 'false',
      has_digital: order.has_digital ? 'true' : 'false',
      shipping_name: shipping.shipping_name || '',
      shipping_line1: shipping.shipping_line1 || '',
      shipping_line2: shipping.shipping_line2 || '',
      shipping_city: shipping.shipping_city || '',
      shipping_postcode: shipping.shipping_postcode || '',
      shipping_country: shipping.shipping_country || '',
      terms_accepted: 'true',
      terms_version: String(body.terms_version || TERMS_VERSION).slice(0, 20),
    },
  };
  if (order.has_physical) sessionConfig.shipping_address_collection = { allowed_countries: ['GB'] };

  const session = await stripe.checkout.sessions.create(sessionConfig);
  const { error: insertError } = await supabase.from('shop_orders').insert([{
    stripe_session_id: session.id,
    customer_email: customerEmail,
    customer_name: customerName,
    shipping_phone: shippingPhone || null,
    shipping_name: shipping.shipping_name || null,
    shipping_line1: shipping.shipping_line1 || null,
    shipping_line2: shipping.shipping_line2 || null,
    shipping_city: shipping.shipping_city || null,
    shipping_postcode: shipping.shipping_postcode || null,
    shipping_country: shipping.shipping_country || null,
    items: order.lines,
    subtotal_pence: order.subtotal_pence,
    total_pence: order.total_pence,
    payment_status: 'pending',
    has_physical: order.has_physical,
    has_digital: order.has_digital,
    updated_at: new Date().toISOString(),
  }]);
  if (insertError && !isMissingShopTable(insertError)) console.error('shop_orders insert failed:', insertError);
  return res.status(200).json({ url: session.url });
}

export function isShopCheckoutRequest(req, body) {
  const checkout = safeTrim(req.query?.checkout, 20);
  const url = String(req.url || '');
  return checkout === 'shop' || url.includes('/api/create-shop-checkout') || Array.isArray(body?.items);
}
