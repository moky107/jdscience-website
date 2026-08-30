import { parseRequestBody, safeTrim, slugify as baseSlugify } from './tutors.js';
import {
  EXTERNAL_CHECKOUT_ERROR,
  checkoutRejectionForProduct,
  externalButtonLabel as purchaseExternalButtonLabel,
  isExternalProduct as purchaseIsExternalProduct,
  isExternalPurchase,
  isValidExternalUrl as purchaseIsValidExternalUrl,
  purchaseMethod,
  retailerName,
} from '../../src/shopPurchase.js';

export {
  EXTERNAL_CHECKOUT_ERROR,
  checkoutRejectionForProduct,
  isExternalPurchase,
  purchaseMethod,
  retailerName,
} from '../../src/shopPurchase.js';

export const SHOP_STORAGE_BUCKET = 'shop-products';

export const SHOP_PRODUCT_TYPES = new Set([
  'powerpoint',
  'pdf',
  'worksheet',
  'revision_notes',
  'answer_sheet',
  'practice_questions',
  'study_pack',
  'book',
  'physical_book',
  'digital',
  'digital_download',
  'bundle',
  'other',
  'stationery',
  'clothing',
  'merchandise',
]);

export const SHOP_PRODUCT_KINDS = new Set(['digital', 'physical']);

export const PUBLIC_PRODUCT_SELECT = [
  'id',
  'slug',
  'title',
  'short_description',
  'description',
  'price_pence',
  'sale_price_pence',
  'product_type',
  'level',
  'subject',
  'exam_board',
  'product_kind',
  'stock_quantity',
  'is_featured',
  'is_published',
  'image_path',
  'preview_path',
  'keywords',
  'sort_order',
  'created_at',
  'external_url',
  'external_button_label',
  'opens_external',
].join(', ');

export const EXPECTED_SHOP_PRODUCT_COLUMNS = PUBLIC_PRODUCT_SELECT.split(',').map((c) => c.trim());

export function shopSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/i)?.[1] || null;
  return { supabaseUrl, serviceRoleKey, projectRef };
}

export function safeShopErrorMessage(error) {
  return String(error?.message || error || 'Unknown shop database error').slice(0, 240);
}

