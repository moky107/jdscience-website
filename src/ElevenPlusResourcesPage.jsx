import React, { useEffect, useState } from "react";
import {
  ELEVEN_PLUS_ATTRIBUTION_NOTICE,
  ELEVEN_PLUS_RESOURCES,
  ELEVEN_PLUS_SECTIONS,
  resourcesForSection,
  sectionSlug,
} from "./elevenPlusResourcesCatalog";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(`(max-width:${bp}px)`).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${bp}px)`);
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [bp]);
  return mobile;
}

function ResourceCard({ item, isMobile }) {
  const openInNewTab = item.external || /^https?:\/\//i.test(item.url);
  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 14px rgba(0,0,0,.05)",
        padding: isMobile ? 16 : 18,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: isMobile ? undefined : 250,
      }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: TEAL_DARK, background: "#ecfeff", padding: "4px 10px", borderRadius: 999 }}>
          {item.publisher}
        </span>
        {item.external && (
          <span style={{ fontSize: 12, fontWeight: 700, color: "#92400e", background: "#fff7ed", border: "1px solid #fed7aa", padding: "4px 10px", borderRadius: 999 }}>
            External resource
          </span>
        )}
      </div>

      <h3 style={{ margin: 0, color: "#0f172a", fontSize: isMobile ? 17 : 18, lineHeight: 1.35 }}>{item.title}</h3>

      <dl style={{ margin: 0, display: "grid", gap: 6, fontSize: 13, color: "#475569" }}>
        <div><dt style={{ display: "inline", fontWeight: 700, color: "#0f172a" }}>Subject: </dt><dd style={{ display: "inline", margin: 0 }}>{item.subject}</dd></div>
        <div><dt style={{ display: "inline", fontWeight: 700, color: "#0f172a" }}>Resource type: </dt><dd style={{ display: "inline", margin: 0 }}>{item.resourceType}</dd></div>
        <div><dt style={{ display: "inline", fontWeight: 700, color: "#0f172a" }}>Publisher/source: </dt><dd style={{ display: "inline", margin: 0 }}>{item.publisher}</dd></div>
      </dl>

      <p style={{ margin: 0, color: "#64748b", fontSize: 14, lineHeight: 1.6, flex: 1 }}>{item.description}</p>

      <a
        href={item.url}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "auto",
          padding: "12px 16px",
          minHeight: 44,
          borderRadius: 10,
          background: TEAL,
          color: "#fff",
          textDecoration: "none",
          fontWeight: 800,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        Access free resource
      </a>
    </article>
  );
}

export default function ElevenPlusResourcesPage({ onBook, onHome }) {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState(ELEVEN_PLUS_SECTIONS[0]);

  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";
    if (!hash) return;
    const match = ELEVEN_PLUS_SECTIONS.find((section) => sectionSlug(section) === hash);
    if (match) setActiveSection(match);
  }, []);

  const jumpTo = (section) => {
    setActiveSection(section);
    const slug = sectionSlug(section);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `${window.location.pathname}#${slug}`);
      document.getElementById(`eleven-plus-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const externalCount = ELEVEN_PLUS_RESOURCES.filter((item) => item.external).length;
  const localCount = ELEVEN_PLUS_RESOURCES.length - externalCount;

  return (
    <section style={{ padding: isMobile ? "20px 14px 40px" : "28px 20px 48px", background: "#f8fafc", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ color: "#64748b", fontSize: isMobile ? 12 : 13, marginBottom: 10, lineHeight: 1.5 }}>
          <a href="/" onClick={(e) => { e.preventDefault(); onHome?.(); }} style={{ color: TEAL, textDecoration: "none", fontWeight: 700 }}>Home</a>
          {" › "}
          11+ Resources
        </div>

        <div style={{ background: "#fff", borderRadius: 14, padding: isMobile ? 18 : 24, boxShadow: "0 4px 14px rgba(0,0,0,.06)", marginBottom: 18 }}>
          <div style={{ color: TEAL_DARK, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", fontSize: 12 }}>11+ Resources</div>
          <h1 style={{ margin: "8px 0 0", color: "#0f172a", fontSize: isMobile ? 26 : 32, lineHeight: 1.2 }}>
            Free 11+ practice papers and familiarisation materials
          </h1>
          <p style={{ margin: "12px 0 0", color: "#64748b", fontSize: 15, lineHeight: 1.65, maxWidth: 760 }}>
            Browse free English, Maths, Verbal Reasoning and Non-Verbal Reasoning resources from GL Assessment, CGP, Collins, Examberry and The Exam Coach,
            plus original JDScience practice papers. External downloads open on the publisher’s own site.
          </p>
          <p style={{ margin: "10px 0 0", color: "#475569", fontSize: 13 }}>
            {ELEVEN_PLUS_RESOURCES.length} resources listed · {localCount} JDScience · {externalCount} external
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,.06)", marginBottom: 18, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: isMobile ? "100%" : 180 }}>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: isMobile ? 17 : 16 }}>Need 11+ tutoring?</div>
            <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>1-to-1 support for grammar and independent school entrance exams</div>
          </div>
          <button type="button" onClick={onBook} style={{ padding: "12px 18px", minHeight: 44, borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, width: isMobile ? "100%" : "auto" }}>
            Book Tutor
          </button>
        </div>

        <div
          role="note"
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#78350f",
            borderRadius: 12,
            padding: isMobile ? 14 : 16,
            fontSize: 14,
            lineHeight: 1.65,
            marginBottom: 22,
          }}
        >
          {ELEVEN_PLUS_ATTRIBUTION_NOTICE}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Jump to section</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {ELEVEN_PLUS_SECTIONS.map((section) => {
            const active = activeSection === section;
            return (
              <button
                key={section}
                type="button"
                className="filter-chip"
                onClick={() => jumpTo(section)}
                style={{
                  padding: isMobile ? "12px 14px" : "8px 14px",
                  borderRadius: 8,
                  border: `1px solid ${active ? TEAL : "#cbd5e1"}`,
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: isMobile ? 14 : 13,
                  background: active ? "#ecfeff" : "#fff",
                  color: active ? TEAL_DARK : "#475569",
                }}
              >
                {section}
              </button>
            );
          })}
        </div>

        {ELEVEN_PLUS_SECTIONS.map((section) => {
          const items = resourcesForSection(section);
          const slug = sectionSlug(section);
          return (
            <div key={section} id={`eleven-plus-${slug}`} style={{ marginBottom: 36, scrollMarginTop: 88 }}>
              <h2 style={{ color: "#0f172a", margin: "0 0 6px", fontSize: isMobile ? 22 : 24 }}>{section}</h2>
              <p style={{ color: "#64748b", margin: "0 0 16px", fontSize: 14 }}>{items.length} resource{items.length === 1 ? "" : "s"}</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: isMobile ? 14 : 18,
                }}
              >
                {items.map((item) => (
                  <ResourceCard key={item.id} item={item} isMobile={isMobile} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
