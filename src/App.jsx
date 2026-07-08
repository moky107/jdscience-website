import React, { useState, useEffect } from "react";
/* ============================================================
   jdscience.co.uk — PMT-style site, Teal Classic theme
============================================================ */

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const ADMIN_PASSWORD = "jdscience2026";

const SUBJECTS = ["Physics", "Chemistry", "Biology", "Maths"];
const LEVELS = ["11+", "GCSE/IGCSE", "A-Level", "T-Level", "BTEC"];
const BOARDS = ["AQA", "Edexcel", "OCR", "Eduqas"];
const RES_TYPES = ["Revision Notes", "Past Questions", "Mark Schemes", "Videos"];

const BANNER_IMG = "https://placehold.co/1400x500/004d40/ffffff?text=jdscience.co.uk";

const STORE_KEY = "jdscience_resources_v1";
function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
  catch { return {}; }
}
function saveStore(obj) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch {}
}

function useIsMobile(bp = 768) {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth <= bp : false);
  useEffect(() => {
    const r = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [bp]);
  return m;
}

function Navbar({ onHome, onPick, onResource, onScroll, onSearch, isAdmin, setIsAdmin }) {
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
    ...LEVELS.map(lvl => ({
      label: lvl, type: "dropdown",
      options: SUBJECTS.map(s => ({ text: s, action: () => onPick(lvl, s) })),
    })),
    { label: "Resources", type: "dropdown", options: RES_TYPES.map(r => ({ text: r, action: () => onResource(r) })) },
    { label: "Find a Tutor", type: "link", action: () => onScroll("book") },
    { label: "Contact", type: "link", action: () => onScroll("contact") },
  ];

  const submit = (e) => { e.preventDefault(); onSearch(q); setMenuOpen(false); };

  const logo = (
    <div onClick={onHome} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 15 }}>jdscience.co.uk</div>
    </div>
  );

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 18px", gap: 12 }}>
        {logo}
        {!isMobile && (
          <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input placeholder="Search subjects or topics..." value={q} onChange={(e) => setQ(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", width: 190 }} />
            <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer" }}>Search</button>
            <button type="button" onClick={handleAdmin}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: isAdmin ? "#10b981" : "#fff", color: isAdmin ? "#fff" : "#111", cursor: "pointer" }}>{isAdmin ? "Admin ✓" : "Admin"}</button>
          </form>
        )}
        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
            style={{ fontSize: 26, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>{menuOpen ? "✕" : "☰"}</button>
        )}
      </div>

      {!isMobile && (
        <nav style={{ display: "flex", gap: 2, padding: "0 14px", background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)", justifyContent: "center" }}>
          {menu.map((it, i) => (
            <div key={it.label} style={{ position: "relative" }}
              onMouseEnter={() => setOpenIdx(i)} onMouseLeave={() => setOpenIdx(null)}>
              <button onClick={() => it.type === "link" && it.action()}
                style={{ background: openIdx === i && it.type === "dropdown" ? "#d9f6fa" : "transparent", border: "none", padding: "12px 14px", cursor: "pointer", fontWeight: 700, color: "#0f172a", fontSize: 14, whiteSpace: "nowrap" }}>
                {it.label}{it.type === "dropdown" ? " ▾" : ""}
              </button>
              {it.type === "dropdown" && openIdx === i && (
                <div style={{ position: "absolute", top: "100%", left: 0, minWidth: 180, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.14)", borderRadius: "0 0 8px 8px", overflow: "hidden", zIndex: 10 }}>
                  {it.options.map(opt => (
                    <div key={opt.text} onClick={opt.action}
                      style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", fontSize: 14, color: "#0f172a" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#ecfeff"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}>{opt.text}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}

      {isMobile && menuOpen && (
        <nav style={{ background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)", padding: "8px 0", maxHeight: "70vh", overflowY: "auto" }}>
          {menu.map(it => (
            <div key={it.label}>
              <button onClick={() => { if (it.type === "link") { it.action(); setMenuOpen(false); } }}
                style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "12px 18px", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{it.label}</button>
              {it.type === "dropdown" && it.options.map(opt => (
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
          <div style={{ padding: "0 18px 12px" }}>
            <button type="button" onClick={() => { handleAdmin(); setMenuOpen(false); }}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: isAdmin ? "#10b981" : "#fff", color: isAdmin ? "#fff" : "#111" }}>{isAdmin ? "Admin: ON" : "Admin"}</button>
          </div>
        </nav>
      )}
    </header>
  );
}

function Hero({ onScroll, onBrowse }) {
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
        {BOARDS.map(b => <span key={b}>{b}</span>)}
      </div>
    </div>
  );
}

function LevelGrid({ onLevel }) {
  const isMobile = useIsMobile();
  const blurb = { "11+": "Entrance exam prep & practice", "GCSE/IGCSE": "Years 10–11 · all boards", "A-Level": "Years 12–13 · exam-ready", "T-Level": "Technical qualifications", "BTEC": "Vocational courses" };
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#0f172a", fontSize: 28, margin: 0 }}>Choose Your Level</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: 4 }}>Pick where you're studying — then choose your subject</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginTop: 26 }}>
          {LEVELS.map(l => (
            <div key={l} onClick={() => onLevel(l)}
              style={{ background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, color: "#fff", borderRadius: 14, padding: 22, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.1)" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
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

function SubjectCards({ onPick }) {
  const isMobile = useIsMobile();
  const colors = { Physics: "#0ea5e9", Chemistry: "#f59e0b", Biology: "#22c55e", Maths: "#8b5cf6" };
  const icons = { Physics: "⚛️", Chemistry: "🧪", Biology: "🧬", Maths: "📐" };
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#0f172a", fontSize: 28 }}>Browse by Subject</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: 4 }}>Past papers, notes & mark schemes for every exam board</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginTop: 26 }}>
          {SUBJECTS.map(s => (
            <div key={s} onClick={() => onPick(s)}
              style={{ background: "#fff", borderRadius: 14, padding: 22, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.06)", borderTop: `4px solid ${colors[s]}` }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <div style={{ fontSize: 34 }}>{icons[s]}</div>
              <h3 style={{ margin: "10px 0 4px", color: "#0f172a" }}>{s}</h3>
              <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>All levels & exam boards</p>
              <div style={{ marginTop: 12, color: colors[s], fontWeight: 700, fontSize: 14 }}>View resources →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PastPapers({ subject, level, resType, isAdmin, store, setStore, onBook }) {
  const isMobile = useIsMobile();
  const [activeSubject, setActiveSubject] = useState(subject || "Physics");
  const [activeLevel, setActiveLevel] = useState(level || "GCSE/IGCSE");
  const [activeRes, setActiveRes] = useState(resType || "Past Questions");

  useEffect(() => { if (subject) setActiveSubject(subject); }, [subject]);
  useEffect(() => { if (level) setActiveLevel(level); }, [level]);
  useEffect(() => { if (resType) setActiveRes(resType); }, [resType]);

  const keyFor = (board) => `${activeRes}|${activeSubject}|${board}|${activeLevel}`;
  const getItems = (board) => store[keyFor(board)] || [];

  const openItem = (item) => { if (item.url) window.open(item.url, "_blank", "noopener"); };

  const addItem = (board) => {
    const name = window.prompt("Resource title (e.g. Paper 1 — June 2023):");
    if (!name) return;
    const url = window.prompt("Paste the file link (Google Drive / YouTube / any public URL):");
    if (!url) return;
    const k = keyFor(board);
    const next = { ...store, [k]: [...(store[k] || []), { name, url }] };
    setStore(next); saveStore(next);
  };

  const removeItem = (board, idx) => {
    const k = keyFor(board);
    const arr = [...(store[k] || [])]; arr.splice(idx, 1);
    const next = { ...store, [k]: arr };
    setStore(next); saveStore(next);
  };

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
          {RES_TYPES.map(r => (
            <button key={r} onClick={() => setActiveRes(r)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: activeRes === r ? TEAL_DARK : "#e2e8f0", color: activeRes === r ? "#fff" : "#334155" }}>{r}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Subject</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setActiveSubject(s)}
              style={{ padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: activeSubject === s ? TEAL : "#e2e8f0", color: activeSubject === s ? "#fff" : "#334155" }}>{s}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Level</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setActiveLevel(l)}
              style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${activeLevel === l ? TEAL : "#cbd5e1"}`, cursor: "pointer", fontWeight: 600, fontSize: 13, background: activeLevel === l ? "#ecfeff" : "#fff", color: activeLevel === l ? TEAL_DARK : "#475569" }}>{l}</button>
          ))}
        </div>

        <h2 style={{ color: "#0f172a", marginBottom: 16 }}>{activeLevel} {activeSubject} — {activeRes} by Exam Board</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {BOARDS.map(board => {
            const items = getItems(board);
            return (
              <div key={board} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,.06)" }}>
                <div style={{ background: TEAL_DARK, color: "#fff", padding: "12px 14px", fontWeight: 800 }}>{board}</div>
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.length === 0 && <div style={{ color: "#94a3b8", fontSize: 13, padding: "4px 2px" }}>No files yet — coming soon</div>}
                  {items.map((p, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                      <button onClick={() => openItem(p)}
                        style={{ flex: 1, textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14, color: "#0f172a" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#ecfeff"; e.currentTarget.style.borderColor = TEAL; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                        {activeRes === "Videos" ? "▶️" : "📄"} {p.name}
                      </button>
                      {isAdmin && (
                        <button onClick={() => removeItem(board, idx)} title="Delete"
                          style={{ padding: "0 10px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>✕</button>
                      )}
                    </div>
                  ))}
                  {isAdmin && (
                    <button onClick={() => addItem(board)}
                      style={{ padding: "9px 12px", borderRadius: 8, border: `1px dashed ${TEAL}`, background: "#fff", color: TEAL, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ Add resource</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const inp = { padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, width: "100%", boxSizing: "border-box" };
function Booking() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", email: "", subject: "Physics", level: "GCSE/IGCSE", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => { e.preventDefault(); setSent(true); };
  const price = form.level === "A-Level" ? "£40/hr" : "£35/hr";

  return (
    <section style={{ background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, padding: isMobile ? "32px 16px" : "48px 20px", color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 28, alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 28, marginTop: 0 }}>Book a Tutoring Session</h2>
          <p style={{ color: "rgba(255,255,255,.9)" }}>Personalised 1-to-1 lessons in Physics, Chemistry, Biology and Maths.</p>
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
              <input required placeholder="Your name" value={form.name} onChange={e => set("name", e.target.value)} style={inp} />
              <input required type="email" placeholder="Email" value={form.email} onChange={e => set("email", e.target.value)} style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <select value={form.subject} onChange={e => set("subject", e.target.value)} style={inp}>
                  {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={form.level} onChange={e => set("level", e.target.value)} style={inp}>
                  {LEVELS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ fontWeight: 700, color: TEAL_DARK }}>Price: {price}</div>
              <textarea placeholder="What would you like help with?" value={form.message} onChange={e => set("message", e.target.value)} rows={3} style={inp} />
              <button type="submit" style={{ padding: "12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 800 }}>Request Session</button>
            </form>
          )}
        </div>
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
          {RES_TYPES.map(r => <div key={r} style={{ fontSize: 14, marginTop: 6 }}>{r}</div>)}
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

function OffersSection() {
  const isMobile = useIsMobile();
  const offers = [
    { title: "Resources", text: "Revision notes, how questions are framed, past questions, mark schemes and examiner reports." },
    { title: "Tutoring", text: "Book support for GCSE, IGCSE, A-Level, BTEC and T-Level." },
    { title: "Tutor Profiles", text: "Approved tutors appear live after admin approval." },
    { title: "Admin Control", text: "Admin can upload resources directly into Supabase for visitors to download." },
  ];
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ color: "#0f172a", fontSize: 28, margin: "0 0 24px" }}>What JD Science Offers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {offers.map(o => (
            <div key={o.title} style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 4px 14px rgba(0,0,0,.06)" }}>
              <h3 style={{ margin: "0 0 8px", color: "#0f172a", fontSize: 18 }}>{o.title}</h3>
              <p style={{ color: "#64748b", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{o.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SubjectsWeOffer({ onPick }) {
  const isMobile = useIsMobile();
  const items = [
    { name: "Physics", icon: "⚛️", price: "£35/hr", bg: "linear-gradient(135deg,#4c1d95,#7c3aed)", desc: "Master the fundamental laws of the universe. From mechanics to…" },
    { name: "Chemistry", icon: "🧪", price: "£35/hr", bg: "linear-gradient(135deg,#065f46,#f59e0b)", desc: "Explore the science of matter and its transformations. From organic…" },
    { name: "Biology", icon: "🧬", price: "£35/hr", bg: "linear-gradient(135deg,#0e7490,#7c3aed)", desc: "Understand the science of life. From cells and genetics to ecology and…" },
    { name: "Maths", icon: "📐", price: "£35/hr", bg: "linear-gradient(135deg,#111827,#334155)", desc: "Build strong mathematical foundations. From algebra and…" },
    { name: "A-Level", icon: "📖", price: "£40/hr", bg: "linear-gradient(135deg,#1e3a8a,#6366f1)", desc: "In-depth A-Level tutoring for top grades in Science and Maths. Exper…" },
    { name: "T-Levels", icon: "🎓", price: "£40/hr", bg: "linear-gradient(135deg,#374151,#0e7490)", desc: "Expert support for T-Level Science qualifications. Combining classroo…" },
    { name: "11+", icon: "☑️", price: "£40/hr", bg: "linear-gradient(135deg,#92400e,#d97706)", desc: "Comprehensive 11+ entrance exam preparation. Build confidence in…" },
  ];
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#0f172a", fontSize: 30, margin: 0 }}>
          Subjects We <span style={{ color: "#7c3aed" }}>Offer</span>
        </h2>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: 8, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          Expert tutoring across core science and maths subjects, tailored to your curriculum and learning style.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 28 }}>
          {items.map(s => (
            <div key={s.name} onClick={() => onPick && onPick(s.name)}
              style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,.08)", cursor: "pointer", border: "1px solid #eef2f7" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <div style={{ height: 130, background: s.bg, display: "flex", alignItems: "flex-end", padding: 14 }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>{s.name}
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 14px", lineHeight: 1.5 }}>{s.desc}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#7c3aed", fontWeight: 800 }}>{s.price}</span>
                  <span style={{ color: "#334155", fontWeight: 600, fontSize: 14 }}>Learn more →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
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
  const handleLevel = (lvl) => { setPickedLevel(lvl); goPapers(); };
  const handleResource = (res) => { setPickedRes(res); goPapers(); };
  const pickSubject = (s) => { setPickedSubject(s); goPapers(); };

  const handleScroll = (target) => {
    const id = target === "contact" ? "contact-anchor" : "book-anchor";
    if (page !== "home") { setPage("home"); setTimeout(() => document.getElementById(id) && document.getElementById(id).scrollIntoView({ behavior: "smooth" }), 120); }
    else { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }); }
  };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#0f172a", background: "#f8fafc" }}>
      <Navbar onHome={goHome} onPick={handlePick} onResource={handleResource} onScroll={handleScroll}
        onSearch={(q) => q && goPapers()} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

      {page === "home" && (
        <main>
          <Hero onScroll={handleScroll} onBrowse={goPapers} />
          <BoardStrip />
          <OffersSection />
          <LevelGrid onLevel={handleLevel} />
          <SubjectsWeOffer onPick={pickSubject} />
          <SubjectCards onPick={pickSubject} />
          <div id="book-anchor"><Booking /></div>
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
