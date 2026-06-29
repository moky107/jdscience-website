import React, { useState } from "react";
/* ============================================================
   jdscience.co.uk — Teal Classic, banner hero
   - Per-level subjects (11+, GCSE, A-Level, T-Level, BTEC)
   - Videos arranged by TOPIC (no exam-board columns)
   - Become a Tutor form (free, Formspree-ready)
   - "Coming soon" placeholder that vanishes when files added
============================================================ */

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const ADMIN_PASSWORD = "jdscience2026";

/* Replace with your free Formspree form ID later */
const FORMSPREE_TUTOR = "https://formspree.io/f/YOUR_FORM_ID";

const LEVELS = ["11+", "GCSE/IGCSE", "A-Level", "T-Level", "BTEC"];

/* Correct subjects per level */
const LEVEL_SUBJECTS = {
  "11+": ["Maths", "English", "Verbal Reasoning", "Non-Verbal Reasoning"],
  "GCSE/IGCSE": ["Physics", "Chemistry", "Biology", "Combined Science", "Maths"],
  "A-Level": ["Physics", "Chemistry", "Biology", "Maths"],
  "T-Level": ["Core Science", "Laboratory Sciences", "The Science Sector (Synoptic)"],
  "BTEC": [
    "Unit 1: Principles & Applications of Science I",
    "Unit 2: Practical Scientific Procedures",
    "Unit 3: Science Investigation Skills",
    "Unit 8: Physiology of Human Body Systems",
  ],
};

/* Exam boards per level */
const LEVEL_BOARDS = {
  "11+": ["GL Assessment", "CEM"],
  "GCSE/IGCSE": ["AQA", "Edexcel", "OCR", "Eduqas"],
  "A-Level": ["AQA", "Edexcel", "OCR"],
  "T-Level": ["NCFE"],
  "BTEC": ["Pearson"],
};

const RES_TYPES = ["Revision Notes", "Past Questions", "Mark Schemes", "Videos"];

const BANNER_IMG = "https://placehold.co/1400x500/004d40/ffffff?text=jdscience.co.uk";

const STORE_KEY = "jdscience_resources_v1";
function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveStore(obj) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) {}
}

function useIsMobile(bp) {
  const breakpoint = bp || 768;
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth <= breakpoint : false);
  useEffect(() => {
    const r = () => setM(window.innerWidth <= breakpoint);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [breakpoint]);
  return m;
}

