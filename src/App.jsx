import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
/* ============================================================
   jdscience.co.uk — Teal Classic (Supabase-connected)
============================================================ */

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const ADMIN_EMAILS = ["jd943791@gmail.com"];
const BUCKET = "resources"; // Supabase Storage bucket name

const BANNER_IMG = "/hero-students.png.png";
const INTRO_VIDEO_EMBED_URL = "https://www.youtube.com/embed/TjPFZaMe2yw";

/* -------- Qualification-specific data (single source of truth) -------- */
const LEVELS = ["11+", "GCSE/IGCSE", "A-Level", "T-Level", "BTEC"];

const SUBJECTS_BY_LEVEL = {
  "11+": ["English", "Maths", "Verbal Reasoning", "Non-Verbal Reasoning"],
  "GCSE/IGCSE": ["Biology", "Chemistry", "Physics", "Combined Science", "Maths"],
  "A-Level": ["Biology", "Chemistry", "Physics", "Maths"],
  "T-Level": ["Science", "Health", "Laboratory Sciences", "Healthcare Science"],
  "BTEC": ["Applied Science", "Health and Social Care", "Engineering", "Business", "Computing"],
};

const BOARDS_BY_LEVEL = {
  "11+": ["Independent Schools", "Grammar Schools"],
  "GCSE/IGCSE": ["AQA", "Edexcel", "OCR", "Eduqas", "Cambridge International"],
  "A-Level": ["AQA", "Edexcel", "OCR", "Eduqas", "Cambridge International"],
  "T-Level": ["NCFE", "Pearson", "City & Guilds"],
  "BTEC": ["Pearson"],
};

const RES_TYPES = ["Revision Notes", "Past Questions", "Mark Schemes", "Videos"];