export function isMissingShopTable(error) {
  const msg = safeShopErrorMessage(error).toLowerCase();
  return (
    /relation ["']?public\.shop_(products|orders)["']? does not exist/.test(msg)
    || /could not find the table ['"]public\.shop_(products|orders)['"] in the schema cache/.test(msg)
  );
}

export function isShopSchemaCacheStale(error) {
  const msg = safeShopErrorMessage(error).toLowerCase();
  return /schema cache/.test(msg) && /shop_(products|orders)/.test(msg);
}

export function isShopColumnMismatch(error) {
  const msg = safeShopErrorMessage(error).toLowerCase();
  return /column shop_(products|orders)\.[a-z0-9_]+ does not exist/.test(msg);
}

export function missingShopColumnName(error) {
  const match = safeShopErrorMessage(error).match(/column shop_(?:products|orders)\.([a-z0-9_]+) does not exist/i);
  return match?.[1] || null;
}

export function shopSetupReason(error) {
  if (!error) return null;
  if (isMissingShopTable(error)) return 'missing_table';
  if (isShopSchemaCacheStale(error)) return 'schema_cache_stale';
  if (isShopColumnMismatch(error)) return 'column_mismatch';
  return 'query_error';
}

export function isValidExternalUrl(url) {
  return purchaseIsValidExternalUrl(url);
}

export function isExternalProduct(product) {
  return purchaseIsExternalProduct(product);
}

export function externalButtonLabel(product) {
  return purchaseExternalButtonLabel(product);
}

export function productIsPublished(product) {
  if (!product) return false;
  if (product.is_published === true || product.published === true) return true;
  if (productIsFeatured(product)) return true;
  if (product.is_published === false && product.published === false) return false;
  if (product.is_published === false || product.published === false) return false;
  return false;
}

export function productIsFeatured(product) {
  if (!product) return false;
  return product.is_featured === true || product.featured === true;
}

export function normalizeShopProductRow(product) {
  if (!product) return null;
  const published = productIsPublished(product);
  const featured = productIsFeatured(product);
  return {
    ...product,
    published,
    is_published: published,
    featured,
    is_featured: featured,
    opens_external: isExternalPurchase(product),
    purchase_method: purchaseMethod(product),
    retailer_name: retailerName(product),
    show_price: product.show_price !== false,
    external_url: product.external_url || '',
    external_button_label: isExternalPurchase(product)
      ? purchaseExternalButtonLabel(product)
      : (product.external_button_label || 'Buy now'),
    product_kind: product.product_kind || 'digital',
    product_type: product.product_type || '',
  };
}

export function slugifyProductTitle(value) {
  return baseSlugify(value) || 'product';
}

export function effectivePricePence(product) {
  const base = Number(product?.price_pence);
  const sale = product?.sale_price_pence;
  if (sale != null && sale !== '' && Number(sale) >= 0 && Number(sale) < base) {
    return Number(sale);
  }
  return Number.isFinite(base) ? base : 0;
}

export function productOnSale(product) {
  const base = Number(product?.price_pence);
  const sale = product?.sale_price_pence;
  return sale != null && sale !== '' && Number(sale) >= 0 && Number(sale) < base;
}

export async function signedShopAssetUrl(supabase, path, expiresIn = 3600) {
  const normalized = safeTrim(path, 400);
  if (!normalized) return null;
  const { data, error } = await supabase.storage
    .from(SHOP_STORAGE_BUCKET)
    .createSignedUrl(normalized, expiresIn);
  if (error) return null;
  return data?.signedUrl || null;
}

export async function attachProductAssetUrls(supabase, product, { includeDownload = false } = {}) {
  if (!product) return product;
  const image_url = await signedShopAssetUrl(supabase, product.image_path, 3600);
  const preview_url = await signedShopAssetUrl(supabase, product.preview_path, 3600);
  const download_url = includeDownload
    ? await signedShopAssetUrl(supabase, product.download_path, 3600)
    : null;
  return {
    ...product,
    effective_price_pence: effectivePricePence(product),
    on_sale: productOnSale(product),
    image_url,
    preview_url,
    download_url: includeDownload ? download_url : undefined,
  };
}

export async function attachProductAssetUrlsToMany(supabase, products, options = {}) {
  return Promise.all((products || []).map((product) => attachProductAssetUrls(supabase, product, options)));
}

export function toPublicProduct(product) {
  if (!product) return null;
  const normalized = normalizeShopProductRow(product);
  const {
    download_path,
    ...rest
  } = normalized;
  return {
    ...rest,
    effective_price_pence: effectivePricePence(normalized),
    on_sale: productOnSale(normalized),
  };
}

export function toAdminProduct(product) {
  if (!product) return null;
  const normalized = normalizeShopProductRow(product);
  return {
    ...normalized,
    download_path: normalized.download_path || null,
    preview_path: normalized.preview_path || null,
    image_path: normalized.image_path || null,
    effective_price_pence: effectivePricePence(normalized),
    on_sale: productOnSale(normalized),
  };
}

function nextAssetPath(existingPath, incoming, clear) {
  if (clear) return null;
  const next = safeTrim(incoming, 400);
  if (next) return next;
  return existingPath || null;
}

export function normalizeShopKeywords(value) {
  if (value == null || value === '') return null;
  if (Array.isArray(value)) {
    const parts = value.map((item) => safeTrim(item, 80)).filter(Boolean);
    return parts.length ? parts : null;
  }
  const parts = String(value)
    .split(',')
    .map((item) => safeTrim(item, 80))
    .filter(Boolean);
  return parts.length ? parts : null;
}

export function isValidShopSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(slug || ''));
}

