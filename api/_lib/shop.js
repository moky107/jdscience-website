import { parseRequestBody, safeTrim, slugify as baseSlugify } from './tutors.js';

export const SHOP_STORAGE_BUCKET = 'shop-products';

export const SHOP_PRODUCT_TYPES = new Set([
  'powerpoint',
  'worksheet',
  'revision_notes',
  'practice_questions',
  'study_pack',
  'book',
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
  return /^https:\/\/.+/i.test(safeTrim(url, 2000));
}

export function isExternalProduct(product) {
  return Boolean(product?.opens_external) && isValidExternalUrl(product?.external_url);
}

export function externalButtonLabel(product) {
  const label = safeTrim(product?.external_button_label, 80);
  return label || 'Buy now';
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
  const {
    download_path,
    ...rest
  } = product;
  return {
    ...rest,
    effective_price_pence: effectivePricePence(product),
    on_sale: productOnSale(product),
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
  const keywords = safeTrim(body.keywords, 400) || null;
  const image_path = safeTrim(body.image_path, 400) || null;
  const preview_path = safeTrim(body.preview_path, 400) || null;
  const download_path = safeTrim(body.download_path, 400) || null;
  const slug = safeTrim(body.slug, 80) || slugifyProductTitle(title);
  const saleTypeProvided = body.sale_type != null || body.saleType != null;
  const opensExternalProvided = body.opens_external != null || saleTypeProvided;
  const opens_external = opensExternalProvided
    ? (body.opens_external != null
      ? Boolean(body.opens_external)
      : (body.sale_type === 'external' || body.saleType === 'external'))
    : (partial ? undefined : false);
  const external_url = opens_external === true
    ? safeTrim(body.external_url, 2000)
    : (opens_external === false ? null : safeTrim(body.external_url, 2000) || undefined);
  const external_button_label = body.external_button_label != null
    ? (safeTrim(body.external_button_label, 80) || 'Buy now')
    : undefined;

  const priceRaw = body.price_pence ?? body.pricePence;
  const saleRaw = body.sale_price_pence ?? body.salePricePence;
  const price_pence = priceRaw == null || priceRaw === '' ? null : Math.round(Number(priceRaw));
  const sale_price_pence = saleRaw == null || saleRaw === '' ? null : Math.round(Number(saleRaw));

  const stockRaw = body.stock_quantity ?? body.stockQuantity;
  const stock_quantity = stockRaw == null || stockRaw === '' ? null : Math.max(0, Math.round(Number(stockRaw)));

  const is_featured = body.is_featured != null ? Boolean(body.is_featured) : undefined;
  const is_published = body.is_published != null ? Boolean(body.is_published) : undefined;
  const sort_order = body.sort_order != null ? Math.round(Number(body.sort_order) || 0) : undefined;

  if (!partial) {
    if (!title) return { ok: false, error: 'Product title is required.' };
    if (!SHOP_PRODUCT_TYPES.has(product_type)) {
      return { ok: false, error: 'Choose a valid product type.' };
    }
    if (opens_external) {
      if (!external_url || !isValidExternalUrl(external_url)) {
        return { ok: false, error: 'External link products need a valid https:// URL.' };
      }
      if (price_pence != null && price_pence !== '' && (!Number.isFinite(price_pence) || price_pence < 0)) {
        return { ok: false, error: 'Enter a valid price in pence, or leave blank for external products.' };
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

  if (is_featured !== undefined) fields.is_featured = is_featured;
  if (is_published !== undefined) fields.is_published = is_published;
  if (sort_order !== undefined) fields.sort_order = sort_order;

  return { ok: true, fields };
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
    .in('id', uniqueIds)
    .eq('is_published', true);
  if (error) throw error;
  return data || [];
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
    if (isExternalProduct(product)) {
      return {
        ok: false,
        error: `${product.title} is sold on an external website and cannot be checked out through JD Science.`,
      };
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
