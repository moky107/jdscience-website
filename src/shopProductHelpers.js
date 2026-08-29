export function normalizeShopProduct(product = {}) {
  return {
    ...product,
    external_url: product?.external_url || "",
    external_button_label: product?.external_button_label || "Buy now",
    opens_external: Boolean(product?.opens_external),
  };
}

export function isValidExternalUrl(url) {
  return /^https:\/\/.+/i.test(String(url || "").trim());
}

export function isExternalProduct(product) {
  const normalized = normalizeShopProduct(product);
  return normalized.opens_external && isValidExternalUrl(normalized.external_url);
}

export function externalButtonLabel(product) {
  const normalized = normalizeShopProduct(product);
  const label = String(normalized.external_button_label || "").trim();
  return label || "Buy now";
}

export function productShowsPrice(product) {
  const price = product?.effective_price_pence ?? product?.price_pence;
  return Number.isFinite(Number(price)) && Number(price) > 0;
}