export function applyShopProductUpdate(existing, body = {}, options = {}) {
  if (!existing?.id) return { ok: false, error: 'Product not found.' };

  const title = body.title != null ? safeTrim(body.title, 180) : safeTrim(existing.title, 180);
  if (!title) return { ok: false, error: 'Product title is required.' };

  const requestedSlug = body.slug != null ? slugifyProductTitle(body.slug) : '';
  const slug = requestedSlug || existing.slug || slugifyProductTitle(title);
  if (!isValidShopSlug(slug)) {
    return { ok: false, error: 'Enter a valid slug using lowercase letters, numbers and hyphens.' };
  }

  const product_type = body.product_type != null ? safeTrim(body.product_type, 40) : (existing.product_type || '');
  if (product_type && !SHOP_PRODUCT_TYPES.has(product_type) && product_type !== existing.product_type) {
    return { ok: false, error: 'Choose a valid product type.' };
  }

  const product_kind = body.product_kind != null
    ? (safeTrim(body.product_kind, 20) || 'digital')
    : (existing.product_kind || 'digital');
  if (!SHOP_PRODUCT_KINDS.has(product_kind)) {
    return { ok: false, error: 'Choose digital or physical.' };
  }

  const purchaseProvided = body.purchase_method != null || body.sale_type != null || body.saleType != null || body.opens_external != null;
  const nextPurchase = purchaseProvided
    ? purchaseMethod(body)
    : purchaseMethod(existing);
  const opens_external = nextPurchase === 'external';

  const priceRaw = body.price_pence ?? body.pricePence;
  const saleRaw = body.sale_price_pence ?? body.salePricePence;
  const price_pence = priceRaw == null || priceRaw === ''
    ? Math.round(Number(existing.price_pence) || 0)
    : Math.round(Number(priceRaw));
  const sale_price_pence = saleRaw === undefined
    ? (existing.sale_price_pence ?? null)
    : (saleRaw == null || saleRaw === '' ? null : Math.round(Number(saleRaw)));
  if (!opens_external && (!Number.isFinite(price_pence) || price_pence < 0)) {
    return { ok: false, error: 'Enter a valid price.' };
  }
  if (opens_external && priceRaw != null && priceRaw !== '' && (!Number.isFinite(price_pence) || price_pence < 0)) {
    return { ok: false, error: 'Enter a valid price, or leave it blank.' };
  }
  if (sale_price_pence != null && (!Number.isFinite(sale_price_pence) || sale_price_pence < 0)) {
    return { ok: false, error: 'Enter a valid sale price, or leave it blank.' };
  }

  const stockRaw = body.stock_quantity ?? body.stockQuantity;
  const stock_quantity = stockRaw === undefined
    ? (existing.stock_quantity ?? null)
    : (stockRaw == null || stockRaw === '' ? null : Math.max(0, Math.round(Number(stockRaw))));

  const image_path = nextAssetPath(existing.image_path, body.image_path, options.clear_image);
  const preview_path = nextAssetPath(existing.preview_path, body.preview_path, options.clear_preview);
  const download_path = nextAssetPath(existing.download_path, body.download_path, options.clear_download);

  const is_featured = body.is_featured != null
    ? Boolean(body.is_featured)
    : (body.featured != null ? Boolean(body.featured) : Boolean(existing.is_featured || existing.featured));
  const is_published = body.is_published != null
    ? Boolean(body.is_published)
    : (body.published != null ? Boolean(body.published) : Boolean(existing.is_published || existing.published));

  const retailer_name = opens_external
    ? (body.retailer_name != null ? safeTrim(body.retailer_name, 80) : retailerName(existing))
    : null;
  const show_price = body.show_price != null ? Boolean(body.show_price) : (existing.show_price !== false);
  if (opens_external) {
    const external_url = body.external_url != null ? safeTrim(body.external_url, 2000) : (existing.external_url || '');
    if (!retailer_name) {
      return { ok: false, error: 'Enter the retailer name, for example Amazon.' };
    }
    if (!isValidExternalUrl(external_url)) {
      return { ok: false, error: 'External retailer products need a valid https:// URL.' };
    }
  } else if (product_kind === 'digital' && is_published && !download_path) {
    return { ok: false, error: 'Add a customer download file before publishing a digital product.' };
  } else if (product_kind === 'physical' && is_published && stock_quantity == null) {
    return { ok: false, error: 'Physical products need a stock quantity before publishing.' };
  }

  const sort_order = body.sort_order != null
    ? Math.round(Number(body.sort_order) || 0)
    : Math.round(Number(existing.sort_order) || 0);

  const fields = {
    title,
    slug,
    short_description: body.short_description != null ? safeTrim(body.short_description, 400) : (existing.short_description || ''),
    description: body.description != null ? safeTrim(body.description, 12000) : (existing.description || ''),
    price_pence,
    sale_price_pence,
    product_type: product_type || existing.product_type || 'revision_notes',
    product_kind,
    level: body.level != null ? (safeTrim(body.level, 40) || null) : (existing.level || null),
    subject: body.subject != null ? (safeTrim(body.subject, 80) || null) : (existing.subject || null),
    exam_board: body.exam_board != null ? (safeTrim(body.exam_board, 40) || null) : (existing.exam_board || null),
    keywords: body.keywords !== undefined ? normalizeShopKeywords(body.keywords) : normalizeShopKeywords(existing.keywords),
    image_path,
    preview_path,
    download_path,
    stock_quantity: product_kind === 'physical' && !opens_external ? stock_quantity : (existing.stock_quantity ?? null),
    is_featured,
    featured: is_featured,
    is_published,
    published: is_published,
    sort_order,
    opens_external,
    purchase_method: nextPurchase,
    retailer_name: retailer_name || null,
    show_price,
    external_url: opens_external
      ? (body.external_url != null ? safeTrim(body.external_url, 2000) : (existing.external_url || null))
      : (existing.external_url || null),
    external_button_label: opens_external
      ? purchaseExternalButtonLabel({ retailer_name, external_button_label: body.external_button_label })
      : (existing.external_button_label || 'Buy now'),
    updated_at: new Date().toISOString(),
  };

  return {
    ok: true,
    fields,
    slugChanged: slug !== existing.slug,
    previousSlug: existing.slug || '',
  };
}

