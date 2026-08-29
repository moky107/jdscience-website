export function normalizeShopProduct(product = {}) {
  return {
    ...product,
    external_url: product?.external_url || "",
    external_button_label: product?.external_button_label || "Buy now",
    opens_external: Boolean(product?.opens_external),
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
