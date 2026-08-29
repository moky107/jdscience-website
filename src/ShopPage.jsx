import React, { useEffect, useMemo, useState } from "react";
import TermsAgreement from "./TermsAgreement";
import { TERMS_VERSION } from "./termsAndConditions";
import {
  SHOP_EXAM_BOARDS,
  SHOP_LEVELS,
  SHOP_PRODUCT_KINDS,
  SHOP_PRODUCT_TYPES,
  SHOP_SUBJECTS,
  shopProductKindLabel,
  shopProductTypeLabel,
} from "./shopConstants";
import {
  addToBasket,
  basketCount,
  basketSubtotalPence,
  clearBasket,
  readBasket,
  removeFromBasket,
  updateBasketQuantity,
} from "./shopBasket";
import { formatPricePence, productOnSale } from "./shopFormat";
import { ProductCard } from "./ShopFeaturedSection";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const inp = { padding: "12px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box", minHeight: 48 };

function useShopWidth() {
  const [width, setWidth] = useState(typeof window === "undefined" ? 1200 : window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

function ProductDetail({ product, onBack, onAdd, onBuyNow }) {
  const price = product.effective_price_pence ?? product.price_pence;
  const meta = [
    product.level && ["Level", product.level],
    product.subject && ["Subject", product.subject],
    product.exam_board && ["Exam board", product.exam_board],
    product.product_type && ["Type", shopProductTypeLabel(product.product_type)],
    product.product_kind && ["Format", shopProductKindLabel(product.product_kind)],
    product.product_kind === "physical" && product.stock_quantity != null && ["Stock", String(product.stock_quantity)],
  ].filter(Boolean);

  return (
    <section style={{ padding: "28px 16px", maxWidth: 1100, margin: "0 auto" }}>
      <button type="button" onClick={onBack} style={{ minHeight: 48, marginBottom: 16, border: "none", background: "transparent", color: TEAL_DARK, fontWeight: 800, cursor: "pointer" }}>
        ← Back to shop
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "start" }}>
        <div style={{ borderRadius: 18, overflow: "hidden", background: "#f1f5f9", aspectRatio: "4 / 3" }}>
          {(product.preview_url || product.image_url) ? (
            <img src={product.preview_url || product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "#94a3b8", fontWeight: 700 }}>Preview unavailable</div>
          )}
        </div>
        <div>
          <h1 style={{ margin: "0 0 12px", color: "#0f172a", fontSize: 32, lineHeight: 1.2 }}>{product.title}</h1>
          <div style={{ fontSize: 28, fontWeight: 800, color: TEAL_DARK, marginBottom: 16 }}>
            {formatPricePence(price)}
            {productOnSale(product) && product.price_pence != null && (
              <span style={{ marginLeft: 10, color: "#94a3b8", textDecoration: "line-through", fontSize: 18, fontWeight: 600 }}>
                {formatPricePence(product.price_pence)}
              </span>
            )}
          </div>
          {product.short_description && <p style={{ color: "#475569", lineHeight: 1.65, fontSize: 16 }}>{product.short_description}</p>}
          {meta.length > 0 && (
            <dl style={{ display: "grid", gap: 8, margin: "18px 0", fontSize: 14 }}>
              {meta.map(([label, value]) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8 }}>
                  <dt style={{ margin: 0, color: "#64748b", fontWeight: 700 }}>{label}</dt>
                  <dd style={{ margin: 0, color: "#0f172a" }}>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {product.description && (
            <div style={{ color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 18 }}>{product.description}</div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => onAdd(product)} style={{ minHeight: 48, padding: "12px 18px", borderRadius: 12, border: "none", background: TEAL, color: "#fff", fontWeight: 800, cursor: "pointer" }}>
              Add to Basket
            </button>
            <button type="button" onClick={() => onBuyNow(product)} style={{ minHeight: 48, padding: "12px 18px", borderRadius: 12, border: `1px solid ${TEAL_DARK}`, background: "#ecfeff", color: TEAL_DARK, fontWeight: 800, cursor: "pointer" }}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function BasketPanel({
  items,
  subtotalPence,
  checkoutOpen,
  setCheckoutOpen,
  onUpdateQty,
  onRemove,
  checkoutForm,
  setCheckoutField,
  checkoutError,
  checkoutLoading,
  onCheckout,
  hasPhysical,
  orderComplete,
  digitalItems,
  onDownload,
  downloadEmail,
  setDownloadEmail,
}) {
  return (
    <aside style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 8px 24px rgba(15,23,42,.08)", position: "sticky", top: 88 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 20, color: "#0f172a" }}>Basket</h2>
      {items.length === 0 ? (
        <p style={{ color: "#64748b", margin: 0 }}>Your basket is empty.</p>
      ) : (
        <>
          <div style={{ display: "grid", gap: 12 }}>
            {items.map((item) => (
              <div key={item.productId} style={{ borderBottom: "1px solid #eef2f7", paddingBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.title}</div>
                <div style={{ color: "#64748b", fontSize: 13, margin: "4px 0 8px" }}>
                  {shopProductKindLabel(item.productKind)} · {formatPricePence(item.unitPricePence)} each
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                    Qty
                    <input type="number" min="1" max="99" value={item.quantity} onChange={(e) => onUpdateQty(item.productId, e.target.value)} style={{ ...inp, width: 72, minHeight: 44 }} />
                  </label>
                  <button type="button" onClick={() => onRemove(item.productId)} style={{ minHeight: 44, padding: "8px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", cursor: "pointer", fontWeight: 700 }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, fontWeight: 800, color: "#0f172a" }}>
            <span>Subtotal</span>
            <span>{formatPricePence(subtotalPence)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontWeight: 800, color: TEAL_DARK, fontSize: 18 }}>
            <span>Total</span>
            <span>{formatPricePence(subtotalPence)}</span>
          </div>
          {!checkoutOpen ? (
            <button type="button" onClick={() => setCheckoutOpen(true)} style={{ width: "100%", minHeight: 48, marginTop: 16, borderRadius: 12, border: "none", background: TEAL, color: "#fff", fontWeight: 800, cursor: "pointer" }}>
              Checkout securely
            </button>
          ) : (
            <form onSubmit={onCheckout} style={{ display: "grid", gap: 10, marginTop: 16 }}>
              <input required type="text" placeholder="Full name" value={checkoutForm.name} onChange={(e) => setCheckoutField("name", e.target.value)} style={inp} />
              <input required type="email" placeholder="Email address" value={checkoutForm.email} onChange={(e) => setCheckoutField("email", e.target.value)} style={inp} />
              {hasPhysical && (
                <>
                  <div style={{ fontWeight: 800, color: "#0f172a", marginTop: 4 }}>Delivery details</div>
                  <input required type="text" placeholder="Delivery name" value={checkoutForm.shipping_name} onChange={(e) => setCheckoutField("shipping_name", e.target.value)} style={inp} />
                  <input required type="text" placeholder="Address line 1" value={checkoutForm.shipping_line1} onChange={(e) => setCheckoutField("shipping_line1", e.target.value)} style={inp} />
                  <input type="text" placeholder="Address line 2 (optional)" value={checkoutForm.shipping_line2} onChange={(e) => setCheckoutField("shipping_line2", e.target.value)} style={inp} />
                  <input required type="text" placeholder="Town / city" value={checkoutForm.shipping_city} onChange={(e) => setCheckoutField("shipping_city", e.target.value)} style={inp} />
                  <input required type="text" placeholder="Postcode" value={checkoutForm.shipping_postcode} onChange={(e) => setCheckoutField("shipping_postcode", e.target.value)} style={inp} />
                  <input type="tel" placeholder="Contact phone" value={checkoutForm.shipping_phone} onChange={(e) => setCheckoutField("shipping_phone", e.target.value)} style={inp} />
                </>
              )}
              <TermsAgreement
                checked={checkoutForm.accept_terms}
                onChange={(value) => setCheckoutField("accept_terms", value)}
              />
              {checkoutError && <div style={{ color: "#b91c1c", fontSize: 14 }}>{checkoutError}</div>}
              <button type="submit" disabled={checkoutLoading} style={{ minHeight: 48, borderRadius: 12, border: "none", background: checkoutLoading ? "#94a3b8" : TEAL_DARK, color: "#fff", fontWeight: 800, cursor: checkoutLoading ? "default" : "pointer" }}>
                {checkoutLoading ? "Redirecting to Stripe…" : "Pay with Stripe"}
              </button>
              <p style={{ margin: 0, color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>Card details are handled securely by Stripe. JD Science never stores payment card numbers.</p>
            </form>
          )}
        </>
      )}

      {orderComplete && digitalItems.length > 0 && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #eef2f7" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#0f172a" }}>Your digital downloads</h3>
          <input type="email" placeholder="Confirm your email" value={downloadEmail} onChange={(e) => setDownloadEmail(e.target.value)} style={{ ...inp, marginBottom: 10 }} />
          <div style={{ display: "grid", gap: 8 }}>
            {digitalItems.map((item) => (
              <button key={item.product_id} type="button" onClick={() => onDownload(item.product_id)} style={{ minHeight: 44, borderRadius: 10, border: `1px solid rgba(0,150,136,.22)`, background: "#ecfeff", color: TEAL_DARK, fontWeight: 700, cursor: "pointer", textAlign: "left", padding: "10px 12px" }}>
                Download: {item.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

export default function ShopPage({
  productSlug = null,
  onHome,
  onOpenProduct,
  onBasketChange,
  initialSuccessSessionId = null,
}) {
  const width = useShopWidth();
  const isMobile = width < 768;
  const [products, setProducts] = useState([]);
  const [productDetail, setProductDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ q: "", level: "", subject: "", exam_board: "", product_type: "", product_kind: "" });
  const [basketItems, setBasketItems] = useState(() => readBasket());
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    email: "",
    shipping_name: "",
    shipping_line1: "",
    shipping_line2: "",
    shipping_city: "",
    shipping_postcode: "",
    shipping_country: "GB",
    shipping_phone: "",
    accept_terms: false,
  });
  const [orderComplete, setOrderComplete] = useState(null);
  const [downloadEmail, setDownloadEmail] = useState("");

  const subtotalPence = useMemo(() => basketSubtotalPence(basketItems), [basketItems]);
  const hasPhysical = basketItems.some((item) => item.productKind === "physical");

  useEffect(() => {
    onBasketChange?.(basketCount(basketItems));
  }, [basketItems, onBasketChange]);

  useEffect(() => {
    if (!initialSuccessSessionId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`/api/shop-order?session_id=${encodeURIComponent(initialSuccessSessionId)}`);
        const data = await resp.json().catch(() => ({}));
        if (!cancelled && resp.ok) {
          setOrderComplete({ sessionId: initialSuccessSessionId, items: data.order?.items || [] });
          if (data.order?.customer_email) setDownloadEmail(data.order.customer_email);
        } else if (!cancelled) {
          setOrderComplete({ sessionId: initialSuccessSessionId, items: [] });
        }
      } catch {
        if (!cancelled) setOrderComplete({ sessionId: initialSuccessSessionId, items: [] });
      }
    })();
    return () => { cancelled = true; };
  }, [initialSuccessSessionId]);

  useEffect(() => {
    if (initialSuccessSessionId) {
      clearBasket();
      setBasketItems([]);
    }
  }, [initialSuccessSessionId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        if (productSlug) {
          const resp = await fetch(`/api/shop-products?slug=${encodeURIComponent(productSlug)}`);
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data?.error || "Product not found.");
          if (!cancelled) {
            setProductDetail(data.product || null);
            setProducts([]);
          }
        } else {
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
          const resp = await fetch(`/api/shop-products?${params.toString()}`);
          const data = await resp.json().catch(() => ({}));
          if (!resp.ok) throw new Error(data?.error || "Failed to load shop.");
          if (!cancelled) {
            setProducts(data.products || []);
            setProductDetail(null);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load shop.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productSlug, filters]);

  function setCheckoutField(key, value) {
    setCheckoutForm((current) => ({ ...current, [key]: value }));
  }

  function refreshBasket(next) {
    setBasketItems(next);
  }

  function handleAdd(product, buyNow = false) {
    const next = addToBasket(product, 1);
    refreshBasket(next);
    if (buyNow) setCheckoutOpen(true);
  }

  async function handleCheckout(event) {
    event.preventDefault();
    setCheckoutError("");
    setCheckoutLoading(true);
    try {
      const resp = await fetch("/api/create-shop-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checkoutForm,
          terms_version: TERMS_VERSION,
          items: basketItems.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || "Checkout failed.");
      if (!data.url) throw new Error("Stripe checkout URL missing.");
      window.location.href = data.url;
    } catch (err) {
      setCheckoutError(err.message || "Checkout failed.");
      setCheckoutLoading(false);
    }
  }

  async function handleDownload(productId) {
    if (!orderComplete?.sessionId || !downloadEmail) return;
    try {
      const resp = await fetch("/api/shop-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: orderComplete.sessionId,
          product_id: productId,
          email: downloadEmail,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || "Download failed.");
      if (data.download_url) window.open(data.download_url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setCheckoutError(err.message || "Download failed.");
    }
  }

  const digitalItems = orderComplete?.sessionId
    ? (orderComplete.items || []).filter((item) => item.is_digital)
    : [];

  return (
    <div style={{ background: "#f8fafc", minHeight: "70vh" }}>
      <section style={{ background: `linear-gradient(135deg, ${TEAL_DARK}, ${TEAL})`, color: "#fff", padding: isMobile ? "28px 16px" : "36px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <button type="button" onClick={onHome} style={{ minHeight: 44, border: "none", background: "transparent", color: "#fff", fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>
            ← Home
          </button>
          <h1 style={{ margin: 0, fontSize: isMobile ? 30 : 38 }}>JD Science Shop</h1>
          <p style={{ margin: "10px 0 0", opacity: 0.92, maxWidth: 720, lineHeight: 1.6 }}>
            Revision materials, teaching resources, study packs and JDScience merchandise — with secure Stripe checkout.
          </p>
        </div>
      </section>

      {orderComplete && (
        <div style={{ maxWidth: 1100, margin: "16px auto 0", padding: "0 16px" }}>
          <div role="status" style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 12, padding: 14, fontWeight: 600 }}>
            Payment successful. A receipt has been sent to your email. Use the download section in your basket for digital products.
          </div>
        </div>
      )}

      {productDetail ? (
        <ProductDetail
          product={productDetail}
          onBack={() => onOpenProduct(null)}
          onAdd={(product) => handleAdd(product, false)}
          onBuyNow={(product) => handleAdd(product, true)}
        />
      ) : (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) 320px", gap: 20, alignItems: "start" }}>
          <div>
            <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
              <input
                type="search"
                placeholder="Search products by title, subject, level or keyword"
                value={filters.q}
                onChange={(e) => setFilters((current) => ({ ...current, q: e.target.value }))}
                style={inp}
              />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                <select value={filters.level} onChange={(e) => setFilters((current) => ({ ...current, level: e.target.value }))} style={inp}>
                  <option value="">All levels</option>
                  {SHOP_LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
                <select value={filters.subject} onChange={(e) => setFilters((current) => ({ ...current, subject: e.target.value }))} style={inp}>
                  <option value="">All subjects</option>
                  {SHOP_SUBJECTS.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
                <select value={filters.exam_board} onChange={(e) => setFilters((current) => ({ ...current, exam_board: e.target.value }))} style={inp}>
                  <option value="">All exam boards</option>
                  {SHOP_EXAM_BOARDS.map((board) => <option key={board} value={board}>{board}</option>)}
                </select>
                <select value={filters.product_type} onChange={(e) => setFilters((current) => ({ ...current, product_type: e.target.value }))} style={inp}>
                  <option value="">All product types</option>
                  {SHOP_PRODUCT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                </select>
                <select value={filters.product_kind} onChange={(e) => setFilters((current) => ({ ...current, product_kind: e.target.value }))} style={inp}>
                  <option value="">Digital & physical</option>
                  {SHOP_PRODUCT_KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
                </select>
              </div>
            </div>

            {loading && <div style={{ color: "#64748b" }}>Loading products…</div>}
            {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
            {!loading && !error && products.length === 0 && (
              <div style={{ background: "#fff", borderRadius: 16, padding: 24, color: "#64748b" }}>
                No products match your filters yet. Check back soon or contact info@jdscience.co.uk.
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={() => onOpenProduct(product.slug)}
                  onAdd={(item) => handleAdd(item, false)}
                  onBuyNow={(item) => handleAdd(item, true)}
                />
              ))}
            </div>
          </div>

          <BasketPanel
            items={basketItems}
            subtotalPence={subtotalPence}
            checkoutOpen={checkoutOpen}
            setCheckoutOpen={setCheckoutOpen}
            onUpdateQty={(productId, quantity) => refreshBasket(updateBasketQuantity(productId, quantity))}
            onRemove={(productId) => refreshBasket(removeFromBasket(productId))}
            checkoutForm={checkoutForm}
            setCheckoutField={setCheckoutField}
            checkoutError={checkoutError}
            checkoutLoading={checkoutLoading}
            onCheckout={handleCheckout}
            hasPhysical={hasPhysical}
            orderComplete={orderComplete}
            digitalItems={digitalItems}
            onDownload={handleDownload}
            downloadEmail={downloadEmail}
            setDownloadEmail={setDownloadEmail}
          />
        </div>
      )}
    </div>
  );
}
