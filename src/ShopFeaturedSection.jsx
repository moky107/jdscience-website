import React, { useEffect, useState } from "react";
import { formatPricePence, productOnSale } from "./shopFormat";
import { shopProductKindLabel, shopProductTypeLabel } from "./shopConstants";
import {
  externalButtonLabel,
  isExternalProduct,
  productCardImageHeight,
  productShowsPrice,
  retailerName,
  retailerPriceHint,
} from "./shopProductHelpers";
import {
  ROTATION_INTERVAL_MS,
  shopCarouselPageCount,
  shopCarouselPageIndex,
  shopProductsForPage,
  shopSlotCount,
  shouldRotateShopProducts,
  sortShopProductsForHomepage,
} from "./shopCarousel";
import {
  ANALYTICS_EVENTS,
  isAmazonRetailer,
  isChemistryCompanionProduct,
  track,
} from "./analytics";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

const SUBJECT_PLACEHOLDER = {
  Biology: { from: "#059669", to: "#065f46", soft: "#ecfdf5" },
  Chemistry: { from: "#7c3aed", to: "#4c1d95", soft: "#f5f3ff" },
  Physics: { from: "#ea580c", to: "#9a3412", soft: "#fff7ed" },
  Maths: { from: "#2563eb", to: "#1e3a8a", soft: "#eff6ff" },
  English: { from: "#db2777", to: "#9d174d", soft: "#fdf2f8" },
  "Applied Science": { from: "#0d9488", to: "#115e59", soft: "#f0fdfa" },
  "Health and Social Care": { from: "#0f766e", to: "#134e4a", soft: "#f0fdfa" },
  Mixed: { from: "#64748b", to: "#334155", soft: "#f8fafc" },
  General: { from: "#009688", to: "#004d40", soft: "#ecfeff" },
};

function placeholderPalette(subject) {
  const key = Object.keys(SUBJECT_PLACEHOLDER).find((name) => name.toLowerCase() === String(subject || "").toLowerCase());
  return SUBJECT_PLACEHOLDER[key] || SUBJECT_PLACEHOLDER.General;
}

function placeholderTypeLabel(product) {
  const type = String(product?.product_type || "").toLowerCase();
  if (type === "powerpoint") return "PowerPoint";
  if (type === "worksheet") return "Worksheet";
  if (type === "answer_sheet") return "Answer Sheet";
  if (type === "revision_notes") return "Revision Notes";
  return shopProductTypeLabel(product?.product_type) || "JD Science";
}

function useViewportWidth() {
  const [width, setWidth] = useState(typeof window === "undefined" ? 1200 : window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener(update);
    };
  }, []);
  return prefersReducedMotion;
}

export { productCardImageHeight } from "./shopProductHelpers";