function slugify(t) {
  return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
/* tolerant level matcher for older stored rows */
function levelKey(l) {
  const s = slugify(l);
  if (s.includes("11")) return "11+";
  if (s.includes("gcse") || s.includes("igcse")) return "GCSE/IGCSE";
  if (s.includes("a-level") || s === "alevel") return "A-Level";
  if (s.includes("t-level") || s === "tlevel") return "T-Level";
  if (s.includes("btec")) return "BTEC";
  return l;
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

/* --------------------------------- NAVBAR --------------------------------- */
function Navbar({ onHome, onPick, onResource, onScroll, onSearch, session, isAdmin, onAuth, onLogout }) {
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const menu = [
    { label: "Home", type: "link", action: onHome },
    ...LEVELS.map((lvl) => ({
      label: lvl, type: "dropdown",
      options: SUBJECTS_BY_LEVEL[lvl].map((s) => ({ text: s, action: () => onPick(lvl, s) })),
    })),
    { label: "Resources", type: "dropdown", options: RES_TYPES.map((r) => ({ text: r, action: () => onResource(r) })) },
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

  const adminBtn = session ? (
    <button type="button" onClick={onLogout}
      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: isAdmin ? "#10b981" : "#fff", color: isAdmin ? "#fff" : "#111", cursor: "pointer" }}>
      {isAdmin ? "Admin ✓" : "Logout"}
    </button>
  ) : (
    <button type="button" onClick={onAuth}
      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", color: "#111", cursor: "pointer" }}>
      Login
    </button>
  );

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", gap: 12 }}>
        {logo}
        {!isMobile && (
          <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input placeholder="Search subjects or topics..." value={q} onChange={(e) => setQ(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", width: 190 }} />
            <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer" }}>Search</button>
            {adminBtn}
          </form>
        )}
        {isMobile && (
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu"
            style={{ fontSize: 28, background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 4 }}>{menuOpen ? "✕" : "☰"}</button>
        )}
      </div>

      {!isMobile && (
        <nav style={{ display: "flex", gap: 2, padding: "0 14px", background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)", justifyContent: "center", flexWrap: "wrap" }}>
          {menu.map((it, i) => (
            <div key={it.label} style={{ position: "relative" }}
              onMouseEnter={() => setOpenIdx(i)} onMouseLeave={() => setOpenIdx(null)}>
              <button onClick={() => it.type === "link" && it.action()}
                style={{ background: openIdx === i && it.type === "dropdown" ? "#d9f6fa" : "transparent", border: "none", padding: "12px 14px", cursor: "pointer", fontWeight: 700, color: "#0f172a", fontSize: 14, whiteSpace: "nowrap" }}>
                {it.label}{it.type === "dropdown" ? " ▾" : ""}
              </button>
              {it.type === "dropdown" && openIdx === i && (
                <div style={{ position: "absolute", top: "100%", left: 0, minWidth: 200, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.14)", borderRadius: "0 0 8px 8px", overflow: "hidden", zIndex: 10 }}>
                  {it.options.map((opt) => (
                    <div key={opt.text} onClick={opt.action}
                      style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", fontSize: 14, color: "#0f172a" }}
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
        <nav style={{ background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)", padding: "8px 0", maxHeight: "72vh", overflowY: "auto" }}>
          {menu.map((it) => (
            <div key={it.label}>
              <button onClick={() => { if (it.type === "link") { it.action(); setMenuOpen(false); } }}
                style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "13px 18px", cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>{it.label}</button>
              {it.type === "dropdown" && it.options.map((opt) => (
                <button key={opt.text} onClick={() => { opt.action(); setMenuOpen(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "9px 34px", cursor: "pointer", color: "#0e7490", fontSize: 14 }}>• {opt.text}</button>
              ))}
            </div>
          ))}
          <form onSubmit={submit} style={{ display: "flex", gap: 8, padding: "10px 18px" }}>
            <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "10px 12px", borderRadius: 8, border: "1px solid #e6e6e6" }} />
            <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, background: TEAL, color: "#fff", border: "none" }}>Go</button>
          </form>
          <div style={{ padding: "0 18px 12px" }}>{adminBtn}</div>
        </nav>
      )}
    </header>
  );
}

/* ---------------------------------- HERO ---------------------------------- */
function Hero({ onScroll, onBrowse }) {
  const isMobile = useIsMobile();
  return (
    <section style={{ position: "relative", minHeight: isMobile ? 420 : 480, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff", overflow: "hidden" }}>
      <img src={BANNER_IMG} alt="Students learning together"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,77,64,.55), rgba(0,150,136,.35))" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 760, padding: "40px 18px" }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,.16)", padding: "6px 14px", borderRadius: 20, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>🏆 Expert Science &amp; Maths Tutoring for Everyone</div>
        <h1 style={{ fontSize: isMobile ? 26 : 44, margin: "0 0 14px", lineHeight: 1.15, fontWeight: 800 }}>
          Learn Smarter. Revise Better. <span style={{ color: "#fbbf24" }}>Achieve More.</span>
        </h1>
        <p style={{ fontSize: isMobile ? 15 : 18, color: "rgba(255,255,255,.95)", maxWidth: 600, margin: "0 auto", lineHeight: 1.55 }}>
          Free past papers, revision notes &amp; mark schemes for 11+, GCSE/IGCSE, A-Level, T-Level and BTEC — plus expert 1-to-1 tutoring.
        </p>
        <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={onBrowse} style={{ padding: "13px 22px", borderRadius: 8, border: "none", background: "#fff", color: TEAL_DARK, cursor: "pointer", fontWeight: 800, fontSize: 15 }}>Browse Resources</button>
          <button onClick={() => onScroll("book")} style={{ padding: "13px 22px", borderRadius: 8, border: "2px solid rgba(255,255,255,.7)", background: "transparent", color: "#fff", cursor: "pointer", fontWeight: 800, fontSize: 15 }}>Book a Tutor</button>
        </div>
      </div>
    </section>
  );
}

function BoardStrip() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: "14px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", color: "#475569", fontWeight: 700 }}>
        <span style={{ color: "#94a3b8" }}>Covering:</span>
        {["AQA", "Edexcel", "OCR", "Eduqas", "Cambridge International", "Pearson", "NCFE"].map((b) => <span key={b}>{b}</span>)}
      </div>
    </div>
  );
}

function OffersSection() {
  const isMobile = useIsMobile();
  const offers = [
    { title: "Resources", text: "Revision notes, how questions are framed, past questions, mark schemes and examiner reports." },
    { title: "Tutoring", text: "Book support for 11+, GCSE, IGCSE, A-Level, BTEC and T-Level." },
    { title: "Tutor Profiles", text: "Approved tutors appear live after admin approval." },
    { title: "Admin Control", text: "Admin can upload resources directly for visitors to download." },
  ];
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ color: "#0f172a", fontSize: isMobile ? 24 : 28, margin: "0 0 22px" }}>What JD Science Offers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {offers.map((o) => (
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

function LevelGrid({ onLevel }) {
  const isMobile = useIsMobile();
  const blurb = { "11+": "Entrance exam prep & practice", "GCSE/IGCSE": "Years 10–11 · all boards", "A-Level": "Years 12–13 · exam-ready", "T-Level": "Technical qualifications", "BTEC": "Vocational courses" };
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#0f172a", fontSize: isMobile ? 24 : 28, margin: 0 }}>Choose Your Level</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: 4 }}>Pick where you're studying — then choose your subject</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 26 }}>
          {LEVELS.map((l) => (
            <div key={l} onClick={() => onLevel(l)}
              style={{ background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, color: "#fff", borderRadius: 14, padding: 20, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.1)" }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{l}</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.9)", margin: "8px 0 0" }}>{blurb[l]}</p>
              <div style={{ marginTop: 14, fontWeight: 700, fontSize: 14 }}>Explore →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- PAST PAPERS (Supabase) ------------------------- */
function PastPapers({ subject, level, resType, isAdmin, resources, reload, onBook }) {
  const isMobile = useIsMobile();
  const [activeLevel, setActiveLevel] = useState(level || "GCSE/IGCSE");
  const subjectsForLevel = SUBJECTS_BY_LEVEL[activeLevel] || [];
  const boardsForLevel = BOARDS_BY_LEVEL[activeLevel] || [];

  const [activeSubject, setActiveSubject] = useState(subject || subjectsForLevel[0]);
  const [activeRes, setActiveRes] = useState(resType || "Past Questions");
  const [uploadBoard, setUploadBoard] = useState(null); // board name -> opens modal

  useEffect(() => { if (level) setActiveLevel(level); }, [level]);
  useEffect(() => { if (subject) setActiveSubject(subject); }, [subject]);
  useEffect(() => { if (resType) setActiveRes(resType); }, [resType]);

  useEffect(() => {
    const list = SUBJECTS_BY_LEVEL[activeLevel] || [];
    if (!list.includes(activeSubject)) setActiveSubject(list[0]);
  }, [activeLevel]); // eslint-disable-line

  const itemsFor = (board) =>
    resources.filter((r) =>
      levelKey(r.level) === activeLevel &&
      slugify(r.subject) === slugify(activeSubject) &&
      slugify(r.exam_board) === slugify(board) &&
      slugify(r.resource_category) === slugify(activeRes)
    );

  async function removeItem(item) {
    if (!window.confirm("Delete this resource?")) return;
    if (item.storage_path) await supabase.storage.from(BUCKET).remove([item.storage_path]);
    const { error } = await supabase.from("resources").delete().eq("id", item.id);
    if (error) alert(error.message); else reload();
  }

  return (
    <section style={{ padding: isMobile ? "20px 14px" : "28px 20px", background: "#f8fafc", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>Home › {activeRes} › {activeLevel} › {activeSubject}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,.06)", marginBottom: 22, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Need help with {activeSubject}?</div>
            <div style={{ color: "#64748b", fontSize: 14 }}>1-to-1 tutoring with an experienced specialist · ✓ Qualified · ⭐ 5.0</div>
          </div>
          <button onClick={onBook} style={{ padding: "10px 18px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>Book Tutor</button>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Level</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setActiveLevel(l)}
              style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${activeLevel === l ? TEAL : "#cbd5e1"}`, cursor: "pointer", fontWeight: 600, fontSize: 13, background: activeLevel === l ? "#ecfeff" : "#fff", color: activeLevel === l ? TEAL_DARK : "#475569" }}>{l}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Subject</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {subjectsForLevel.map((s) => (
            <button key={s} onClick={() => setActiveSubject(s)}
              style={{ padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: activeSubject === s ? TEAL : "#e2e8f0", color: activeSubject === s ? "#fff" : "#334155" }}>{s}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Resource Type</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {RES_TYPES.map((r) => (
            <button key={r} onClick={() => setActiveRes(r)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: activeRes === r ? TEAL_DARK : "#e2e8f0", color: activeRes === r ? "#fff" : "#334155" }}>{r}</button>
          ))}
        </div>

        <h2 style={{ color: "#0f172a", marginBottom: 16, fontSize: isMobile ? 19 : 24 }}>{activeLevel} {activeSubject} — {activeRes} by {activeLevel === "11+" ? "School Type" : "Exam Board"}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {boardsForLevel.map((board) => {
            const items = itemsFor(board);
            if (items.length === 0 && !isAdmin) return null;
            return (
              <div key={board} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,.06)" }}>
                <div style={{ background: TEAL_DARK, color: "#fff", padding: "12px 14px", fontWeight: 800 }}>{board}</div>
                <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map((p) => (
                    <div key={p.id} style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
                      <a href={p.file_url} target="_blank" rel="noreferrer"
                        style={{ flex: 1, textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14, color: "#0f172a", textDecoration: "none" }}>
                        {activeRes === "Videos" ? "▶️" : "📄"} {p.title}
                      </a>
                      {isAdmin && (
                        <button onClick={() => removeItem(p)} title="Delete"
                          style={{ padding: "0 10px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>✕</button>
                      )}
                    </div>
                  ))}
                  {isAdmin && (
                    <button onClick={() => setUploadBoard(board)}
                      style={{ padding: "9px 12px", borderRadius: 8, border: `1px dashed ${TEAL}`, background: "#fff", color: TEAL, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>+ Add resource</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {uploadBoard && (
        <UploadModal
          level={activeLevel} subject={activeSubject} board={uploadBoard} category={activeRes}
          close={() => setUploadBoard(null)} reload={reload}
        />
      )}
    </section>
  );
}

/* ------------------------------ UPLOAD MODAL (multi-file) ------------------------------ */
function UploadModal({ level, subject, board, category, close, reload }) {
  const [mode, setMode] = useState("file"); // "file" | "link"
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState([]); // array of { file, name, progress, status, storage_path, url }
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = React.useRef(null);

  const addFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const arr = Array.from(fileList).map((f) => ({
      file: f,
      name: f.name,
      title: f.name.replace(/\.[^.]+$/, ""),
      progress: 0,
      status: "ready", // ready|uploading|done|error
      storage_path: null,
      url: null,
      error: null,
    }));
    setFiles((cur) => [...cur, ...arr]);
    // prefill title if empty
    if (!title && arr.length === 1) setTitle(arr[0].title);
  };

  const pickFiles = (fList) => addFiles(fList);

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    pickFiles(e.dataTransfer.files);
  };

  const removeLocalFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  async function uploadSingle(fileObj, idx) {
    const f = fileObj.file;
    const clean = `${Date.now()}-${slugify(f.name)}`;
    const storage_path = `${slugify(level)}/${slugify(subject)}/${slugify(board)}/${slugify(category)}/${clean}`;
    try {
      fileObj.status = "uploading";
      setFiles((cur) => {
        const next = [...cur];
        next[idx] = { ...fileObj };
        return next;
      });

      const up = await supabase.storage.from(BUCKET).upload(storage_path, f, { cacheControl: "3600", upsert: true });
      if (up.error) throw up.error;
      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storage_path).data.publicUrl;

      const { error } = await supabase.from("resources").insert({
        level, subject, exam_board: board, resource_category: category,
        title: fileObj.title || fileObj.name, file_name: fileObj.name,
        file_url: publicUrl, file_type: f.type || fileObj.name.split(".").pop(), storage_path, published: true,
      });
      if (error) throw error;

      fileObj.status = "done";
      fileObj.progress = 100;
      fileObj.storage_path = storage_path;
      fileObj.url = publicUrl;
      setFiles((cur) => {
        const next = [...cur];
        next[idx] = { ...fileObj };
        return next;
      });
      return { success: true };
    } catch (err) {
      fileObj.status = "error";
      fileObj.error = err.message || String(err);
      setFiles((cur) => {
        const next = [...cur];
        next[idx] = { ...fileObj };
        return next;
      });
      return { success: false, error: err };
    }
  }

  async function save() {
    if (mode === "link") {
      if (!title.trim()) { alert("Please enter a title."); return; }
      if (!link.trim()) { alert("Please paste a link."); return; }
      setBusy(true);
      try {
        const { error } = await supabase.from("resources").insert({
          level, subject, exam_board: board, resource_category: category,
          title: title.trim(), file_name: title.trim(), file_url: link.trim(), file_type: "link", storage_path: null, published: true,
        });
        if (error) alert(error.message); else { reload(); close(); }
      } finally { setBusy(false); }
      return;
    }

    if (files.length === 0) { alert("Please choose or drop one or more files."); return; }
    setBusy(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fobj = files[i];
        if (fobj.status === "done") continue;
        if (!fobj.title) fobj.title = fobj.name.replace(/\.[^.]+$/, "");
        await uploadSingle(fobj, i);
      }
      reload();
      close();
    } finally {
      setBusy(false);
    }
  }

  const tab = (m, label) => (
    <button onClick={() => setMode(m)}
      style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 800,
        background: mode === m ? TEAL : "#e2e8f0", color: mode === m ? "#fff" : "#334155" }}>{label}</button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 2000, padding: 16 }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, width: "min(640px,98vw)", maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <h2 style={{ margin: 0 }}>Add Resource</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>{level} · {subject} · {board} · {category}</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>{tab("file", "⬆️ Upload File(s)")} {tab("link", "🔗 Paste Link")}</div>

        {mode === "file" && (
          <>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inp, flex: 1 }} placeholder="Common title (optional - used for single file)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => inputRef.current?.click()} style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${TEAL}`, background: "#fff", color: TEAL, cursor: "pointer", fontWeight: 700 }}>Browse</button>
                <button onClick={() => { setFiles([]); setTitle(""); }} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", cursor: "pointer" }}>Clear</button>
              </div>
            </div>

            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              style={{ border: `2px dashed ${drag ? TEAL : "#cbd5e1"}`, background: drag ? "#ecfeff" : "#f8fafc",
                borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer", color: "#475569" }}>
              <div style={{ fontSize: 28 }}>📂</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>{files.length === 0 ? "Drag & drop files here (or click to browse)" : `${files.length} file(s) selected`}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Supports multiple files — Word, PDF, images, PPT, etc.</div>
            </div>

            <input ref={inputRef} type="file" hidden multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.md,.odt" onChange={(e) => addFiles(e.target.files)} />

            {files.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} style={{ display: "flex", gap: 8, alignItems: "center", padding: 8, borderRadius: 8, background: "#fff", border: "1px solid #eef2f7" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{f.name}</div>
                    </div>
                    <div style={{ minWidth: 120, textAlign: "right", fontWeight: 700 }}>
                      {f.status === "ready" && <span style={{ color: "#0f172a" }}>Ready</span>}
                      {f.status === "uploading" && <span style={{ color: TEAL }}>{f.progress || "…"}%</span>}
                      {f.status === "done" && <span style={{ color: "green" }}>Uploaded</span>}
                      {f.status === "error" && <span style={{ color: "#dc2626" }}>Error</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => {
                        const newTitle = prompt("Edit title for this file:", f.title);
                        if (newTitle !== null) {
                          setFiles((cur) => {
                            const next = [...cur];
                            next[i] = { ...next[i], title: newTitle };
                            return next;
                          });
                        }
                      }} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", cursor: "pointer" }}>Edit</button>
                      <button onClick={() => removeLocalFile(i)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#dc2626", cursor: "pointer" }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mode === "link" && (
          <>
            <input style={inp} placeholder="Title (e.g. Paper 1 — June 2023)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input style={inp} placeholder="Paste file / YouTube / Drive link" value={link} onChange={(e) => setLink(e.target.value)} />
          </>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={save} disabled={busy}
            style={{ padding: 12, borderRadius: 8, background: busy ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: busy ? "default" : "pointer", fontWeight: 800 }}>
            {busy ? "Uploading…" : "Save Resource(s)"}
          </button>
          <button type="button" onClick={close} style={{ background: "none", border: 0, color: "#64748b", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- BOOKING --------------------------------- */
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box" };

function Booking() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    level: "GCSE/IGCSE",
    subject: SUBJECTS_BY_LEVEL["GCSE/IGCSE"][0],
    message: "",
    sessionType: "single"
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);

  const set = (k, v) => setForm((f) => {
    const next = { ...f, [k]: v };
    if (k === "level") next.subject = (SUBJECTS_BY_LEVEL[v] || [])[0] || "";
    return next;
  });

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("tutoring_services")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (data) setServices(data);
      } catch (err) {
        console.error("Could not load services:", err);
      }
    })();
  }, []);

  function priceLabel(level, type) {
    if (type === "trial") return "Free";
    const svc = services.find(s => s.level === level || s.slug === level);
    if (!svc) {
      const premium = level && (level.includes("A-Level") || level.includes("T-Level") || level.includes("BTEC"));
      if (premium) return type === "package" ? "£400" : "£45/hr";
      return type === "package" ? "£300" : "£35/hr";
    }
    return type === "package" ? `£${svc.package_price_10}` : `£${svc.price_per_hour}/hr`;
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.email) {
      alert("Please enter name and email");
      setLoading(false);
      return;
    }

    try {
      // Free trials go through a server API that uses the service role key,
      // so Supabase RLS does not block the insert.
      if (form.sessionType === "trial") {
        const resp = await fetch("/api/create-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            level: form.level,
            subject: form.subject,
            message: form.message,
            sessionType: "trial",
          }),
        });
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.error || "Failed to book free trial");
        setSent(true);
        setLoading(false);
        return;
      }

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        level: form.level,
        subject: form.subject,
        sessionType: form.sessionType === "package" ? "package" : "single",
      };

      const resp = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(body?.error || "Failed to create checkout session");
      }

      if (body.url) {
        window.location.href = body.url;
      } else {
        throw new Error("Missing Stripe redirect URL");
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || "unknown"));
      setLoading(false);
    }
  }

  const price = priceLabel(form.level, form.sessionType);

  return (
    <section style={{ background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, padding: isMobile ? "32px 16px" : "48px 20px", color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 28, alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 24 : 28, marginTop: 0 }}>Book a Tutoring Session</h2>
          <p style={{ color: "rgba(255,255,255,.9)" }}>Personalised 1-to-1 lessons across science and maths.</p>
          <ul style={{ lineHeight: 1.9, paddingLeft: 18 }}>
            <li>✓ 11+ / GCSE / T-Level / BTEC — <b>£35–£45/hr</b></li>
            <li>✓ Free 30‑minute trial available for first-time students</li>
            <li>✓ Packages available for discount pricing</li>
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
              <input placeholder="Phone (WhatsApp ok)" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <select value={form.level} onChange={(e) => set("level", e.target.value)} style={inp}>
                  {services.length > 0 ? services.map(s => <option key={s.id} value={s.level}>{s.level}</option>)
                    : LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={form.subject} onChange={(e) => set("subject", e.target.value)} style={inp}>
                  {(SUBJECTS_BY_LEVEL[form.level] || []).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="radio" name="sessionType" checked={form.sessionType === "single"} value="single" onChange={() => set("sessionType", "single")} /> Single
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="radio" name="sessionType" checked={form.sessionType === "package"} value="package" onChange={() => set("sessionType", "package")} /> 10-session package
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="radio" name="sessionType" checked={form.sessionType === "trial"} value="trial" onChange={() => set("sessionType", "trial")} /> Free 30-min trial
                </label>
              </div>

              <div style={{ fontWeight: 700, color: TEAL_DARK }}>Price: {price}</div>
              <textarea placeholder="What would you like help with?" value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} style={inp} />
              <button type="submit" disabled={loading} style={{ padding: "12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 800 }}>
                {loading ? "Processing…" : "Request / Book"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- VIDEO / CONTACT / FOOTER --------------------------- */
function VideoSection() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: "#071025", color: "#fff", padding: isMobile ? "40px 16px" : "56px 20px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: isMobile ? 24 : 38, margin: 0 }}>How JD Science Works</h2>
        <p style={{ color: "#cbd5e1", fontSize: isMobile ? 15 : 18, lineHeight: 1.6, maxWidth: 760, margin: "12px auto 26px" }}>
          Watch this short introduction to see how learners use resources, past papers and tutoring support.
        </p>
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.18)", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
          <iframe title="How JD Science Works" src={INTRO_VIDEO_EMBED_URL}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
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
        <h2 style={{ color: "#0f172a", fontSize: isMobile ? 24 : 28 }}>Get in Touch</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16, marginTop: 20 }}>
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
          <p style={{ fontSize: 14, marginTop: 8 }}>Free science &amp; maths resources and expert tutoring for 11+, GCSE/IGCSE, A-Level, T-Level and BTEC.</p>
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

/* ------------------------------ AUTH MODAL -------------------------------- */
function AuthModal({ close }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  async function submit(e) {
    e.preventDefault();
    const res = mode === "login"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (res.error) alert(res.error.message); else close();
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 2000 }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: 26, borderRadius: 16, width: "min(400px,90vw)", display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{mode === "login" ? "Login" : "Register"}</h2>
        <input style={inp} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={inp} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" style={{ padding: 12, borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 800 }}>{mode === "login" ? "Login" : "Register"}</button>
        <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} style={{ background: "none", border: 0, color: TEAL, cursor: "pointer", fontWeight: 700 }}>{mode === "login" ? "Create an account" : "Already have an account?"}</button>
        <button type="button" onClick={close} style={{ background: "none", border: 0, color: "#64748b", cursor: "pointer" }}>Close</button>
      </form>
    </div>
  );
}

/* ------------------------------ ADMIN DASHBOARD --------------------------- */
function AdminDashboard() {
  const [password, setPassword] = useState(() => {
    try { return sessionStorage.getItem("jd_admin_pw") || ""; } catch { return ""; }
  });
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load(pw) {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/admin-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(
          data?.error || (resp.status === 401 ? "Incorrect password." : "Failed to load bookings.")
        );
      }
      setBookings(data.bookings || []);
      setAuthed(true);
      try { sessionStorage.setItem("jd_admin_pw", pw); } catch { /* ignore */ }
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load if a password was remembered for this browser session.
  useEffect(() => {
    let saved = null;
    try { saved = sessionStorage.getItem("jd_admin_pw"); } catch { /* ignore */ }
    if (saved) load(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function submit(e) {
    e.preventDefault();
    if (!password) { setError("Please enter the admin password."); return; }
    load(password);
  }

  function logout() {
    try { sessionStorage.removeItem("jd_admin_pw"); } catch { /* ignore */ }
    setAuthed(false);
    setBookings([]);
    setPassword("");
  }

  const total = bookings.length;
  const trials = bookings.filter((b) => String(b.session_type || "").toLowerCase() === "trial").length;
  const paid = total - trials;

  const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString("en-GB", { timeZone: "Europe/London" }); } catch { return d; }
  };
  const fmtAmount = (a) => (typeof a === "number" && a > 0 ? `£${a.toFixed(2)}` : "Free");

  const th = { textAlign: "left", padding: "10px 12px", fontSize: 12, textTransform: "uppercase", letterSpacing: ".03em", color: "#64748b", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" };
  const td = { padding: "10px 12px", fontSize: 14, color: "#0f172a", borderBottom: "1px solid #eef2f7", verticalAlign: "top" };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, padding: 16 }}>
        <form onSubmit={submit} style={{ background: "#fff", borderRadius: 16, padding: 28, width: "min(400px,92vw)", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 20px 50px rgba(0,0,0,.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Admin — Bookings</h2>
              <div style={{ color: "#64748b", fontSize: 13 }}>Enter your password to continue</div>
            </div>
          </div>
          <input autoFocus type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} style={inp} />
          {error && <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding: 12, borderRadius: 8, background: loading ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: loading ? "default" : "pointer", fontWeight: 800 }}>
            {loading ? "Checking…" : "View bookings"}
          </button>
          <a href="/" style={{ textAlign: "center", color: TEAL, textDecoration: "none", fontSize: 14 }}>← Back to website</a>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
          <div style={{ fontWeight: 800 }}>Bookings Dashboard</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => load(password)} disabled={loading} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700 }}>{loading ? "Refreshing…" : "↻ Refresh"}</button>
          <a href="/" style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", textDecoration: "none", fontWeight: 700 }}>View site</a>
          <button onClick={logout} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>Log out</button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
          {[["Total bookings", total], ["Paid bookings", paid], ["Free trials", trials]].map(([label, value]) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,.05)" }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: TEAL_DARK }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,.05)", overflow: "auto" }}>
          {bookings.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No bookings yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
              <thead>
                <tr>
                  <th style={th}>Date</th><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Phone</th>
                  <th style={th}>Level</th><th style={th}>Subject</th><th style={th}>Type</th><th style={th}>Amount</th><th style={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => (
                  <tr key={b.id || i}>
                    <td style={td}>{fmtDate(b.created_at)}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{b.student_name || "—"}</td>
                    <td style={td}>{b.student_email ? <a href={`mailto:${b.student_email}`} style={{ color: TEAL }}>{b.student_email}</a> : "—"}</td>
                    <td style={td}>{b.phone || "—"}</td>
                    <td style={td}>{b.level || "—"}</td>
                    <td style={td}>{b.subject || "—"}</td>
                    <td style={td}>{b.session_type || "—"}</td>
                    <td style={td}>{fmtAmount(b.amount)}</td>
                    <td style={td}><span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: b.status === "confirmed" ? "#dcfce7" : "#fef9c3", color: b.status === "confirmed" ? "#166534" : "#854d0e" }}>{b.status || "—"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- APP ----------------------------------- */
function App() {
  const [page, setPage] = useState("home");
  const [pickedSubject, setPickedSubject] = useState(null);
  const [pickedLevel, setPickedLevel] = useState(null);
  const [pickedRes, setPickedRes] = useState(null);
  const [session, setSession] = useState(null);
  const [resources, setResources] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success'|'canceled', text }

  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email);

  // Detect the admin dashboard route (?admin=1 or #admin) so no router is needed.
  const isAdminRoute = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("admin") === "1" || window.location.hash === "#admin";
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    loadResources();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // Show a confirmation banner after Stripe Checkout redirects back.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "true") {
        setBanner({
          type: "success",
          text: "Payment successful — thank you! Your booking is confirmed. We'll email you shortly to arrange the session.",
        });
        setPage("home");
        window.history.replaceState({}, "", window.location.pathname);
        setTimeout(() => document.getElementById("book-anchor")?.scrollIntoView({ behavior: "smooth" }), 200);
      } else if (params.get("canceled") === "true") {
        setBanner({
          type: "canceled",
          text: "Payment was cancelled. No charge was made — you can try booking again whenever you're ready.",
        });
        setPage("home");
        window.history.replaceState({}, "", window.location.pathname);
        setTimeout(() => document.getElementById("book-anchor")?.scrollIntoView({ behavior: "smooth" }), 200);
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function loadResources() {
    const { data, error } = await supabase
      .from("resources").select("*").eq("published", true)
      .order("topic_order", { ascending: true }).order("title", { ascending: true });
    if (!error) setResources(data || []);
  }

  const goPapers = () => { setPage("papers"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const goHome = () => { setPage("home"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handlePick = (lvl, subj) => { if (lvl) setPickedLevel(lvl); if (subj) setPickedSubject(subj); goPapers(); };
  const handleLevel = (lvl) => { setPickedLevel(lvl); setPickedSubject(null); goPapers(); };
  const handleResource = (res) => { setPickedRes(res); goPapers(); };
  const handleScroll = (target) => {
    const id = target === "contact" ? "contact-anchor" : "book-anchor";
    if (page !== "home") { setPage("home"); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 120); }
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const logout = async () => { await supabase.auth.signOut(); setSession(null); };

  // The admin dashboard is a standalone page (its own auth) — render it alone.
  if (isAdminRoute) return <AdminDashboard />;

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#0f172a", background: "#f8fafc", overflowX: "hidden" }}>
      <Navbar onHome={goHome} onPick={handlePick} onResource={handleResource} onScroll={handleScroll}
        onSearch={(q) => q && goPapers()} session={session} isAdmin={isAdmin}
        onAuth={() => setAuthOpen(true)} onLogout={logout} />

      {banner && (
        <div
          role="status"
          style={{
            background: banner.type === "success" ? "#ecfdf5" : "#fff7ed",
            color: banner.type === "success" ? "#065f46" : "#9a3412",
            borderBottom: `1px solid ${banner.type === "success" ? "#a7f3d0" : "#fed7aa"}`,
            padding: "14px 18px",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontWeight: 600,
          }}
        >
          <span>{banner.type === "success" ? "✅" : "ℹ️"} {banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            aria-label="Dismiss"
            style={{ background: "transparent", border: 0, cursor: "pointer", fontWeight: 800, color: "inherit", fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      {page === "home" && (
        <main>
          <Hero onScroll={handleScroll} onBrowse={goPapers} />
          <BoardStrip />
          <OffersSection />
          <LevelGrid onLevel={handleLevel} />
          <div id="book-anchor"><Booking /></div>
          <div id="contact-anchor"><Contact /></div>
          <VideoSection />
        </main>
      )}

      {page === "papers" && (
        <main>
          <PastPapers subject={pickedSubject} level={pickedLevel} resType={pickedRes}
            isAdmin={isAdmin} resources={resources} reload={loadResources} onBook={() => handleScroll("book")} />
        </main>
      )}

      {authOpen && <AuthModal close={() => setAuthOpen(false)} />}
      <Footer />
    </div>
  );
}

export default App;