export function normalizeProductInput(body = {}, { partial = false } = {}) {
  const title = safeTrim(body.title, 180);
  const short_description = safeTrim(body.short_description, 400);
  const description = safeTrim(body.description, 12000);
  const product_type = safeTrim(body.product_type, 40);
  const product_kind = safeTrim(body.product_kind, 20) || 'digital';
  const level = safeTrim(body.level, 40) || null;
  const subject = safeTrim(body.subject, 80) || null;
  const exam_board = safeTrim(body.exam_board, 40) || null;
  const keywords = normalizeShopKeywords(body.keywords);
  const image_path = safeTrim(body.image_path, 400) || null;
  const preview_path = safeTrim(body.preview_path, 400) || null;
  const download_path = safeTrim(body.download_path, 400) || null;
  const slug = safeTrim(body.slug, 80) || slugifyProductTitle(title);
  const purchaseProvided = body.purchase_method != null || body.sale_type != null || body.saleType != null || body.opens_external != null;
  const nextPurchase = purchaseProvided ? purchaseMethod(body) : (partial ? undefined : 'jdscience');
  const opens_external = nextPurchase == null ? undefined : nextPurchase === 'external';
  const retailer_name = body.retailer_name != null ? safeTrim(body.retailer_name, 80) : undefined;
  const show_price = body.show_price != null ? Boolean(body.show_price) : undefined;
  const external_url = opens_external === true
    ? safeTrim(body.external_url, 2000)
    : (opens_external === false ? null : safeTrim(body.external_url, 2000) || undefined);
  const external_button_label = opens_external === true
    ? purchaseExternalButtonLabel({ retailer_name, external_button_label: body.external_button_label })
    : (body.external_button_label != null ? (safeTrim(body.external_button_label, 80) || 'Buy now') : undefined);

  const priceRaw = body.price_pence ?? body.pricePence;
  const saleRaw = body.sale_price_pence ?? body.salePricePence;
  const price_pence = priceRaw == null || priceRaw === '' ? null : Math.round(Number(priceRaw));
  const sale_price_pence = saleRaw == null || saleRaw === '' ? null : Math.round(Number(saleRaw));

  const stockRaw = body.stock_quantity ?? body.stockQuantity;
  const stock_quantity = stockRaw == null || stockRaw === '' ? null : Math.max(0, Math.round(Number(stockRaw)));

  const is_featured = body.is_featured != null
    ? Boolean(body.is_featured)
    : (body.featured != null ? Boolean(body.featured) : undefined);
  const is_published = body.is_published != null
    ? Boolean(body.is_published)
    : (body.published != null ? Boolean(body.published) : undefined);
  const sort_order = body.sort_order != null ? Math.round(Number(body.sort_order) || 0) : undefined;

  if (!partial) {
    if (!title) return { ok: false, error: 'Product title is required.' };
    if (!SHOP_PRODUCT_TYPES.has(product_type)) {
      return { ok: false, error: 'Choose a valid product type.' };
    }
    if (opens_external) {
      if (!retailer_name) {
        return { ok: false, error: 'Enter the retailer name, for example Amazon.' };
      }
      if (!external_url || !isValidExternalUrl(external_url)) {
        return { ok: false, error: 'External retailer products need a valid https:// URL.' };
      }
      if (price_pence != null && price_pence !== '' && (!Number.isFinite(price_pence) || price_pence < 0)) {
        return { ok: false, error: 'Enter a valid price, or leave it blank.' };
      }
    } else {
      if (!Number.isFinite(price_pence) || price_pence < 0) {
        return { ok: false, error: 'Enter a valid price in pence.' };
      }
      if (!SHOP_PRODUCT_KINDS.has(product_kind)) {
        return { ok: false, error: 'Choose digital or physical.' };
      }
      if (product_kind === 'digital' && !download_path) {
        return { ok: false, error: 'Digital products need a downloadable file path.' };
      }
      if (product_kind === 'physical' && stock_quantity == null) {
        return { ok: false, error: 'Physical products need a stock quantity.' };
      }
    }
  } else if (opens_external === true) {
    if (!external_url || !isValidExternalUrl(external_url)) {
      return { ok: false, error: 'External link products need a valid https:// URL.' };
    }
  } else if (external_url && !isValidExternalUrl(external_url)) {
    return { ok: false, error: 'External link products need a valid https:// URL.' };
  }

  const fields = {
    slug,
    title,
    short_description,
    description,
    price_pence: price_pence == null || price_pence === '' ? 0 : price_pence,
    sale_price_pence,
    product_type,
    product_kind: opens_external === true ? (product_kind || 'digital') : product_kind,
    level,
    subject,
    exam_board,
    keywords,
    image_path,
    preview_path,
    download_path: opens_external === true || product_kind === 'physical' ? null : download_path,
    stock_quantity: opens_external === true || product_kind === 'digital' ? null : stock_quantity,
    updated_at: new Date().toISOString(),
  };

  if (nextPurchase) fields.purchase_method = nextPurchase;
  if (retailer_name !== undefined) fields.retailer_name = retailer_name || null;
  if (show_price !== undefined) fields.show_price = show_price;
  if (opens_external !== undefined) fields.opens_external = opens_external;
  if (opens_external === true) {
    fields.external_url = external_url;
    fields.external_button_label = external_button_label || 'Buy now';
  } else if (opens_external === false) {
    fields.external_url = null;
    fields.external_button_label = 'Buy now';
  } else if (external_url !== undefined) {
    fields.external_url = external_url || null;
  }
  if (external_button_label !== undefined && opens_external !== false) {
    fields.external_button_label = external_button_label;
  }

  if (is_featured !== undefined) {
    fields.is_featured = is_featured;
    fields.featured = is_featured;
    if (is_featured && is_published === undefined) {
      fields.is_published = true;
      fields.published = true;
    }
  }
  if (is_published !== undefined) {
    fields.is_published = is_published;
    fields.published = is_published;
  }
  if (sort_order !== undefined) fields.sort_order = sort_order;

  return { ok: true, fields };
}

