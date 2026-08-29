export function isValidExternalUrl(url) {
  return /^https:\/\/.+/i.test(String(url || "").trim());
}

export function isExternalProduct(product) {
  return Boolean(product?.opens_external) && isValidExternalUrl(product?.external_url);
}

export function externalButtonLabel(product) {
  const label = String(product?.external_button_label || "").trim();
  return label || "Buy now";
}

export function productShowsPrice(product) {
  const price = product?.effective_price_pence ?? product?.price_pence;
  return Number.isFinite(Number(price)) && Number(price) > 0;
}
