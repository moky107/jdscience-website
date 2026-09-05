import React, { useEffect, useMemo, useState } from "react";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

const RANGE_OPTIONS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "last_90_days", label: "Last 90 days" },
  { id: "this_year", label: "This year" },
  { id: "all_time", label: "All time" },
  { id: "custom", label: "Custom" },
];

const SERIES_OPTIONS = [
  { id: "visitors", label: "Visitors" },
  { id: "page_views", label: "Page views" },
  { id: "resource_downloads", label: "Resource downloads" },
  { id: "product_views", label: "Product views" },
  { id: "purchases", label: "Purchases" },
  { id: "tutor_bookings", label: "Tutor bookings" },
  { id: "amazon_clicks", label: "Amazon clicks" },
];

const card = {
  background: "#fff",
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
  padding: 16,
  minWidth: 0,
};

const sectionTitle = {
  margin: "0 0 12px",
  fontSize: 18,
  fontWeight: 800,
  color: "#0f172a",
  letterSpacing: "-0.02em",
};

function formatNumber(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("en-GB");
}

function ChangeBadge({ block, label }) {
  if (!block) return null;
  const pct = block.change_pct;
  const dir = block.direction;
  const up = dir === "up";
  const down = dir === "down";
  const color = up ? "#166534" : down ? "#991b1b" : "#64748b";
  const bg = up ? "#dcfce7" : down ? "#fee2e2" : "#f1f5f9";
  const arrow = up ? "↑" : down ? "↓" : "→";
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK }}>{formatNumber(block.current)}</div>
      {pct != null && dir !== "flat" && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 6, padding: "3px 8px", borderRadius: 999, background: bg, color, fontSize: 12, fontWeight: 700 }}>
          <span>{arrow} {Math.abs(pct)}%</span>
          <span style={{ fontWeight: 600, color: "#64748b" }}>{label || "vs previous period"}</span>
        </div>
      )}
      {dir === "flat" && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>No change vs previous period</div>
      )}
    </div>
  );
}

function KpiCard({ title, children, hint }) {
  return (
    <div style={card}>
      <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
      {children}
      {hint && <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>{hint}</div>}
    </div>
  );
}

function LineChart({ series = [], height = 220 }) {
  const values = series.map((p) => Number(p.value) || 0);
  const max = Math.max(...values, 1);
  const width = 640;
  const padX = 12;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const points = series.map((p, i) => {
    const x = padX + (series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const y = padY + innerH - (values[i] / max) * innerH;
    return `${x},${y}`;
  });
  const area = series.length
    ? `${padX},${padY + innerH} ${points.join(" ")} ${padX + innerW},${padY + innerH}`
    : "";

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Traffic chart" style={{ display: "block" }}>
        <defs>
          <linearGradient id="jdAnalyticsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TEAL} stopOpacity="0.28" />
            <stop offset="100%" stopColor={TEAL} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={width - padX}
            y1={padY + innerH * (1 - f)}
            y2={padY + innerH * (1 - f)}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        {series.length > 0 && (
          <>
            <polygon points={area} fill="url(#jdAnalyticsFill)" />
            <polyline points={points.join(" ")} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          </>
        )}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 11, color: "#94a3b8", marginTop: 4, flexWrap: "wrap" }}>
        <span>{series[0]?.date || ""}</span>
        <span>Peak {formatNumber(max)}</span>
        <span>{series[series.length - 1]?.date || ""}</span>
      </div>
    </div>
  );
}