export async function persistShopProductRow(supabase, { mode, id, fields }) {
  let payload = { ...fields };
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const query = mode === 'insert'
      ? supabase.from('shop_products').insert([payload]).select('*').single()
      : supabase.from('shop_products').update(payload).eq('id', id).select('*').single();
    const { data, error } = await query;
    if (!error) return { data, error: null };
    if (/keywords|array literal/i.test(error.message || '') && 'keywords' in payload) {
      const { keywords, ...rest } = payload;
      payload = rest;
      continue;
    }
    if (isShopColumnMismatch(error)) {
      const missing = missingShopColumnName(error);
      if (missing && missing in payload) {
        const { [missing]: _dropped, ...rest } = payload;
        payload = rest;
        continue;
      }
    }
    return { data: null, error };
  }
  return { data: null, error: new Error('Could not save shop product.') };
}

export function parseBasketItems(body) {
  const parsed = parseRequestBody(body);
  const items = Array.isArray(parsed?.items) ? parsed.items : [];
  return items
    .map((item) => ({
      product_id: safeTrim(item.product_id || item.productId, 80),
      quantity: Math.max(1, Math.min(99, Math.round(Number(item.quantity) || 1))),
    }))
    .filter((item) => item.product_id);
}

export async function loadPublishedProductsByIds(supabase, ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return [];
  const { data, error } = await supabase
    .from('shop_products')
    .select('*')
    .in('id', uniqueIds);
  if (error) throw error;
  return (data || [])
    .map(normalizeShopProductRow)
    .filter(productIsPublished);
}

