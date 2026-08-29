import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import {
  PUBLIC_PRODUCT_SELECT,
  SHOP_STORAGE_BUCKET,
  attachProductAssetUrls,
  attachProductAssetUrlsToMany,
  buildOrderLineItems,
  isMissingShopTable,
  loadPublishedProductsByIds,
  matchesShopSearch,
  normalizeProductInput,
  parseBasketItems,
  signedShopAssetUrl,
  slugifyProductTitle,
  toPublicProduct,
} from './shop.js';
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

export async function handleShopPublicRequest(req, res) {
  const kind = shopKind(req);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for shop.' });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);

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

    if (slug) {
      const { data, error } = await supabase.from('shop_products').select(PUBLIC_PRODUCT_SELECT).eq('is_published', true).eq('slug', slug).maybeSingle();
      if (error) {
        if (isMissingShopTable(error)) return res.status(200).json({ ok: true, product: null, setupRequired: true });
        return res.status(500).json({ error: error.message || 'Failed to load product.' });
      }
      if (!data) return res.status(404).json({ error: 'Product not found.' });
      const withAssets = await attachProductAssetUrls(supabase, data);
      return res.status(200).json({ ok: true, product: toPublicProduct(withAssets) });
    }

    let query = supabase.from('shop_products').select(PUBLIC_PRODUCT_SELECT).eq('is_published', true).order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (featured) query = query.eq('is_featured', true);
    if (level) query = query.eq('level', level);
    if (subject) query = query.eq('subject', subject);
    if (examBoard) query = query.eq('exam_board', examBoard);
    if (productType) query = query.eq('product_type', productType);
    if (productKind) query = query.eq('product_kind', productKind);
    const { data, error } = await query;
    if (error) {
      if (isMissingShopTable(error)) return res.status(200).json({ ok: true, products: [], setupRequired: true });
      return res.status(500).json({ error: error.message || 'Failed to load products.' });
    }
    const filtered = (data || []).filter((product) => matchesShopSearch(product, search));
    const withAssets = await attachProductAssetUrlsToMany(supabase, filtered);
    return res.status(200).json({ ok: true, products: withAssets.map(toPublicProduct) });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to load shop products.' });
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
    || ['shop-list', 'shop-create', 'shop-update', 'shop-delete', 'shop-upload', 'shop-orders'].includes(action);
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
    return res.status(200).json({ ok: true, path: upload.path });
  }

  if (action === 'shop-list' || action === 'list') {
    const { data, error } = await supabase.from('shop_products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false });
    if (error) {
      if (isMissingShopTable(error)) return res.status(200).json({ ok: true, products: [], setupRequired: true });
      throw error;
    }
    const withAssets = await attachProductAssetUrlsToMany(supabase, data || [], { includeDownload: true });
    return res.status(200).json({ ok: true, products: withAssets });
  }

  if (action === 'shop-create' || action === 'create') {
    const normalized = normalizeProductInput(body.product || body);
    if (!normalized.ok) return res.status(400).json({ error: normalized.error });
    const fields = {
      ...normalized.fields,
      slug: normalized.fields.slug || slugifyProductTitle(normalized.fields.title),
      is_featured: normalized.fields.is_featured ?? false,
      is_published: normalized.fields.is_published ?? false,
      sort_order: normalized.fields.sort_order ?? 0,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('shop_products').insert([fields]).select('*').single();
    if (error) throw error;
    const withAssets = await attachProductAssetUrls(supabase, data, { includeDownload: true });
    return res.status(200).json({ ok: true, product: withAssets });
  }

  if (action === 'shop-update' || action === 'update') {
    const normalized = normalizeProductInput(body.product || body, { partial: true });
    if (!normalized.ok) return res.status(400).json({ error: normalized.error });
    const id = safeTrim(body.id || body.product?.id, 80);
    if (!id) return res.status(400).json({ error: 'Product ID is required.' });
    const { data, error } = await supabase.from('shop_products').update(normalized.fields).eq('id', id).select('*').single();
    if (error) throw error;
    const withAssets = await attachProductAssetUrls(supabase, data, { includeDownload: true });
    return res.status(200).json({ ok: true, product: withAssets });
  }

  if (action === 'shop-delete' || action === 'delete') {
    const id = safeTrim(body.id, 80);
    if (!id) return res.status(400).json({ error: 'Product ID is required.' });
    const { error } = await supabase.from('shop_products').delete().eq('id', id);
    if (error) throw error;
    return res.status(200).json({ ok: true });
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
