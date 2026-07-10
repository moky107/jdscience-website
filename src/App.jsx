import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "./supabaseClient";

/* ============================================================ 
   jdscience.co.uk — Topic-Based & Premium-Ready 
============================================================ */

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const ADMIN_EMAILS = ["jd943791@gmail.com"];
const BUCKET = "resources";

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

function slugify(t) { return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function levelKey(l) {
  const s = slugify(l);
  if (s.includes("11")) return "11+";
  if (s.includes("gcse") || s.includes("igcse")) return "GCSE/IGCSE";
  if (s.includes("a-level") || s === "alevel") return "A-Level";
  return l;
}

const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box" };

/* ------------------------- PAST PAPERS (Topic Grouping) ------------------------- */
function PastPapers({ subject, level, resType, isAdmin, resources, reload, onBook }) {
  const [activeLevel, setActiveLevel] = useState(level || "GCSE/IGCSE");
  const [activeSubject, setActiveSubject] = useState(subject || (SUBJECTS_BY_LEVEL[activeLevel]?.[0]));
  const [activeRes, setActiveRes] = useState(resType || "Revision Notes");
  const [uploadBoard, setUploadBoard] = useState(null);

  useEffect(() => { if (level) setActiveLevel(level); }, [level]);
  useEffect(() => { if (subject) setActiveSubject(subject); }, [subject]);
  useEffect(() => { if (resType) setActiveRes(resType); }, [resType]);

  const boardsForLevel = BOARDS_BY_LEVEL[activeLevel] || [];

  const itemsFor = (board) => resources.filter(r => 
    levelKey(r.level) === activeLevel &&
    slugify(r.subject) === slugify(activeSubject) &&
    slugify(r.exam_board) === slugify(board) &&
    slugify(r.resource_category) === slugify(activeRes)
  );

  async function removeItem(item) {
    if (!window.confirm("Delete this resource?")) return;
    if (item.storage_path) await supabase.storage.from(BUCKET).remove([item.storage_path]);
    await supabase.from("resources").delete().eq("id", item.id);
    reload();
  }

  return (
    <section style={{ padding: "28px 20px", background: "#f8fafc", minHeight: "70vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Navigation Filters */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {LEVELS.map(l => <button key={l} onClick={() => setActiveLevel(l)} style={{ ...btnStyle, background: activeLevel === l ? TEAL : "#fff", color: activeLevel === l ? "#fff" : "#475569" }}>{l}</button>)}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {(SUBJECTS_BY_LEVEL[activeLevel] || []).map(s => <button key={s} onClick={() => setActiveSubject(s)} style={{ ...btnStyle, borderRadius: 20, background: activeSubject === s ? TEAL_DARK : "#e2e8f0", color: activeSubject === s ? "#fff" : "#334155" }}>{s}</button>)}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {RES_TYPES.map(r => <button key={r} onClick={() => setActiveRes(r)} style={{ ...btnStyle, background: activeRes === r ? "#0f172a" : "#cbd5e1", color: "#fff" }}>{r}</button>)}
          </div>
        </div>

        <h2 style={{ color: "#0f172a", marginBottom: 20 }}>{activeLevel} {activeSubject} — {activeRes}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {boardsForLevel.map(board => {
            const items = itemsFor(board);
            if (items.length === 0 && !isAdmin) return null;

            // GROUPING LOGIC FOR REVISION NOTES
            const isNoteType = activeRes === "Revision Notes" && activeLevel !== "11+";
            const grouped = isNoteType 
              ? items.reduce((acc, item) => {
                  const t = item.topic || "General Resources";
                  if (!acc[t]) acc[t] = [];
                  acc[t].push(item);
                  return acc;
                }, {})
              : { "Files": items };

            return (
              <div key={board} style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.05)", border: "1px solid #eef2f7" }}>
                <div style={{ background: TEAL_DARK, color: "#fff", padding: "12px 16px", fontWeight: 800, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>{board}</div>
                <div style={{ padding: 16 }}>
                  {Object.keys(grouped).map(topicName => (
                    <div key={topicName} style={{ marginBottom: 16 }}>
                      {isNoteType && <h4 style={{ margin: "0 0 8px 0", color: TEAL, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>{topicName}</h4>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {grouped[topicName].map(p => (
                          <div key={p.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <a href={p.file_url} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#0f172a" }}>
                              <span>{p.title}</span>
                              {p.is_premium && <span style={{ fontSize: 10, background: "#fbbf24", color: "#000", padding: "2px 6px", borderRadius: 4, fontWeight: 800 }}>⭐ PREMIUM</span>}
                            </a>
                            {isAdmin && <button onClick={() => removeItem(p)} style={{ border: "none", background: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: 8, cursor: "pointer" }}>✕</button>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {isAdmin && (
                    <button onClick={() => setUploadBoard(board)} style={{ width: "100%", padding: 10, border: `1px dashed ${TEAL}`, borderRadius: 8, color: TEAL, fontWeight: 700, cursor: "pointer", background: "none" }}>+ Add to {board}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {uploadBoard && <UploadModal level={activeLevel} subject={activeSubject} board={uploadBoard} category={activeRes} close={() => setUploadBoard(null)} reload={reload} />}
    </section>
  );
}

/* ------------------------------ UPLOAD MODAL ------------------------------ */
function UploadModal({ level, subject, board, category, close, reload }) {
  const [mode, setMode] = useState("file");
  const [commonTopic, setCommonTopic] = useState("");
  const [commonPremium, setCommonPremium] = useState(false);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef();

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files).map(f => ({
      file: f, name: f.name, title: f.name.replace(/\.[^.]+$/, ""), 
      topic: commonTopic, is_premium: commonPremium, status: "ready"
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  async function save() {
    if (files.length === 0) return alert("Select files first");
    setBusy(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const item = files[i];
        const path = `${slugify(level)}/${slugify(subject)}/${slugify(board)}/${Date.now()}-${item.name}`;
        
        // 1. Upload to Storage
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, item.file);
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

        // 2. Insert into DB
        const { error: dbErr } = await supabase.from("resources").insert({
          level, subject, exam_board: board, resource_category: category,
          title: item.title, file_url: publicUrl, storage_path: path,
          topic: item.topic || commonTopic, is_premium: item.is_premium || commonPremium,
          published: true
        });
        if (dbErr) throw dbErr;
      }
      reload(); close();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 10000, display: "grid", placeItems: "center" }}>
      <div style={{ background: "#fff", width: "min(500px, 95vw)", padding: 24, borderRadius: 16 }}>
        <h3>Bulk Upload: {board}</h3>
        <p style={{ fontSize: 13, color: "#64748b" }}>Category: {category}</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
          {/* Global settings for the batch */}
          <input style={inp} placeholder="Topic (e.g. Atomic Structure)" value={commonTopic} onChange={e => setCommonTopic(e.target.value)} />
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
            <input type="checkbox" checked={commonPremium} onChange={e => setCommonPremium(e.target.checked)} />
            Mark these as Premium Resources
          </label>
          
          <div onClick={() => inputRef.current.click()} style={{ border: "2px dashed #cbd5e1", padding: 30, textAlign: "center", cursor: "pointer", borderRadius: 12 }}>
            <span style={{ fontSize: 30 }}>📁</span>
            <p>Click to select multiple files</p>
            <input ref={inputRef} type="file" multiple hidden onChange={handleFileSelect} />
          </div>

          {files.map((f, idx) => (
            <div key={idx} style={{ padding: 8, background: "#f1f5f9", borderRadius: 8, fontSize: 12, display: "flex", justifyContent: "space-between" }}>
              <span>{f.name}</span>
              <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} style={{ border: "none", color: "red", cursor: "pointer" }}>Remove</button>
            </div>
          ))}

          <button onClick={save} disabled={busy} style={{ ...btnStyle, background: TEAL, color: "#fff", width: "100%", padding: 14 }}>
            {busy ? "Uploading Batch..." : `Upload ${files.length} Files`}
          </button>
          <button onClick={close} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = { padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 };

/* --- REMAINDER OF APP (Navbar/Home/Hero/Footer/Booking/Auth) REMAINS SAME AS PREVIOUS --- */
/* (Reference your previous App.jsx sections for Navbar, Hero, Booking, Footer below) */
function Navbar({ onHome, onPick, onResource, onScroll, onSearch, session, isAdmin, onAuth, onLogout }) {
    // ... Copy implementation from previous version ...
}

// ... etc ... (Ensure full implementation matches your project structure)
export default App;