export function buildOrderLineItems(products, basketItems) {
  const byId = new Map(products.map((product) => [String(product.id), product]));
  const lines = [];
  let subtotal = 0;
  let hasPhysical = false;
  let hasDigital = false;

  for (const item of basketItems) {
    const product = byId.get(String(item.product_id));
    if (!product) {
      return { ok: false, error: 'One or more products are no longer available.' };
    }
    const blocked = checkoutRejectionForProduct(product);
    if (blocked) {
      return { ok: false, error: blocked };
    }
    if (product.product_kind === 'physical') {
      hasPhysical = true;
      const stock = Number(product.stock_quantity);
      if (!Number.isFinite(stock) || stock < item.quantity) {
        return { ok: false, error: `${product.title} is out of stock.` };
      }
    } else {
      hasDigital = true;
      if (!product.download_path) {
        return { ok: false, error: `${product.title} is missing its download file.` };
      }
    }
    const unitPrice = effectivePricePence(product);
    subtotal += unitPrice * item.quantity;
    lines.push({
      product_id: product.id,
      slug: product.slug,
      title: product.title,
      quantity: item.quantity,
      unit_price_pence: unitPrice,
      line_total_pence: unitPrice * item.quantity,
      product_kind: product.product_kind,
      product_type: product.product_type,
      is_digital: product.product_kind === 'digital',
    });
  }

  if (!lines.length) {
    return { ok: false, error: 'Your basket is empty.' };
  }

  return {
    ok: true,
    lines,
    subtotal_pence: subtotal,
    total_pence: subtotal,
    has_physical: hasPhysical,
    has_digital: hasDigital,
  };
}

export function safeEqual(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  if (sa.length !== sb.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i += 1) diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return diff === 0;
}

export function matchesShopSearch(product, query) {
  const q = safeTrim(query, 120).toLowerCase();
  if (!q) return true;
  const haystack = [
    product.title,
    product.short_description,
    product.subject,
    product.level,
    product.exam_board,
    product.keywords,
    product.product_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

/** Live replacement product. Never delete or rewrite this row from seed/cleanup. */
export const PROTECTED_BTEC_SPECIALISED_CELLS_ID = '53fa4258-a265-44f9-b605-a6bf512a2f03';
/** Live Amazon book. Never delete or rewrite this row from seed/cleanup. */
export const PROTECTED_CHEMISTRY_COMPANION_ID = '503d4625-94df-4d80-b6d0-7c06cebdf693';

export const SPECIALISED_CELLS_LEVEL = 'BTEC Level 3';
export const SPECIALISED_CELLS_EXAM_BOARD = 'Pearson';

export function specialisedCellsNeedsClassificationFix(row) {
  if (!row || row.id !== PROTECTED_BTEC_SPECIALISED_CELLS_ID) return false;
  return row.level !== SPECIALISED_CELLS_LEVEL || row.exam_board !== SPECIALISED_CELLS_EXAM_BOARD;
}

export async function correctSpecialisedCellsClassification(supabase) {
  if (!supabase) return { updated: false, error: null };
  const { data, error } = await supabase
    .from('shop_products')
    .select('id, level, exam_board, keywords, title')
    .eq('id', PROTECTED_BTEC_SPECIALISED_CELLS_ID)
    .maybeSingle();
  if (error) return { updated: false, error };
  if (!data || !specialisedCellsNeedsClassificationFix(data)) return { updated: false, error: null };
  const { error: updateError } = await supabase
    .from('shop_products')
    .update({
      level: SPECIALISED_CELLS_LEVEL,
      exam_board: SPECIALISED_CELLS_EXAM_BOARD,
      updated_at: new Date().toISOString(),
    })
    .eq('id', PROTECTED_BTEC_SPECIALISED_CELLS_ID);
  if (updateError) return { updated: false, error: updateError };
  return { updated: true, error: null };
}

export const OBSOLETE_SEEDED_UNIT1_TITLE = 'Unit 1 specialise cells';
export const OBSOLETE_SEEDED_UNIT1_SLUG = 'unit-1-specialise-cells';

export function isObsoleteSeededUnit1Product(row) {
  if (!row) return false;
  if (row.id === PROTECTED_BTEC_SPECIALISED_CELLS_ID || row.id === PROTECTED_CHEMISTRY_COMPANION_ID) return false;
  return row.title === OBSOLETE_SEEDED_UNIT1_TITLE && row.slug === OBSOLETE_SEEDED_UNIT1_SLUG;
}

export async function deleteObsoleteSeededUnit1Products(supabase) {
  if (!supabase) return { deletedIds: [], error: null };
  const { data, error } = await supabase
    .from('shop_products')
    .select('id, title, slug')
    .eq('title', OBSOLETE_SEEDED_UNIT1_TITLE)
    .eq('slug', OBSOLETE_SEEDED_UNIT1_SLUG);
  if (error) return { deletedIds: [], error };
  const deletedIds = [];
  for (const row of data || []) {
    if (!isObsoleteSeededUnit1Product(row)) continue;
    const { error: deleteError } = await supabase.from('shop_products').delete().eq('id', row.id);
    if (deleteError) return { deletedIds, error: deleteError };
    deletedIds.push(row.id);
  }
  return { deletedIds, error: null };
}
