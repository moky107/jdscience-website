import React, { useEffect, useState } from "react";
import { ADVICE_CATEGORIES, adviceCategoryLabel } from "./adviceConstants";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

function formatPostDate(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "";
  }
}

export default function AdviceNewsSection() {
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch("/api/education-posts");
        const data = await resp.json().catch(() => ({}));
        if (!cancelled) setPosts(Array.isArray(data.posts) ? data.posts : []);
      } catch {
        if (!cancelled) setPosts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const visible = posts.filter((post) => filter === "all" || post.category === filter);

  return (
    <section id="advice-anchor" style={{ padding: isMobile ? "36px 16px" : "52px 20px", background: "#ecfeff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", flexWrap: "wrap" }}>
          <div>
            <div style={{ color: TEAL_DARK, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>Student support</div>
            <h2 style={{ color: "#0f172a", fontSize: isMobile ? 24 : 32, margin: "6px 0 8px" }}>Revision advice, exam tips &amp; education news</h2>
            <p style={{ color: "#475569", margin: 0, maxWidth: 640, lineHeight: 1.6 }}>
              Practical guidance for 11+, GCSE, IGCSE, A Level, BTEC and T Level — plus updates worth knowing before exam season.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 22 }}>
          <button type="button" onClick={() => setFilter("all")}
            style={{ padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: filter === "all" ? TEAL_DARK : "#fff", color: filter === "all" ? "#fff" : "#334155" }}>
            All
          </button>
          {ADVICE_CATEGORIES.map((item) => (
            <button key={item.id} type="button" onClick={() => setFilter(item.id)}
              style={{ padding: "8px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13, background: filter === item.id ? TEAL : "#fff", color: filter === item.id ? "#fff" : "#334155" }}>
              {item.label}
            </button>
          ))}
        </div>

        {loading && <div style={{ marginTop: 22, color: "#64748b" }}>Loading updates…</div>}

        {!loading && visible.length === 0 && (
          <div style={{ marginTop: 22, background: "#fff", borderRadius: 16, padding: isMobile ? 20 : 28, boxShadow: "0 8px 24px rgba(15,23,42,.06)" }}>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 18 }}>This space is ready for new posts</div>
            <p style={{ color: "#475569", lineHeight: 1.7, margin: "10px 0 0" }}>
              Revision strategies, exam technique and education news will appear here. Check back soon, or follow JD Science for the latest guidance.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 22 }}>
          {visible.map((post) => {
            const open = openId === post.id;
            return (
              <article key={post.id} style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 8px 24px rgba(15,23,42,.06)", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}>
                  <span style={{ padding: "4px 10px", borderRadius: 999, background: "#ccfbf1", color: TEAL_DARK, fontSize: 12, fontWeight: 800 }}>{adviceCategoryLabel(post.category)}</span>
                  <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700 }}>{formatPostDate(post.published_at)}</span>
                </div>
                <h3 style={{ margin: 0, color: "#0f172a", fontSize: 18, lineHeight: 1.35 }}>{post.title}</h3>
                <p style={{ margin: 0, color: "#475569", fontSize: 14, lineHeight: 1.65 }}>{post.summary}</p>
                {open && <div style={{ color: "#334155", fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{post.body}</div>}
                <button type="button" onClick={() => setOpenId(open ? null : post.id)}
                  style={{ marginTop: "auto", alignSelf: "start", padding: "8px 0", background: "none", border: 0, color: TEAL, cursor: "pointer", fontWeight: 800 }}>
                  {open ? "Show less" : "Read more"}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