function ProductMeta({ product }) {
  const external = isExternalProduct(product);
  const soldLabel = external && retailerName(product) ? `Sold on ${retailerName(product)}` : (external ? "External retailer" : "");
  const chips = [
    product.level,
    product.subject,
    product.exam_board,
    shopProductTypeLabel(product.product_type),
    external ? null : shopProductKindLabel(product.product_kind),
    soldLabel,
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

export function ProductImagePlaceholder({ product }) {
  const palette = placeholderPalette(product?.subject);
  const label = placeholderTypeLabel(product);
  return (
    <div
      role="img"
      aria-label={`${label} placeholder`}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: `linear-gradient(145deg, ${palette.soft} 0%, #ffffff 55%, ${palette.soft} 100%)`,
        color: palette.to,
        padding: 16,
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <span
        style={{
          minWidth: 64,
          padding: "10px 14px",
          borderRadius: 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
          color: "#fff",
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: 0.2,
          boxShadow: "0 10px 24px rgba(15,23,42,.18)",
        }}
      >
        {label}
      </span>
      {product?.subject ? (
        <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>{product.subject}</span>
      ) : (
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>JD Science</span>
      )}
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
          <ProductImagePlaceholder product={product} />
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
        {showPrice ? (
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontWeight: 800, color: TEAL_DARK, fontSize: 18 }}>
              {formatPricePence(price)}
              {productOnSale(product) && product.price_pence != null && (
                <span style={{ marginLeft: 8, color: "#94a3b8", textDecoration: "line-through", fontSize: 14, fontWeight: 600 }}>
                  {formatPricePence(product.price_pence)}
                </span>
              )}
            </div>
            {external && <div style={{ color: "#64748b", fontSize: 12 }}>{retailerPriceHint(product)}</div>}
          </div>
        ) : external ? (
          <div style={{ fontWeight: 700, color: TEAL_DARK, fontSize: 15 }}>{retailerPriceHint(product)}</div>
        ) : null}
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
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const viewportWidth = useViewportWidth();
  const prefersReducedMotion = usePrefersReducedMotion();
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const slots = shopSlotCount({ isMobile, isTablet });
  const pageCount = shopCarouselPageCount(products.length, slots);
  const canRotate = shouldRotateShopProducts(products, slots);
  const activePage = shopCarouselPageIndex(page, pageCount || 1);
  const visible = shopProductsForPage(products, slots, activePage);
  const gridColumns = isMobile ? "1fr" : (isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Prefer featured first; if fewer than a full desktop row, fill with other published products.
        const [featuredResp, allResp] = await Promise.all([
          fetch("/api/shop-products?featured=1"),
          fetch("/api/shop-products"),
        ]);
        const featuredData = await featuredResp.json().catch(() => ({}));
        const allData = await allResp.json().catch(() => ({}));
        const featured = Array.isArray(featuredData.products) ? featuredData.products : [];
        const published = Array.isArray(allData.products) ? allData.products : [];
        const merged = sortShopProductsForHomepage([...featured, ...published]);
        if (!cancelled) {
          setProducts(merged);
          setPage(0);
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setPage(0);
    setAnimKey((value) => value + 1);
  }, [slots, products.length]);

  useEffect(() => {
    // 5 minutes between automatic page advances
    if (prefersReducedMotion || !canRotate || paused) return undefined;
    const timer = window.setInterval(() => {
      setPage((current) => current + 1);
      setAnimKey((value) => value + 1);
    }, ROTATION_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, canRotate, paused, pageCount]);

  const goPrev = () => {
    setPaused(true);
    setPage((current) => current - 1);
    setAnimKey((value) => value + 1);
  };
  const goNext = () => {
    setPaused(true);
    setPage((current) => current + 1);
    setAnimKey((value) => value + 1);
  };
  const goTo = (index) => {
    setPaused(true);
    setPage(index);
    setAnimKey((value) => value + 1);
  };
  return (
    <section style={{ padding: isMobile ? "40px 16px" : "48px 20px", background: "#ffffff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "end", marginBottom: 22 }}>
          <div>
            <h2 style={{ color: "#0f766e", fontSize: isMobile ? 24 : 28, margin: 0 }}>Visit Our Shop</h2>
            <p style={{ color: "#64748b", marginTop: 10, maxWidth: 680, lineHeight: 1.6 }}>
              Explore high-quality revision materials, teaching resources and JDScience products.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {canRotate && (
              <>
                <button type="button" aria-label="Show previous shop products" onClick={goPrev} onFocus={() => setPaused(true)} style={{ width: 48, height: 48, borderRadius: 12, border: "1px solid rgba(0, 150, 136, .22)", background: "#fff", color: TEAL_DARK, cursor: "pointer", fontWeight: 800 }}>‹</button>
                <button type="button" aria-label="Show next shop products" onClick={goNext} onFocus={() => setPaused(true)} style={{ width: 48, height: 48, borderRadius: 12, border: "1px solid rgba(0, 150, 136, .22)", background: "#fff", color: TEAL_DARK, cursor: "pointer", fontWeight: 800 }}>›</button>
              </>
            )}
            <button type="button" onClick={onVisitShop} style={{ minHeight: 48, padding: "12px 18px", borderRadius: 12, border: "none", background: TEAL, color: "#fff", fontWeight: 800, cursor: "pointer" }}>
              Visit the Shop
            </button>
          </div>
        </div>
        {loading ? (
          <div style={{ color: "#64748b" }}>Loading featured products…</div>
        ) : products.length === 0 ? (
          <div style={{ borderRadius: 16, padding: 24, background: "#f8fafc", color: "#64748b" }}>
            Featured shop products will appear here once published by the administrator.
          </div>
        ) : (
          <div
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured shop products"
            aria-live="polite"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}
          >
            <div
              key={`shop-page-${activePage}-${animKey}`}
              style={{
                display: "grid",
                gridTemplateColumns: gridColumns,
                gap: 16,
                alignContent: "start",
                minHeight: isMobile ? 360 : 420,
                transition: prefersReducedMotion ? "none" : "opacity .45s ease, transform .45s ease",
                opacity: 1,
                transform: "translateX(0)",
                animation: prefersReducedMotion ? "none" : "shopCarouselIn .45s ease",
              }}
            >
              {visible.map((product) => (
                <ProductCard
                  key={product.id || product.slug}
                  product={product}
                  compact
                  onView={onViewProduct}
                  onAdd={onAddToBasket}
                />
              ))}
            </div>
            {canRotate && pageCount > 1 && (
              <div role="tablist" aria-label="Shop product carousel pages" style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-label={`Show shop products page ${index + 1} of ${pageCount}`}
                    aria-selected={activePage === index}
                    onClick={() => goTo(index)}
                    onFocus={() => setPaused(true)}
                    style={{
                      width: activePage === index ? 22 : 12,
                      height: 12,
                      borderRadius: 999,
                      border: "none",
                      background: activePage === index ? TEAL : "#cbd5e1",
                      cursor: "pointer",
                      padding: 0,
                      transition: prefersReducedMotion ? "none" : "width .2s ease, background-color .2s ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
