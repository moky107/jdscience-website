export const PURCHASE_JDSICIENCE = "jdscience";
export const PURCHASE_EXTERNAL = "external";
export const EXTERNAL_CHECKOUT_ERROR = "This product is purchased through an external retailer.";

export function isValidExternalUrl(url) {
  const trimmed = String(url || "").trim();
  if (!trimmed || trimmed.length > 2000) return false;
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function purchaseMethod(product = {}) {
  const explicit = String(product.purchase_method || product.purchaseMethod || "").trim().toLowerCase();
  if (explicit === PURCHASE_EXTERNAL || explicit === PURCHASE_JDSICIENCE) return explicit;
  if (product.opens_external || product.sale_type === "external" || product.saleType === "external") {
    return PURCHASE_EXTERNAL;
  }
  return PURCHASE_JDSICIENCE;
}

export function isExternalPurchase(product) {
  return purchaseMethod(product) === PURCHASE_EXTERNAL;
}

export function isExternalProduct(product) {
  return isExternalPurchase(product) && isValidExternalUrl(product?.external_url);
}

export function retailerName(product = {}) {
  const named = String(product.retailer_name || product.retailerName || "").trim();
  if (named) return named;
  const label = String(product.external_button_label || "").trim();
  const match = label.match(/^Buy (?:on|at|from)\s+(.+)$/i);
  if (match?.[1] && match[1].toLowerCase() !== "now") return match[1].trim();
  return "";
}

export function externalButtonLabel(product = {}) {
  const retailer = retailerName(product);
  if (retailer) {
    const lower = retailer.toLowerCase();
    if (lower === "amazon") return "Buy on Amazon";
    if (lower === "waterstones") return "Buy at Waterstones";
    if (lower === "whsmith" || lower === "wh smith") return "Buy at WHSmith";
    return `Buy from ${retailer}`;
  }
  const custom = String(product.external_button_label || "").trim();
  if (custom && custom.toLowerCase() !== "buy now") return custom;
  return "Visit retailer";
}

export function externalSaleNotice(product = {}) {
  const retailer = retailerName(product) || "the retailer";
  return `This product is sold by ${retailer}. You will be taken to their website to complete your purchase.`;
}

export function externalLegalNote(product = {}) {
  const retailer = retailerName(product) || "the retailer";
  return `Payment, delivery and returns for this item are handled by ${retailer}, not JDScience.`;
}

export function productShowsPrice(product = {}) {
  if (isExternalPurchase(product) && product.show_price === false) return false;
  const price = product.effective_price_pence ?? product.price_pence;
  return Number.isFinite(Number(price)) && Number(price) > 0;
}

export function retailerPriceHint(product = {}) {
  const retailer = retailerName(product);
  if (productShowsPrice(product)) {
    return "Price shown may differ from the retailer's current price.";
  }
  if (retailer && retailer.toLowerCase() === "amazon") return "Check price at Amazon";
  if (retailer) return `See ${retailer} for current price`;
  return "See retailer for current price";
}

export function checkoutRejectionForProduct(product) {
  if (isExternalPurchase(product)) return EXTERNAL_CHECKOUT_ERROR;
  return null;
}
