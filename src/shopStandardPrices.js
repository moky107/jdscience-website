/** Approved standard shop prices (pence). Do not invent other defaults. */
export const APPROVED_SHOP_PRICE_PENCE = {
  powerpoint: 500,
  worksheet: 200,
  revision_notes: 300,
};

export const APPROVED_SHOP_PRICE_LABELS = {
  powerpoint: "PowerPoints: £5.00 each",
  worksheet: "Worksheets, including student PDF and answer sheet: £2.00 per pack",
  revision_notes: "Revision notes: £3.00 each",
};

export function approvedPricePenceForType(productType) {
  const type = String(productType || "").toLowerCase();
  if (Object.prototype.hasOwnProperty.call(APPROVED_SHOP_PRICE_PENCE, type)) {
    return APPROVED_SHOP_PRICE_PENCE[type];
  }
  return null;
}

export function resolveCopyPricePence(productType, provided) {
  if (provided !== "" && provided != null) {
    const price = Math.round(Number(provided));
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, error: "Enter a valid price before publishing to the Shop." };
    }
    return { ok: true, price_pence: price, source: "provided" };
  }
  const approved = approvedPricePenceForType(productType);
  if (approved == null) {
    return { ok: false, error: "Enter a price before publishing to the Shop." };
  }
  return { ok: true, price_pence: approved, source: "approved_standard" };
}

export function shopTitleFingerprint(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/\bjdscience\b/g, " ")
    .replace(/\b(worksheet|worksheets|answer sheets?|revision notes?|powerpoint|presentation|pack)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function titlesLookLikeSameShopProduct(left, right) {
  const a = shopTitleFingerprint(left);
  const b = shopTitleFingerprint(right);
  return Boolean(a && b && a === b);
}