function Navbar(props) {
  const { onHome, onPick, onResource, onScroll, onSearch, isAdmin, setIsAdmin } = props;
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAdmin = () => {
    if (isAdmin) { setIsAdmin(false); return; }
    const pw = window.prompt("Admin password:");
    if (pw === ADMIN_PASSWORD) { setIsAdmin(true); alert("Admin enabled — you can now add resources."); }
    else if (pw) alert("Wrong password");
  };

  const menu = [
    { label: "Home", type: "link", action: onHome },
    ...LEVELS.map((lvl) => ({
      label: lvl, type: "dropdown",
      options: LEVEL_SUBJECTS[lvl].map((s) => ({ text: s, action: () => onPick(lvl, s) })),
    })),
    { label: "Resources", type: "dropdown", options: RES_TYPES.map((r) => ({ text: r, action: () => onResource(r) })) },
    { label: "Find a Tutor", type: "link", action: () => onScroll("book") },
    { label: "Become a Tutor", type: "link", action: () => onScroll("tutor") },
    { label: "Contact", type: "link", action: () => onScroll("contact") },
  ];

  const submit = (e) => { e.preventDefault(); onSearch(q); setMenuOpen(false); };

  const logo = (
    <div onClick={onHome} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: "linear-gradient(135deg," + TEAL + "," + TEAL_DARK + ")", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 15 }}>jdscience.co.uk</div>
    </div>
  );

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", gap: 12 }}>
        {logo}
        {!isMobile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input placeholder="Search subjects or topics..." value={q} onChange={(e) => setQ(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", width: 180 }} />
              <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer" }}>Search</button>
            </form>
            <button type="button" onClick={() => onScroll("tutor")}
              style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#fbbf24", color: "#0f172a", cursor: "pointer", fontWeight: 800 }}>Become a Tutor</button>
            <button type="button" onClick={handleAdmin}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: isAdmin ? "#10b981" : "#fff", color: isAdmin ? "#fff" : "#111", cursor: "pointer" }}>{isAdmin ? "Admin ✓" : "Admin"}</button>
          </div>
        )}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"
            style={{ fontSize: 26, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>{menuOpen ? "✕" : "☰"}</button>
        )}
      </div>

      {!isMobile && (
        <nav style={{ display: "flex", gap: 2, padding: "0 14px", background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)", justifyContent: "center" }}>
          {menu.map((it, i) => (
            <div key={it.label} style={{ position: "relative" }}
              onMouseEnter={() => setOpenIdx(i)} onMouseLeave={() => setOpenIdx(null)}>
              <button onClick={() => it.type === "link" && it.action()}
                style={{ background: openIdx === i && it.type === "dropdown" ? "#d9f6fa" : "transparent", border: "none", padding: "12px 13px", cursor: "pointer", fontWeight: 700, color: "#0f172a", fontSize: 14, whiteSpace: "nowrap" }}>
                {it.label}{it.type === "dropdown" ? " ▾" : ""}
              </button>
              {it.type === "dropdown" && openIdx === i && (
                <div style={{ position: "absolute", top: "100%", left: 0, minWidth: 220, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.14)", borderRadius: "0 0 8px 8px", overflow: "hidden", zIndex: 10 }}>
                  {it.options.map((opt) => (
                    <div key={opt.text} onClick={opt.action}
                      style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", fontSize: 13, color: "#0f172a" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#ecfeff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>{opt.text}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}

      {isMobile && menuOpen && (
        <nav style={{ background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)", padding: "8px 0", maxHeight: "70vh", overflowY: "auto" }}>
          {menu.map((it) => (
            <div key={it.label}>
              <button onClick={() => { if (it.type === "link") { it.action(); setMenuOpen(false); } }}
                style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "12px 18px", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{it.label}</button>
              {it.type === "dropdown" && it.options.map((opt) => (
                <button key={opt.text} onClick={() => { opt.action(); setMenuOpen(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "8px 34px", cursor: "pointer", color: "#0e7490", fontSize: 14 }}>• {opt.text}</button>
              ))}
            </div>
          ))}
          <form onSubmit={submit} style={{ display: "flex", gap: 8, padding: "10px 18px" }}>
            <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6" }} />
            <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none" }}>Go</button>
          </form>
          <div style={{ padding: "0 18px 12px", display: "flex", gap: 8 }}>
            <button type="button" onClick={() => { onScroll("tutor"); setMenuOpen(false); }}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "none", background: "#fbbf24", color: "#0f172a", fontWeight: 800 }}>Become a Tutor</button>
            <button type="button" onClick={() => { handleAdmin(); setMenuOpen(false); }}
              style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: isAdmin ? "#10b981" : "#fff", color: isAdmin ? "#fff" : "#111" }}>{isAdmin ? "Admin: ON" : "Admin"}</button>
          </div>
        </nav>
      )}
    </header>
  );
}

function Hero(props) {
  const { onScroll, onBrowse } = props;
  const isMobile = useIsMobile();
  return (
    <section style={{ position: "relative", minHeight: isMobile ? 360 : 460, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff", overflow: "hidden" }}>
      <img src={BANNER_IMG} alt="Students learning" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,77,64,.82), rgba(0,150,136,.62))" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 760, padding: "40px 20px" }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,.16)", padding: "6px 14px", borderRadius: 20, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>🏆 Expert Science & Maths Tutoring for Everyone</div>
        <h1 style={{ fontSize: isMobile ? 28 : 44, margin: "0 0 14px", lineHeight: 1.12, fontWeight: 800 }}>
          Learn Smarter. Revise Better. <span style={{ color: "#fbbf24" }}>Achieve More.</span>
        </h1>
        <p style={{ fontSize: isMobile ? 15 : 18, color: "rgba(255,255,255,.95)", maxWidth: 600, margin: "0 auto" }}>
          Free past papers, revision notes & mark schemes for 11+, GCSE/IGCSE, A-Level, T-Level and BTEC — plus expert 1-to-1 tutoring.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={onBrowse} style={{ padding: "13px 24px", borderRadius: 8, border: "none", background: "#fff", color: TEAL_DARK, cursor: "pointer", fontWeight: 800, fontSize: 15 }}>Browse Resources</button>
          <button onClick={() => onScroll("book")} style={{ padding: "13px 24px", borderRadius: 8, border: "2px solid rgba(255,255,255,.7)", background: "transparent", color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 15 }}>Book a Tutor</button>
          <button onClick={() => onScroll("tutor")} style={{ padding: "13px 24px", borderRadius: 8, border: "none", background: "#fbbf24", color: "#0f172a", cursor: "pointer", fontWeight: 800, fontSize: 15 }}>Become a Tutor</button>
        </div>
      </div>
    </section>
  );
}

function BoardStrip() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 18px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", color: "#475569", fontWeight: 700 }}>
        <span style={{ color: "#94a3b8" }}>Covering:</span>
        <span>AQA</span><span>Edexcel</span><span>OCR</span><span>Eduqas</span><span>Pearson</span><span>NCFE</span>
      </div>
    </div>
  );
}

function LevelGrid(props) {
  const { onLevel } = props;
  const isMobile = useIsMobile();
  const blurb = { "11+": "Entrance exam prep & practice", "GCSE/IGCSE": "Years 10–11 · all boards", "A-Level": "Years 12–13 · exam-ready", "T-Level": "Technical qualifications", "BTEC": "Vocational courses" };
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#0f172a", fontSize: 28, margin: 0 }}>Choose Your Level</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: 4 }}>Pick where you're studying — then choose your subject</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 26 }}>
          {LEVELS.map((l) => (
            <div key={l} onClick={() => onLevel(l)}
              style={{ background: "linear-gradient(135deg," + TEAL + "," + TEAL_DARK + ")", color: "#fff", borderRadius: 14, padding: 22, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.1)" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{l}</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.9)", margin: "8px 0 0" }}>{blurb[l]}</p>
              <div style={{ marginTop: 14, fontWeight: 700, fontSize: 14 }}>Explore →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PastPapers(props) {
  const { subject, level, resType, isAdmin, store, setStore, onBook } = props;
  const isMobile = useIsMobile();
  const [activeLevel, setActiveLevel] = useState(level || "GCSE/IGCSE");
  const [activeSubject, setActiveSubject] = useState(subject || LEVEL_SUBJECTS["GCSE/IGCSE"][0]);
  const [activeRes, setActiveRes] = useState(resType || "Past Questions");

  useEffect(() => { if (level) setActiveLevel(level); }, [level]);
  useEffect(() => { if (subject) setActiveSubject(subject); }, [subject]);
  useEffect(() => { if (resType) setActiveRes(resType); }, [resType]);

  const subjectsForLevel = LEVEL_SUBJECTS[activeLevel] || [];
  const boardsForLevel = LEVEL_BOARDS[activeLevel] || [];
  const isVideos = activeRes === "Videos";

  /* keep subject valid when level changes */
  useEffect(() => {
    if (subjectsForLevel.indexOf(activeSubject) === -1 && subjectsForLevel.length) {
      setActiveSubject(subjectsForLevel[0]);
    }
  }, [activeLevel]);

  /* Videos keyed by subject/level only (topics). Others keyed by board. */
  const keyFor = (board) => isVideos
    ? "Videos|" + activeSubject + "|" + activeLevel
    : activeRes + "|" + activeSubject + "|" + board + "|" + activeLevel;
  const getItems = (board) => store[keyFor(board)] || [];
  const openItem = (item) => { if (item.url) window.open(item.url, "_blank", "noopener"); };

  const addItem = (board) => {
    const promptName = isVideos ? "Video title / topic (e.g. Forces — Newton's Laws):" : "Resource title (e.g. Paper 1 — June 2023):";
    const name = window.prompt(promptName);
    if (!name) return;
    const url = window.prompt("Paste the link (YouTube / Google Drive / any public URL):");
    if (!url) return;
    const k = keyFor(board);
    const next = Object.assign({}, store);
    next[k] = (store[k] || []).concat([{ name: name, url: url }]);
    setStore(next); saveStore(next);
  };

  const removeItem = (board, idx) => {
    const k = keyFor(board);
    const arr = (store[k] || []).slice();
    arr.splice(idx, 1);
    const next = Object.assign({}, store);
    next[k] = arr;
    setStore(next); saveStore(next);
  };

  const fileBtn = (p, board, idx) => (
    <div key={idx} style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
      <button onClick={() => openItem(p)}
        style={{ flex: 1, textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14, color: "#0f172a" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#ecfeff"; e.currentTarget.style.borderColor = TEAL; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
        {isVideos ? "▶️" : "📄"} {p.name}
      </button>
      {isAdmin && (
        <button onClick={() => removeItem(board, idx)} title="Delete"
          style={{ padding: "0 10px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>✕</button>
      )}
    </div>
  );

  return (
    <section style={{ padding: isMobile ? "20px 14px" : "28px 20px", background: "#f8fafc", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>Home › {activeRes} › {activeLevel} › {activeSubject}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,.06)", marginBottom: 22, flexWrap: "wrap" }}>
          <img src="https://placehold.co/80x80/009688/ffffff?text=JD" alt="tutor" style={{ width: 70, height: 70, borderRadius: "50%" }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Need help with {activeSubject}?</div>
            <div style={{ color: "#64748b", fontSize: 14 }}>1-to-1 tutoring with an experienced specialist · ✓ Qualified Teacher · ⭐ 5.0</div>
          </div>
          <button onClick={onBook} style={{ padding: "10px 18px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>Book Tutor</button>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Resource Type</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {RES_TYPES.map((r) => (
            <button key={r} onClick={() => setActiveRes(r)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: activeRes === r ? TEAL_DARK : "#e2e8f0", color: activeRes === r ? "#fff" : "#334155" }}>{r}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Level</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setActiveLevel(l)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + (activeLevel === l ? TEAL : "#cbd5e1"), cursor: "pointer", fontWeight: 600, fontSize: 13, background: activeLevel === l ? "#ecfeff" : "#fff", color: activeLevel === l ? TEAL_DARK : "#475569" }}>{l}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Subject</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {subjectsForLevel.map((s) => (
            <button key={s} onClick={() => setActiveSubject(s)}
              style={{ padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: activeSubject === s ? TEAL : "#e2e8f0", color: activeSubject === s ? "#fff" : "#334155" }}>{s}</button>
          ))}
        </div>

        <h2 style={{ color: "#0f172a", marginBottom: 16 }}>
          {activeLevel} {activeSubject} — {activeRes}{isVideos ? " by Topic" : " by Exam Board"}
        </h2>

        {isVideos ? (
          /* VIDEOS: arranged by topic — single column list */
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,.06)", display: "flex", flexDirection: "column", gap: 10 }}>
            {getItems("").length === 0 && <div style={{ color: "#94a3b8", fontSize: 14 }}>Coming soon</div>}
            {getItems("").map((p, idx) => fileBtn(p, "", idx))}
            {isAdmin && (
              <button onClick={() => addItem("")}
                style={{ padding: "10px 12px", borderRadius: 8, border: "1px dashed " + TEAL, background: "#fff", color: TEAL, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ Add video topic</button>
            )}
          </div>
        ) : (
          /* NOTES / PAST QUESTIONS / MARK SCHEMES: by exam board */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
            {boardsForLevel.map((board) => {
              const items = getItems(board);
              return (
                <div key={board} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,.06)" }}>
                  <div style={{ background: TEAL_DARK, color: "#fff", padding: "12px 14px", fontWeight: 800 }}>{board}</div>
                  <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.length === 0 && <div style={{ color: "#94a3b8", fontSize: 13, padding: "4px 2px" }}>Coming soon</div>}
                    {items.map((p, idx) => fileBtn(p, board, idx))}
                    {isAdmin && (
                      <button onClick={() => addItem(board)}
                        style={{ padding: "9px 12px", borderRadius: 8, border: "1px dashed " + TEAL, background: "#fff", color: TEAL, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ Add resource</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

const inp = { padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, width: "100%", boxSizing: "border-box", fontFamily: "inherit" };

function Booking() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", email: "", subject: "Physics", level: "GCSE/IGCSE", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm((f) => Object.assign({}, f, { [k]: v }));
  const submit = (e) => { e.preventDefault(); setSent(true); };
  const price = form.level === "A-Level" ? "£40/hr" : "£35/hr";

  return (
    <section style={{ background: "linear-gradient(135deg," + TEAL_DARK + "," + TEAL + ")", padding: isMobile ? "32px 16px" : "48px 20px", color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 28, alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 28, marginTop: 0 }}>Book a Tutoring Session</h2>
          <p style={{ color: "rgba(255,255,255,.9)" }}>Personalised 1-to-1 lessons in Science and Maths.</p>
          <ul style={{ lineHeight: 1.9, paddingLeft: 18 }}>
            <li>✓ GCSE / 11+ / T-Level / BTEC — <b>£35/hr</b></li>
            <li>✓ A-Level — <b>£40/hr</b></li>
            <li>✓ All exam boards · flexible online sessions</li>
          </ul>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 22, color: "#0f172a" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 40 }}>✅</div>
              <h3>Thanks, {form.name || "there"}!</h3>
              <p style={{ color: "#64748b" }}>We'll be in touch at {form.email || "your email"} soon.</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input required placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} style={inp} />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <select value={form.level} onChange={(e) => set("level", e.target.value)} style={inp}>
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
                <input placeholder="Subject" value={form.subject} onChange={(e) => set("subject", e.target.value)} style={inp} />
              </div>
              <div style={{ fontWeight: 700, color: TEAL_DARK }}>Price: {price}</div>
              <textarea placeholder="What would you like help with?" value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} style={inp} />
              <button type="submit" style={{ padding: "12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 800 }}>Request Session</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function BecomeTutor() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: "#0f172a", color: "#fff", padding: isMobile ? "32px 16px" : "48px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontSize: 28, marginTop: 0 }}>Become a Tutor</h2>
        <p style={{ color: "rgba(255,255,255,.8)" }}>
          Submit your profile below. Our team reviews every application — once approved, you'll be added to our tutor list.
        </p>
        <form action={FORMSPREE_TUTOR} method="POST" style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <input name="full_name" placeholder="Full name" required style={inp} />
          <input name="email" type="email" placeholder="Email" required style={inp} />
          <input name="phone" placeholder="Phone" style={inp} />
          <input name="subjects" placeholder="Subjects & levels you teach (e.g. A-Level Chemistry, GCSE Biology)" required style={inp} />
          <input name="qualifications" placeholder="Qualifications (e.g. BSc Chemistry, QTS)" required style={inp} />
          <textarea name="bio" placeholder="Short bio / teaching experience" rows={4} required style={inp} />
          <button type="submit" style={{ padding: "12px", borderRadius: 8, background: "#fbbf24", color: "#0f172a", border: "none", cursor: "pointer", fontWeight: 800 }}>Submit Application</button>
        </form>
        <p style={{ color: "rgba(255,255,255,.5)", fontSize: 12, marginTop: 10 }}>
          To receive applications by email, create a free form at formspree.io and paste your form ID into <code>FORMSPREE_TUTOR</code>.
        </p>
      </div>
    </section>
  );
}

function Contact() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: "#0f172a" }}>Get in Touch</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 16, marginTop: 20 }}>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 28 }}>📧</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>Email</div>
            <a href="mailto:info@jdscience.co.uk" style={{ color: TEAL }}>info@jdscience.co.uk</a>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 28 }}>📞</div>
            <div style={{ fontWeight: 700, marginTop: 6 }}>Phone</div>
            <a href="tel:07466142805" style={{ color: TEAL }}>07466 142805</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#0f172a", color: "#cbd5e1", padding: "32px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 24 }}>
        <div>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: 18 }}>jdscience.co.uk</div>
          <p style={{ fontSize: 14, marginTop: 8 }}>Free science & maths resources and expert tutoring for 11+, GCSE/IGCSE, A-Level, T-Level and BTEC.</p>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#fff" }}>Resources</div>
          {RES_TYPES.map((r) => <div key={r} style={{ fontSize: 14, marginTop: 6 }}>{r}</div>)}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#fff" }}>Contact</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>📧 info@jdscience.co.uk</div>
          <div style={{ fontSize: 14, marginTop: 6 }}>📞 07466 142805</div>
        </div>
      </div>
      <div style={{ textAlign: "center", color: "#64748b", marginTop: 24, fontSize: 13 }}>© {new Date().getFullYear()} jdscience.co.uk — All rights reserved.</div>
    </footer>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [pickedSubject, setPickedSubject] = useState(null);
  const [pickedLevel, setPickedLevel] = useState(null);
  const [pickedRes, setPickedRes] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [store, setStore] = useState(loadStore());

  const goPapers = () => { setPage("papers"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goHome = () => { setPage("home"); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const handlePick = (lvl, subj) => { if (lvl) setPickedLevel(lvl); if (subj) setPickedSubject(subj); goPapers(); };
  const handleLevel = (lvl) => { setPickedLevel(lvl); setPickedSubject(LEVEL_SUBJECTS[lvl][0]); goPapers(); };
  const handleResource = (res) => { setPickedRes(res); goPapers(); };

  const handleScroll = (target) => {
    const id = target === "contact" ? "contact-anchor" : target === "tutor" ? "tutor-anchor" : "book-anchor";
    if (page !== "home") {
      setPage("home");
      setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }); }, 120);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#0f172a", background: "#f8fafc" }}>
      <Navbar onHome={goHome} onPick={handlePick} onResource={handleResource} onScroll={handleScroll}
        onSearch={(q) => q && goPapers()} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

      {page === "home" && (
        <main>
          <Hero onScroll={handleScroll} onBrowse={goPapers} />
          <BoardStrip />
          <LevelGrid onLevel={handleLevel} />
          <div id="book-anchor"><Booking /></div>
          <div id="tutor-anchor"><BecomeTutor /></div>
          <div id="contact-anchor"><Contact /></div>
        </main>
      )}

      {page === "papers" && (
        <main>
          <PastPapers subject={pickedSubject} level={pickedLevel} resType={pickedRes}
            isAdmin={isAdmin} store={store} setStore={setStore} onBook={() => handleScroll("book")} />
        </main>
      )}

      <Footer />
    </div>
  );
}

export default App;
