import React, { useEffect, useState } from "react";
import { formatPricePence, productOnSale } from "./shopFormat";
import { shopProductKindLabel, shopProductTypeLabel } from "./shopConstants";
import { externalButtonLabel, isExternalProduct, productCardImageHeight, productShowsPrice } from "./shopProductHelpers";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

function useViewportWidth() {
  const [width, setWidth] = useState(typeof window === "undefined" ? 1200 : window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

export { productCardImageHeight } from "./shopProductHelpers";

function ProductMeta({ product }) {
  const chips = [
    product.level,
    product.subject,
    product.exam_board,
    shopProductTypeLabel(product.product_type),
    shopProductKindLabel(product.product_kind),
  ].filter(Boolean);
  if (!chips.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {chips.map((chip) => (
        <span key={chip} style={{ padding: "4px 8px", borderRadius: 999, background: "#ecfeff", color: TEAL_DARK, fontSize: 12, fontWeight: 700 }}>
          {chip}
        </span>
      ))}
    </div>
  );
}

function ProductImagePlaceholder() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        background: "linear-gradient(135deg, #ecfeff 0%, #f1f5f9 100%)",
        color: TEAL_DARK,
      }}
    >
      <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: "#fff", fontWeight: 800, fontSize: 16 }}>JD</span>
      <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>JD Science</span>
    </div>
  );
}

export function ProductCard({ product, onView, onAdd, compact = false }) {
  const viewportWidth = useViewportWidth();
  const imageHeight = productCardImageHeight(compact, viewportWidth);
  const external = isExternalProduct(product);
  const price = product.effective_price_pence ?? product.price_pence;
  const showPrice = productShowsPrice(product);
  const externalLabel = externalButtonLabel(product);
  const isFeatured = Boolean(product.is_featured || product.featured);
  const viewLabel = compact ? "View in Shop" : "View Product";

  return (
    <article style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 8px 24px rgba(15,23,42,.08)", display: "flex", flexDirection: "column", height: "100%", maxWidth: compact ? 320 : undefined }}>
      <div
        style={{
          height: imageHeight,
          maxHeight: imageHeight,
          minHeight: imageHeight,
          width: "100%",
          flexShrink: 0,
          background: "#f1f5f9",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {product.image_url ? (
          <img src={product.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <ProductImagePlaceholder />
        )}
        {isFeatured && (
          <span style={{ position: "absolute", top: 10, left: 10, background: "#fbbf24", color: "#78350f", fontSize: 11, fontWeight: 800, padding: "4px 8px", borderRadius: 999 }}>Featured</span>
        )}
      </div>
      <div style={{ padding: compact ? 16 : 18, display: "flex", flexDirection: "column", gap: 10, flex: "1 1 auto" }}>
        <h3 style={{ margin: 0, color: "#0f172a", fontSize: compact ? 17 : 18, lineHeight: 1.3 }}>{product.title || "Untitled product"}</h3>
        {product.short_description && (
          <p style={{ margin: 0, color: "#64748b", fontSize: 14, lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.short_description}
          </p>
        )}
        <ProductMeta product={product} />
        {showPrice && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 800, color: TEAL_DARK, fontSize: 18 }}>
              {formatPricePence(price)}
              {productOnSale(product) && product.price_pence != null && (
                <span style={{ marginLeft: 8, color: "#94a3b8", textDecoration: "line-through", fontSize: 14, fontWeight: 600 }}>
                  {formatPricePence(product.price_pence)}
                </span>
              )}
            </div>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: "auto", paddingTop: 4 }}>
          <button type="button" onClick={() => onView(product)} style={{ flex: 1, minHeight: 48, borderRadius: 10, border: `1px solid rgba(0,150,136,.22)`, background: "#fff", color: TEAL_DARK, fontWeight: 800, cursor: "pointer" }}>
            {viewLabel}
          </button>
          {external ? (
            <a
              href={product.external_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, minHeight: 48, borderRadius: 10, border: "none", background: TEAL, color: "#fff", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", padding: "0 10px", textAlign: "center" }}
            >
              {externalLabel}
            </a>
          ) : (
            <button type="button" onClick={() => onAdd(product)} style={{ flex: 1, minHeight: 48, borderRadius: 10, border: "none", background: TEAL, color: "#fff", fontWeight: 800, cursor: "pointer" }}>
              Add to Basket
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ShopFeaturedSection({ onVisitShop, onViewProduct, onAddToBasket }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const viewportWidth = useViewportWidth();
  const isMobile = viewportWidth < 768;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const resp = await fetch("/api/shop-products?featured=1");
        const data = await resp.json().catch(() => ({}));
        if (!cancelled) setProducts((data.products || []).slice(0, 3));
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section style={{ padding: isMobile ? "40px 16px" : "48px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end", marginBottom: 22 }}>
          <div>
            <div style={{ color: TEAL_DARK, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 12 }}>Shop</div>
            <h2 style={{ color: "#0f172a", fontSize: isMobile ? 24 : 28, margin: "8px 0 0" }}>Shop Educational Resources</h2>
            <p style={{ color: "#64748b", marginTop: 10, maxWidth: 680, lineHeight: 1.6 }}>
              Explore high-quality revision materials, teaching resources and JDScience products.
            </p>
          </div>
          <button type="button" onClick={onVisitShop} style={{ minHeight: 48, padding: "12px 18px", borderRadius: 12, border: "none", background: TEAL, color: "#fff", fontWeight: 800, cursor: "pointer" }}>
            Visit the Shop
          </button>
        </div>
        {loading ? (
          <div style={{ color: "#64748b" }}>Loading featured products…</div>
        ) : products.length === 0 ? (
          <div style={{ borderRadius: 16, padding: 24, background: "#f8fafc", color: "#64748b" }}>
            Featured shop products will appear here once published by the administrator.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 320px))", gap: 16, justifyContent: "start" }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                compact
                onView={onViewProduct}
                onAdd={onAddToBasket}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
