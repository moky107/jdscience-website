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

export function productOnSale(product) {
  const base = Number(product?.price_pence);
  const sale = product?.sale_price_pence;
  return sale != null && sale !== "" && Number(sale) >= 0 && Number(sale) < base;
}