function BarList({ items = [], valueKey = "value", labelKey = "key", maxItems = 8 }) {
  const rows = items.slice(0, maxItems);
  const max = Math.max(...rows.map((r) => Number(r[valueKey]) || 0), 1);
  if (!rows.length) {
    return <div style={{ color: "#94a3b8", fontSize: 14, padding: "12px 0" }}>No data for this period.</div>;
  }
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((row) => {
        const value = Number(row[valueKey]) || 0;
        return (
          <div key={String(row[labelKey])} style={{ minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13, marginBottom: 4 }}>
              <span style={{ fontWeight: 650, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row[labelKey]}</span>
              <span style={{ color: "#64748b", fontWeight: 700, flexShrink: 0 }}>{formatNumber(value)}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "#f1f5f9", overflow: "hidden" }}>
              <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${TEAL}, ${TEAL_DARK})`, borderRadius: 999 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Funnel({ stages = [] }) {
  if (!stages.length) return <div style={{ color: "#94a3b8" }}>No funnel data yet.</div>;
  const max = Math.max(...stages.map((s) => Number(s.count) || 0), 1);
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {stages.map((stage, i) => {
        const widthPct = Math.max(18, (Number(stage.count) / max) * 100);
        return (
          <div key={stage.stage} style={{ display: "grid", justifyItems: "center", gap: 6 }}>
            <div
              style={{
                width: `${widthPct}%`,
                minWidth: 0,
                maxWidth: "100%",
                background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                color: "#fff",
                borderRadius: 12,
                padding: "12px 14px",
                textAlign: "center",
                boxShadow: "0 10px 24px rgba(0, 77, 64, 0.18)",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: 14 }}>{stage.stage}</div>
              <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{formatNumber(stage.count)}</div>
              {i > 0 && (
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{stage.pct_of_previous}% of previous stage</div>
              )}
            </div>
            {i < stages.length - 1 && <div style={{ color: "#94a3b8", fontWeight: 800 }}>↓</div>}
          </div>
        );
      })}
    </div>
  );
}

function SortableTable({ columns, rows, defaultSort }) {
  const [sort, setSort] = useState(defaultSort || { key: columns[0]?.key, dir: "desc" });
  const sorted = useMemo(() => {
    const list = [...(rows || [])];
    const { key, dir } = sort;
    list.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === "number" && typeof bv === "number") return dir === "asc" ? av - bv : bv - av;
      return dir === "asc"
        ? String(av || "").localeCompare(String(bv || ""))
        : String(bv || "").localeCompare(String(av || ""));
    });
    return list;
  }, [rows, sort]);

  return (
    <div style={{ overflowX: "auto", maxWidth: "100%" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ textAlign: "left", padding: "10px 12px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.03em", color: "#64748b", borderBottom: "2px solid #e2e8f0", cursor: "pointer", whiteSpace: "nowrap" }}
                onClick={() => setSort((s) => ({ key: col.key, dir: s.key === col.key && s.dir === "desc" ? "asc" : "desc" }))}
              >
                {col.label}{sort.key === col.key ? (sort.dir === "desc" ? " ↓" : " ↑") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: 24, textAlign: "center", color: "#94a3b8" }}>No rows for this period.</td></tr>
          ) : sorted.map((row, i) => (
            <tr key={row.id || row.page || row.product_id || row.resource_id || i}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: "10px 12px", borderBottom: "1px solid #eef2f7", fontSize: 14, color: "#0f172a", verticalAlign: "top" }}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupHeading({ title, subtitle }) {
  return (
    <div style={{ margin: "28px 0 12px" }}>
      <h2 style={sectionTitle}>{title}</h2>
      {subtitle && <p style={{ margin: 0, color: "#64748b", fontSize: 14, lineHeight: 1.55 }}>{subtitle}</p>}
    </div>
  );
}

export default function AdminAnalytics({ password, onBack }) {
  const [range, setRange] = useState("last_30_days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [seriesMetric, setSeriesMetric] = useState("visitors");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [dashboard, setDashboard] = useState(null);

  async function load(nextRange = range) {
    setLoading(true);
    setError("");
    setMigrationRequired(false);
    try {
      const body = { password, range: nextRange };
      if (nextRange === "custom") {
        body.start = customStart;
        body.end = customEnd;
      }
      const resp = await fetch("/api/admin-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.status === 503 && data.code === "MIGRATION_REQUIRED") {
        setMigrationRequired(true);
        setDashboard(null);
        setError(data.error || "Analytics migration required.");
        return;
      }
      if (!resp.ok) throw new Error(data.error || "Failed to load analytics.");
      setDashboard(data.dashboard || null);
    } catch (err) {
      setError(err.message || "Failed to load analytics.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!password) return;
    if (range === "custom" && (!customStart || !customEnd)) return;
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, range]);

  const ov = dashboard?.overview;
  const comparison = dashboard?.traffic_comparison?.[seriesMetric];
  const series = dashboard?.traffic_series?.[seriesMetric] || [];

  return (
    <div className="jd-analytics-dashboard" style={{ maxWidth: 1280, margin: "0 auto", padding: "8px 0 40px", width: "100%", minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start", flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: TEAL, fontWeight: 800, fontSize: 13, letterSpacing: "0.04em", textTransform: "uppercase" }}>JDScience Analytics</div>
          <h1 style={{ margin: "6px 0 0", fontSize: "clamp(22px, 4vw, 30px)", color: "#0f172a", letterSpacing: "-0.03em" }}>Performance dashboard</h1>
          <p style={{ margin: "8px 0 0", color: "#64748b", maxWidth: 620, lineHeight: 1.55 }}>
            Visitors, resources, shop, tutoring and My Chemistry Companion — updated for the selected date range.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {onBack && (
            <button type="button" onClick={onBack} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, cursor: "pointer" }}>
              ← Bookings
            </button>
          )}
          <button type="button" onClick={() => load(range)} disabled={loading} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 700, cursor: loading ? "default" : "pointer" }}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ fontWeight: 800, marginBottom: 10, color: "#0f172a" }}>Date range</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setRange(opt.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: range === opt.id ? `1px solid ${TEAL}` : "1px solid #e2e8f0",
                background: range === opt.id ? "#ecfeff" : "#fff",
                color: range === opt.id ? TEAL_DARK : "#334155",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {range === "custom" && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12, alignItems: "end" }}>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "#475569" }}>
              From
              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #e2e8f0" }} />
            </label>
            <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700, color: "#475569" }}>
              To
              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} style={{ padding: 10, borderRadius: 10, border: "1px solid #e2e8f0" }} />
            </label>
            <button type="button" onClick={() => load("custom")} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: TEAL, color: "#fff", fontWeight: 800, cursor: "pointer" }}>
              Apply
            </button>
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>
          {error}
          {migrationRequired && (
            <div style={{ marginTop: 8, color: "#7f1d1d", fontSize: 14, lineHeight: 1.55 }}>
              Run <code>supabase/migrations/20260905_analytics_events.sql</code> in the Supabase SQL editor, then refresh.
            </div>
          )}
        </div>
      )}

      {loading && !dashboard && (
        <div style={{ ...card, textAlign: "center", padding: 40, color: "#64748b" }}>Loading analytics…</div>
      )}

      {dashboard?.empty && (
        <div style={{ ...card, marginBottom: 16, background: "#f8fafc" }}>
          <strong style={{ color: TEAL_DARK }}>No analytics events in this range yet.</strong>
          <p style={{ margin: "8px 0 0", color: "#64748b", lineHeight: 1.55 }}>
            Browse the public site, open resources, view shop products, or click My Chemistry Companion Amazon links — events will appear here after the migration is applied.
          </p>
        </div>
      )}

      {dashboard && (
        <>
          <GroupHeading title="Overview" subtitle="Website, resources, shop, tutoring and Amazon referrals at a glance." />
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontWeight: 800, color: "#475569", fontSize: 13 }}>Website</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <KpiCard title="Visitors"><ChangeBadge block={ov?.website?.visitors} /></KpiCard>
              <KpiCard title="Unique visitors"><ChangeBadge block={ov?.website?.unique_visitors} /></KpiCard>
              <KpiCard title="New visitors"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{formatNumber(ov?.website?.new_visitors?.current)}</div></KpiCard>
              <KpiCard title="Returning visitors"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{formatNumber(ov?.website?.returning_visitors?.current)}</div></KpiCard>
              <KpiCard title="Page views"><ChangeBadge block={ov?.website?.page_views} /></KpiCard>
              <KpiCard title="Avg engagement"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{ov?.website?.average_engagement || "—"}</div></KpiCard>
            </div>

            <div style={{ fontWeight: 800, color: "#475569", fontSize: 13, marginTop: 8 }}>Resources</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <KpiCard title="Resource page views"><ChangeBadge block={ov?.resources?.resource_page_views} /></KpiCard>
              <KpiCard title="Resource downloads"><ChangeBadge block={ov?.resources?.resource_downloads} /></KpiCard>
              <KpiCard title="Most downloaded" hint={ov?.resources?.most_downloaded ? `${ov.resources.most_downloaded.downloads} downloads` : "—"}>
                <div style={{ fontSize: 15, fontWeight: 800, color: TEAL_DARK, marginTop: 8, lineHeight: 1.35 }}>{ov?.resources?.most_downloaded?.title || "—"}</div>
              </KpiCard>
              <KpiCard title="Most viewed" hint={ov?.resources?.most_viewed ? `${ov.resources.most_viewed.views} views` : "—"}>
                <div style={{ fontSize: 15, fontWeight: 800, color: TEAL_DARK, marginTop: 8, lineHeight: 1.35 }}>{ov?.resources?.most_viewed?.title || "—"}</div>
              </KpiCard>
            </div>

            <div style={{ fontWeight: 800, color: "#475569", fontSize: 13, marginTop: 8 }}>Shop</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <KpiCard title="Product views"><ChangeBadge block={ov?.shop?.product_views} /></KpiCard>
              <KpiCard title="Add to cart"><ChangeBadge block={ov?.shop?.add_to_cart} /></KpiCard>
              <KpiCard title="Checkout starts"><ChangeBadge block={ov?.shop?.checkout_starts} /></KpiCard>
              <KpiCard title="Completed purchases"><ChangeBadge block={ov?.shop?.completed_purchases} /></KpiCard>
              <KpiCard title="Shop conversion"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{ov?.shop?.conversion_rate ?? 0}%</div></KpiCard>
              <KpiCard title="Revenue"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{ov?.shop?.revenue || "£0.00"}</div></KpiCard>
            </div>

            <div style={{ fontWeight: 800, color: "#475569", fontSize: 13, marginTop: 8 }}>Tutoring</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <KpiCard title="Tutor profile views"><ChangeBadge block={ov?.tutoring?.tutor_profile_views} /></KpiCard>
              <KpiCard title="Tutor enquiries"><ChangeBadge block={ov?.tutoring?.tutor_enquiries} /></KpiCard>
              <KpiCard title="Booking attempts"><ChangeBadge block={ov?.tutoring?.booking_attempts} /></KpiCard>
              <KpiCard title="Confirmed bookings"><ChangeBadge block={ov?.tutoring?.confirmed_bookings} /></KpiCard>
            </div>

            <div style={{ fontWeight: 800, color: "#475569", fontSize: 13, marginTop: 8 }}>My Chemistry Companion</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              <KpiCard title="Amazon clicks" hint="Clicks only — not Amazon sales."><ChangeBadge block={ov?.amazon?.amazon_clicks} /></KpiCard>
              <KpiCard title="Click-through rate"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{ov?.amazon?.click_through_rate ?? 0}%</div></KpiCard>
              <KpiCard title="Origin page">
                <div style={{ fontSize: 14, fontWeight: 800, color: TEAL_DARK, marginTop: 8, lineHeight: 1.35, wordBreak: "break-word" }}>
                  {ov?.amazon?.top_origin_page?.page || "—"}
                </div>
              </KpiCard>
            </div>
          </div>

          <GroupHeading title="Traffic Overview" subtitle="Activity over time with comparison to the previous equivalent period." />
          <div style={card}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {SERIES_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSeriesMetric(opt.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: seriesMetric === opt.id ? `1px solid ${TEAL}` : "1px solid #e2e8f0",
                    background: seriesMetric === opt.id ? "#ecfeff" : "#fff",
                    color: seriesMetric === opt.id ? TEAL_DARK : "#334155",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: 13,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {comparison && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {SERIES_OPTIONS.find((o) => o.id === seriesMetric)?.label}
                </div>
                <ChangeBadge block={comparison} label={`compared with previous ${RANGE_OPTIONS.find((r) => r.id === range)?.label?.toLowerCase() || "period"}`} />
              </div>
            )}
            <LineChart series={series} />
          </div>

          <GroupHeading title="Traffic Sources" subtitle="How visitors arrive at JDScience, including UTM campaigns where present." />
          <div style={card}>
            <SortableTable
              defaultSort={{ key: "visitors", dir: "desc" }}
              columns={[
                { key: "source", label: "Source" },
                { key: "visitors", label: "Visitors", render: (r) => formatNumber(r.visitors) },
                { key: "sessions", label: "Sessions", render: (r) => formatNumber(r.sessions) },
                { key: "conversions", label: "Conversions", render: (r) => formatNumber(r.conversions) },
                { key: "conversion_rate", label: "Conv. rate", render: (r) => `${r.conversion_rate}%` },
                { key: "utm_campaign", label: "Campaign", render: (r) => r.utm_campaign || "—" },
              ]}
              rows={dashboard.traffic_sources || []}
            />
          </div>

          <GroupHeading title="Popular Pages" subtitle="Homepage, resources, shop, tutors, booking and companion pages." />
          <div style={card}>
            <SortableTable
              defaultSort={{ key: "views", dir: "desc" }}
              columns={[
                { key: "label", label: "Page", render: (r) => (
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.label}</div>
                    <div style={{ color: "#94a3b8", fontSize: 12, wordBreak: "break-all" }}>{r.page}</div>
                  </div>
                ) },
                { key: "views", label: "Views", render: (r) => formatNumber(r.views) },
                { key: "unique_visitors", label: "Unique", render: (r) => formatNumber(r.unique_visitors) },
                { key: "average_engagement", label: "Avg engagement" },
                { key: "conversions", label: "Conversions", render: (r) => formatNumber(r.conversions) },
              ]}
              rows={dashboard.pages || []}
            />
          </div>

          <GroupHeading title="Resource Performance" subtitle="Views, downloads and conversion by resource, level, subject and type." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 12 }}>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>By level</div>
              <BarList items={(dashboard.resources?.by_level || []).map((r) => ({ key: r.key, value: r.views }))} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>By subject</div>
              <BarList items={(dashboard.resources?.by_subject || []).map((r) => ({ key: r.key, value: r.views }))} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>By resource type</div>
              <BarList items={(dashboard.resources?.by_type || []).map((r) => ({ key: r.key, value: r.downloads }))} />
            </div>
          </div>
          <div style={card}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Top Resources</div>
            <SortableTable
              defaultSort={{ key: "downloads", dir: "desc" }}
              columns={[
                { key: "title", label: "Resource" },
                { key: "level", label: "Level", render: (r) => r.level || "—" },
                { key: "subject", label: "Subject", render: (r) => r.subject || "—" },
                { key: "views", label: "Views", render: (r) => formatNumber(r.views) },
                { key: "downloads", label: "Downloads", render: (r) => formatNumber(r.downloads) },
                { key: "conversion_rate", label: "Conv. %", render: (r) => `${r.conversion_rate}%` },
              ]}
              rows={dashboard.resources?.leaderboard || []}
            />
          </div>

          <GroupHeading title="Shop Performance" subtitle="Integrated with existing shop products and paid orders." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Top-selling products</div>
              <BarList items={(dashboard.shop?.top_selling || []).map((p) => ({ key: p.title, value: p.purchases }))} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Most viewed products</div>
              <BarList items={(dashboard.shop?.most_viewed || []).map((p) => ({ key: p.title, value: p.views }))} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Viewed often, rarely purchased</div>
              <BarList items={(dashboard.shop?.high_view_low_purchase || []).map((p) => ({ key: p.title, value: p.views }))} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Revenue by resource type</div>
              <BarList items={(dashboard.shop?.revenue_by_type || []).map((p) => ({ key: p.product_type, value: Math.round((p.revenue_pence || 0) / 100) }))} />
            </div>
          </div>
          <div style={card}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Revenue by product</div>
            <SortableTable
              defaultSort={{ key: "revenue_pence", dir: "desc" }}
              columns={[
                { key: "title", label: "Product" },
                { key: "views", label: "Views", render: (r) => formatNumber(r.views) },
                { key: "purchases", label: "Purchases", render: (r) => formatNumber(r.purchases) },
                { key: "conversion_rate", label: "Conv. %", render: (r) => `${r.conversion_rate}%` },
                { key: "revenue_pence", label: "Revenue", render: (r) => `£${((r.revenue_pence || 0) / 100).toFixed(2)}` },
              ]}
              rows={dashboard.shop?.products || []}
            />
          </div>

          <GroupHeading title="Sales Funnel" subtitle="Where visitors abandon the buying journey." />
          <div style={card}>
            <Funnel stages={dashboard.shop?.funnel || []} />
          </div>

          <GroupHeading title="Tutoring Performance" subtitle="Public journey only — no private student or tutor details." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 12 }}>
            <KpiCard title="Booking conversion rate">
              <div style={{ fontSize: 28, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{dashboard.tutoring?.conversion_rate ?? 0}%</div>
            </KpiCard>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Most viewed tutors</div>
              <BarList items={(dashboard.tutoring?.most_viewed_tutors || []).map((t) => ({ key: t.tutor, value: t.views }))} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Most booked tutors</div>
              <BarList items={(dashboard.tutoring?.most_booked_tutors || []).map((t) => ({ key: t.tutor, value: t.bookings }))} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Most requested subjects</div>
              <BarList items={(dashboard.tutoring?.most_requested_subjects || []).map((t) => ({ key: t.subject, value: t.count }))} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Most requested levels</div>
              <BarList items={(dashboard.tutoring?.most_requested_levels || []).map((t) => ({ key: t.level, value: t.count }))} />
            </div>
          </div>
          <div style={card}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Tutoring funnel</div>
            <Funnel stages={dashboard.tutoring?.funnel || []} />
          </div>

          <GroupHeading title="My Chemistry Companion — Amazon Referrals" subtitle="Measures promotional interest. Does not claim Amazon sales." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 12 }}>
            <KpiCard title="Today"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{formatNumber(dashboard.amazon?.clicks_today)}</div></KpiCard>
            <KpiCard title="Last 7 days"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{formatNumber(dashboard.amazon?.clicks_last_7_days)}</div></KpiCard>
            <KpiCard title="Last 30 days"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{formatNumber(dashboard.amazon?.clicks_last_30_days)}</div></KpiCard>
            <KpiCard title="All time"><div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK, marginTop: 8 }}>{formatNumber(dashboard.amazon?.clicks_all_time)}</div></KpiCard>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Top referral source</div>
              <BarList items={(dashboard.amazon?.referral_paths || []).map((r) => ({ key: r.path, value: r.clicks }))} />
            </div>
            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Origin pages</div>
              <BarList items={(dashboard.amazon?.top_origin_page || []).map((r) => ({ key: r.page, value: r.clicks }))} />
              <p style={{ marginTop: 12, fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{dashboard.amazon?.note}</p>
            </div>
          </div>

          <GroupHeading title="Google Search Performance" subtitle="Live Search Console metrics for the selected date range (server-side API)." />
          <div style={card}>
            {!dashboard.search_console?.connected ? (
              <div>
                <div style={{ fontWeight: 800, color: TEAL_DARK, fontSize: 18 }}>
                  {dashboard.search_console?.error ? 'Search Console connection error' : 'Google Search Console not connected'}
                </div>
                {dashboard.search_console?.message && (
                  <p style={{ margin: "10px 0 0", color: dashboard.search_console?.error ? "#991b1b" : "#64748b", lineHeight: 1.6, maxWidth: 720 }}>
                    {dashboard.search_console.message}
                  </p>
                )}
                {!dashboard.search_console?.configured && !dashboard.search_console?.error && (
                  <>
                    <p style={{ margin: "10px 0 0", color: "#64748b", lineHeight: 1.6, maxWidth: 640 }}>
                      Add these Vercel environment variables (Production + Preview), then redeploy. Never use a VITE_ prefix.
                    </p>
                    <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
                      <li><code>GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL</code></li>
                      <li><code>GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY</code></li>
                      <li><code>GOOGLE_SEARCH_CONSOLE_SITE_URL</code> — exact property id from Search Console (URL-prefix e.g. <code>https://www.jdscience.co.uk/</code> or domain <code>sc-domain:jdscience.co.uk</code>)</li>
                    </ul>
                  </>
                )}
                {dashboard.search_console?.client_email && (
                  <p style={{ margin: "12px 0 0", color: "#334155", lineHeight: 1.6, maxWidth: 720 }}>
                    Grant this service account access in Search Console → Settings → Users and permissions:
                    {' '}<code>{dashboard.search_console.client_email}</code>
                  </p>
                )}
                <p style={{ margin: "12px 0 0", color: "#94a3b8", fontSize: 13 }}>
                  The rest of this analytics dashboard works without Search Console.
                </p>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
                  <KpiCard title="Total clicks">
                    <ChangeBadge block={dashboard.search_console.clicks_block || { current: dashboard.search_console.clicks, change_pct: null, direction: "flat" }} />
                  </KpiCard>
                  <KpiCard title="Total impressions">
                    <ChangeBadge block={dashboard.search_console.impressions_block || { current: dashboard.search_console.impressions, change_pct: null, direction: "flat" }} />
                  </KpiCard>
                  <KpiCard title="Average CTR">
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK }}>
                        {dashboard.search_console.ctr_pct != null ? `${dashboard.search_console.ctr_pct}%` : "—"}
                      </div>
                      {dashboard.search_console.ctr_block?.change_pct != null && dashboard.search_console.ctr_block.direction !== "flat" && (
                        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: dashboard.search_console.ctr_block.direction === "up" ? "#166534" : "#991b1b" }}>
                          {dashboard.search_console.ctr_block.direction === "up" ? "↑" : "↓"} {Math.abs(dashboard.search_console.ctr_block.change_pct)} pts vs previous period
                        </div>
                      )}
                    </div>
                  </KpiCard>
                  <KpiCard title="Average position">
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: TEAL_DARK }}>
                        {dashboard.search_console.average_position != null ? dashboard.search_console.average_position : "—"}
                      </div>
                      {dashboard.search_console.position_block?.change_pct != null && dashboard.search_console.position_block.direction !== "flat" && (
                        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: "#64748b" }}>
                          {dashboard.search_console.position_block.direction === "up" ? "↑" : "↓"} {Math.abs(dashboard.search_console.position_block.change_pct)}% vs previous (lower is better)
                        </div>
                      )}
                    </div>
                  </KpiCard>
                </div>

                <div style={{ fontWeight: 800, marginBottom: 8 }}>Search performance over time</div>
                <LineChart
                  series={(dashboard.search_console.timeseries || []).map((p) => ({ date: p.date, value: p.clicks }))}
                />
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8, fontSize: 12, color: "#64748b" }}>
                  <span>Chart shows daily Google Search clicks</span>
                  {dashboard.search_console.date_range && (
                    <span>
                      API window: {dashboard.search_console.date_range.startDate} → {dashboard.search_console.date_range.endDate}
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 18 }}>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Top search queries</div>
                    <SortableTable
                      defaultSort={{ key: "clicks", dir: "desc" }}
                      columns={[
                        { key: "query", label: "Query" },
                        { key: "clicks", label: "Clicks" },
                        { key: "impressions", label: "Impr." },
                        { key: "ctr_pct", label: "CTR %", render: (r) => `${r.ctr_pct}%` },
                        { key: "position", label: "Pos." },
                      ]}
                      rows={dashboard.search_console.top_queries || []}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Top landing pages</div>
                    <SortableTable
                      defaultSort={{ key: "clicks", dir: "desc" }}
                      columns={[
                        { key: "page", label: "Page", render: (r) => {
                          try {
                            const u = new URL(r.page);
                            return u.pathname + u.search;
                          } catch {
                            return r.page;
                          }
                        } },
                        { key: "clicks", label: "Clicks" },
                        { key: "impressions", label: "Impr." },
                        { key: "ctr_pct", label: "CTR %", render: (r) => `${r.ctr_pct}%` },
                        { key: "position", label: "Pos." },
                      ]}
                      rows={dashboard.search_console.top_landing_pages || []}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 18 }}>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Devices</div>
                    <BarList items={(dashboard.search_console.by_device || []).map((d) => ({
                      key: String(d.device || "").toLowerCase(),
                      value: d.clicks,
                    }))} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, marginBottom: 10 }}>Countries</div>
                    <BarList items={(dashboard.search_console.by_country || []).map((d) => ({
                      key: String(d.country || "").toUpperCase(),
                      value: d.clicks,
                    }))} />
                  </div>
                </div>

                {dashboard.search_console.note && (
                  <p style={{ margin: "14px 0 0", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{dashboard.search_console.note}</p>
                )}
              </div>
            )}
          </div>

          <GroupHeading title="Recent Conversion Activity" subtitle="Latest downloads, purchases, bookings and Amazon clicks (no personal data)." />
          <div style={card}>
            <SortableTable
              defaultSort={{ key: "created_at", dir: "desc" }}
              columns={[
                { key: "created_at", label: "When", render: (r) => {
                  try { return new Date(r.created_at).toLocaleString("en-GB", { timeZone: "Europe/London" }); } catch { return r.created_at; }
                } },
                { key: "event_name", label: "Event" },
                { key: "page_path", label: "Page" },
                { key: "source", label: "Source" },
                { key: "device_category", label: "Device" },
              ]}
              rows={dashboard.recent_conversions || []}
            />
          </div>
        </>
      )}
    </div>
  );
}
