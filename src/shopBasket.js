import { isExternalProduct } from "./shopProductHelpers.js";

const BASKET_KEY = "jd_shop_basket";

export function readBasket() {
  try {
    const raw = localStorage.getItem(BASKET_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.productId && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

export function writeBasket(items) {
  try {
    localStorage.setItem(BASKET_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

export function basketCount(items = readBasket()) {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

export function basketSubtotalPence(items = readBasket()) {
  return items.reduce((sum, item) => sum + (Number(item.unitPricePence) || 0) * (Number(item.quantity) || 0), 0);
}

export function addToBasket(product, quantity = 1) {
  if (isExternalProduct(product)) return readBasket();
  const items = readBasket();
  const productId = String(product.id);
  const existing = items.find((item) => item.productId === productId);
  const nextQuantity = (existing?.quantity || 0) + Math.max(1, Number(quantity) || 1);
  const entry = {
    productId,
    slug: product.slug,
    title: product.title,
    unitPricePence: product.effective_price_pence ?? product.price_pence,
    quantity: nextQuantity,
    productKind: product.product_kind,
    imageUrl: product.image_url || null,
  };
  const next = existing
    ? items.map((item) => (item.productId === productId ? { ...item, ...entry } : item))
    : [...items, entry];
  writeBasket(next);
  return next;
}

export function updateBasketQuantity(productId, quantity) {
  const qty = Number(quantity);
  const items = readBasket();
  if (!Number.isFinite(qty) || qty <= 0) {
    const next = items.filter((item) => item.productId !== String(productId));
    writeBasket(next);
    return next;
  }
  const next = items.map((item) => (
    item.productId === String(productId) ? { ...item, quantity: qty } : item
  ));
  writeBasket(next);
  return next;
}

export function removeFromBasket(productId) {
  const next = readBasket().filter((item) => item.productId !== String(productId));
  writeBasket(next);
  return next;
}

export function clearBasket() {
  writeBasket([]);
  return [];
}
