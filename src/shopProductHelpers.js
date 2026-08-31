import {
  externalButtonLabel as purchaseButtonLabel,
  isExternalProduct as purchaseIsExternal,
  isValidExternalUrl as purchaseIsValidUrl,
  productShowsPrice as purchaseShowsPrice,
  purchaseMethod,
} from "./shopPurchase.js";

export {
  EXTERNAL_CHECKOUT_ERROR,
  checkoutRejectionForProduct,
  externalLegalNote,
  externalSaleNotice,
  isExternalPurchase,
  purchaseMethod,
  retailerName,
  retailerPriceHint,
} from "./shopPurchase.js";

export function normalizeShopProduct(product = {}) {
  const method = purchaseMethod(product);
  return {
    ...product,
    purchase_method: method,
    opens_external: method === "external",
    retailer_name: product?.retailer_name || "",
    show_price: product?.show_price !== false,
    external_url: product?.external_url || "",
    external_button_label: purchaseButtonLabel(product),
  };
}

export function productCardImageHeight(compact = false, viewportWidth = 1200) {
  const mobile = viewportWidth < 768;
  if (mobile) return compact ? 160 : 180;
  return compact ? 180 : 200;
}

export function isValidProductImageFile(file) {
  if (!file) return { ok: false, error: "Choose an image file." };
  const type = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (allowedTypes.has(type)) return { ok: true };
  if (/\.(jpe?g|png|webp)$/.test(name)) return { ok: true };
  return { ok: false, error: "Unsupported file type. Use JPG, PNG or WebP." };
}

export function isValidExternalUrl(url) {
  return purchaseIsValidUrl(url);
}

export function isExternalProduct(product) {
  return purchaseIsExternal(product);
}

export function externalButtonLabel(product) {
  return purchaseButtonLabel(product);
}

export function productShowsPrice(product) {
  return purchaseShowsPrice(product);
}
