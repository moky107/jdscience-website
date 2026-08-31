/** Homepage shop product carousel helpers. */

// 5 minutes
export const ROTATION_INTERVAL_MS = 300000;

/** @deprecated Use ROTATION_INTERVAL_MS — kept for clarity in older call sites. */
export const SHOP_ROTATION_MS = ROTATION_INTERVAL_MS;

export function shopSlotCount({ isMobile = false, isTablet = false } = {}) {
  if (isMobile) return 1;
  if (isTablet) return 2;
  return 4;
}

/** Featured products first, then other published products. Dedupes by id/slug. */
export function sortShopProductsForHomepage(products) {
  const list = (Array.isArray(products) ? products : []).filter(Boolean);
  const seen = new Set();
  const unique = [];
  for (const product of list) {
    const key = product.id || product.slug;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(product);
  }
  return unique.slice().sort((a, b) => {
    const aFeatured = Boolean(a.is_featured || a.featured) ? 0 : 1;
    const bFeatured = Boolean(b.is_featured || b.featured) ? 0 : 1;
    if (aFeatured !== bFeatured) return aFeatured - bFeatured;
    const aOrder = Number(a.sort_order);
    const bOrder = Number(b.sort_order);
    if (Number.isFinite(aOrder) && Number.isFinite(bOrder) && aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    return String(a.title || "").localeCompare(String(b.title || ""));
  });
}

export function shopCarouselPageCount(productCount, slotCount = 4) {
  const n = Math.max(0, Number(productCount) || 0);
  const slots = Math.max(1, Number(slotCount) || 1);
  if (n === 0) return 0;
  if (n <= slots) return 1;
  return Math.ceil(n / slots);
}

export function shopCarouselPageIndex(page, pageCount) {
  const pages = Math.max(1, Number(pageCount) || 1);
  return ((Number(page) || 0) % pages + pages) % pages;
}

/** Products visible on one carousel page (no wrap within the page). */
export function shopProductsForPage(products, slotCount, pageIndex) {
  const list = Array.isArray(products) ? products : [];
  const slots = Math.max(1, Number(slotCount) || 1);
  const pages = shopCarouselPageCount(list.length, slots);
  if (!list.length || pages === 0) return [];
  const page = shopCarouselPageIndex(pageIndex, pages);
  const start = page * slots;
  return list.slice(start, start + slots);
}

export function shouldRotateShopProducts(products, slotCount = 4) {
  return shopCarouselPageCount(
    sortShopProductsForHomepage(products).length,
    slotCount,
  ) > 1;
}
