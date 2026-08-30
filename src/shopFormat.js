export function effectivePricePence(product) {
  const base = Number(product?.price_pence);
  const sale = product?.sale_price_pence;
  if (sale != null && sale !== "" && Number(sale) >= 0 && Number(sale) < base) {
    return Number(sale);
  }
  return Number.isFinite(base) ? base : 0;
}

export function formatPricePence(pence) {
  const value = Number(pence);
  if (!Number.isFinite(value)) return "";
  return `£${(value / 100).toFixed(2)}`;
}

export function penceToPoundsInput(pence) {
  if (pence == null || pence === "") return "";
  const value = Number(pence);
  if (!Number.isFinite(value)) return "";
  return (Math.round(value) / 100).toFixed(2);
}

export function poundsInputToPence(value) {
  const cleaned = String(value ?? "").trim().replace(/£/g, "").replace(/,/g, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return Number.NaN;
  const [pounds, fraction = ""] = cleaned.split(".");
  return (Number(pounds) * 100) + Number((fraction || "").padEnd(2, "0") || "0");
}

export function productOnSale(product) {
  const base = Number(product?.price_pence);
  const sale = product?.sale_price_pence;
  return sale != null && sale !== "" && Number(sale) >= 0 && Number(sale) < base;
}
