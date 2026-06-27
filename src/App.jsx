// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient"; // keep this import if you use Supabase; file should export { supabase }

const ADMIN_PASSWORD = "admin123"; // change or secure as needed
const CONTACT = { email: "info@jdscience.co.uk", phone: "07466142805" };
const HERO_IMG = "https://cdn.abacus.ai/images/a3ac8de7-2ad2-4a64-bab2-8fbe6d17616e.png";
const FRONT_VIDEO = "https://www.youtube.com/embed/dQw4w9WgXcQ";

const SUBJECTS = {
  Physics: ["Energy", "Electricity", "Forces", "Waves"],
  Chemistry: ["Atomic Structure", "Bonding", "Reactions", "Energetics"],
  Biology: ["Cells", "Genetics", "Ecology", "Homeostasis"],
  Maths: ["Algebra", "Geometry", "Probability", "Statistics"],
};

const EXAM_BOARDS = ["AQA", "Edexcel", "OCR", "Eduqas"];
const RES_SUBJECTS = Object.keys(SUBJECTS);

// Utility: convert possible YouTube URL to embed URL
function toEmbedUrl(url = "") {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return url;
}

// Navbar component
function Navbar({ onOpenResource, onOpenVideos, onOpenSubject, onSearch, isAdmin, setIsAdmin }) {
  const [q, setQ] = useState("");
  const [openIndex, setOpenIndex] = useState(null);

  const handleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      sessionStorage.removeItem("jd_admin");
      return;
    }
    const pw = window.prompt("Admin password:");
    if (pw === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem("jd_admin", "1");
      alert("Admin mode enabled");
    } else if (pw) {
      alert("Wrong password");
    }
  };

  const navMenu = [
    { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "11+", options: ["English", "Maths", "Verbal Reasoning", "Non-Verbal Reasoning"] },
    { label: "GCSE/IGCSE", options: ["Physics", "Chemistry", "Biology", "Maths"] },
    { label: "A-Level", options: ["Physics", "Chemistry", "Biology", "Maths"] },
    { label: "T-Levels", options: ["Health & Science", "Engineering", "Digital", "Education"] },
    { label: "BTEC", options: ["Applied Science", "Engineering", "IT", "Health & Social Care"] },
    { label: "Resources", resource: true, options: ["Revision Notes", "Past Questions"] },
    { label: "Videos", action: () => onOpenVideos() },
    { label: "Contact", action: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) },
  ];

  const onSubmit = (e) => {
    e.preventDefault();
    onSearch(q);
  };

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
          <div style={{ fontWeight: 800 }}>JDScience</div>
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input placeholder="Search subjects, topics..." value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", width: 220 }} />
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer" }}>Search</button>
          <button type="button" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", cursor: "pointer" }}>Find a Tutor</button>
          <button type="button" onClick={handleAdmin} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: isAdmin ? "#10b981" : "#fff", color: isAdmin ? "#fff" : "#111", cursor: "pointer" }}>{isAdmin ? "Admin" : "Admin"}</button>
        </form>
      </div>

      <nav style={{ display: "flex", gap: 6, padding: "8px 16px", background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
        {navMenu.map((it, i) => (
          <div key={it.label} style={{ position: "relative" }} onMouseEnter={() => setOpenIndex(i)} onMouseLeave={() => setOpenIndex(null)}>
            <button
              onClick={() => {
                if (it.action) it.action();
                else if (it.resource) onOpenResource(it.options[0]);
                else if (it.options && it.options.length === 1) onOpenSubject(it.options[0]);
              }}
              style={{ background: "transparent", border: "none", padding: "8px 12px", cursor: "pointer", fontWeight: 700 }}
            >
              {it.label}
            </button>

            {it.options && openIndex === i && (
              <div style={{ position: "absolute", top: "100%", left: 0, minWidth: 180, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", borderRadius: 8, overflow: "hidden" }}>
                {it.options.map((opt) => (
                  <div key={opt} onClick={() => { if (it.resource) onOpenResource(opt); else onOpenSubject(opt); }} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}>{opt}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}

// Hero
function Hero({ onBook }) {
  return (
    <section id="home" style={{ background: "linear-gradient(135deg,#1a0533,#2d1060)", color: "#fff", padding: "48px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 420px", gap: 30, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,.08)", padding: "6px 12px", borderRadius: 20, marginBottom: 12 }}>🏆 Expert Science & Maths Tutoring</div>
          <h1 style={{ fontSize: 36, margin: "12px 0", lineHeight: 1.05 }}>Learn <span style={{ color: "#a78bfa" }}>Smarter</span>. Revise <span style={{ color: "#2dd4bf" }}>Better</span>. Achieve <span style={{ color: "#fbbf24" }}>More</span>.</h1>
          <p style={{ color: "rgba(255,255,255,.85)", maxWidth: 600 }}>Personalised tutoring and professional resources organised by subject, exam board and topic.</p>
          <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
            <button onClick={() => document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" })} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "rgba(255,255,255,.12)", color: "#fff", cursor: "pointer" }}>Explore Subjects</button>
            <button onClick={onBook} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#fff", color: "#7c3aed", cursor: "pointer" }}>Book a Session</button>
          </div>
        </div>

        <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,.4)" }}>
          <img src={HERO_IMG} alt="hero" style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }} />
        </div>
      </div>
    </section>
  );
}

// Front Video
function FrontVideo() {
  const isYouTube = /youtube\.com|youtu\.be/.test(FRONT_VIDEO);
  return (
    <section style={{ padding: "40px 20px", textAlign: "center", background: "#0b0420" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", color: "#fff" }}>
        <h2 style={{ marginBottom: 8 }}>See How JDScience Works</h2>
        <p style={{ color: "rgba(255,255,255,.8)", marginBottom: 18 }}>A short introduction to our approach.</p>
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,.06)" }}>
          {isYouTube ? <iframe src={FRONT_VIDEO} title="intro" style={{ position: "absolute", inset: 0, border: "none" }} allowFullScreen /> : <video src={FRONT_VIDEO} controls style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
      </div>
    </section>
  );
}

// Subjects list
function Subjects({ onOpenSubject, onOpenResource }) {
  return (
    <section id="subjects" style={{ padding: "48px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", marginBottom: 18 }}>Subjects</h2>
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {Object.keys(SUBJECTS).map((s) => (
            <div key={s} style={{ background: "#fff", padding: 18, borderRadius: 12, border: "1px solid #eee" }}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{s}</div>
              <div style={{ color: "#666", marginBottom: 12 }}>Clear, exam-focused topics organised for quick revision.</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => onOpenSubject(s)} style={{ padding: "8px 12px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none" }}>Open</button>
                <button onClick={() => onOpenResource({ type: "Revision Notes", subject: s })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee", background: "#fff" }}>Resources</button>
                <button onClick={() => onOpenResource({ type: "Videos", subject: s })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee", background: "#fff" }}>Videos</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Subject Page (shows available topics and board tabs)
function SubjectPage({ subject, onBack, onOpenResource }) {
  const [board, setBoard] = useState(EXAM_BOARDS[0]);
  const topics = SUBJECTS[subject] || [];

  return (
    <section style={{ padding: "36px 20px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <button onClick={onBack} style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #eee" }}>← Back</button>
        <h2 style={{ marginTop: 6 }}>{subject}</h2>
        <p style={{ color: "#666" }}>Select exam board and topic.</p>

        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EXAM_BOARDS.map((b) => <button key={b} onClick={() => setBoard(b)} style={{ padding: "8px 12px", borderRadius: 20, border: board === b ? "none" : "1px solid #eee", background: board === b ? "#111827" : "#fff", color: board === b ? "#fff" : "#111827" }}>{b}</button>)}
        </div>

        <div style={{ marginTop: 20, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
          {topics.map((t) => (
            <div key={t} style={{ padding: 14, borderRadius: 10, background: "#fff", border: "1px solid #eee" }}>
              <div style={{ fontWeight: 800 }}>{t}</div>
              <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                <button onClick={() => onOpenResource({ type: "Videos", subject, topic: t, board })} style={{ padding: "8px 10px", borderRadius: 8, background: "#ef4444", color: "#fff", border: "none" }}>🎬 Videos</button>
                <button onClick={() => onOpenResource({ type: "Revision Notes", subject, topic: t, board })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #eee", background: "#fff" }}>📚 Notes</button>
                <button onClick={() => onOpenResource({ type: "Past Questions", subject, topic: t, board })} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #eee", background: "#fff" }}>📝 Past</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Resource Browser (Revision Notes / Past Questions) - Subject -> Board -> Topic flow
function ResourceBrowser({ resource, onClose, isAdmin }) {
  // resource: { type, subject?, board?, topic? }
  const type = resource?.type || "Revision Notes";
  const isNotes = type === "Revision Notes";
  const [subject, setSubject] = useState(resource?.subject || null);
  const [board, setBoard] = useState(resource?.board || null);
  const [topic, setTopic] = useState(resource?.topic || null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Build storage path: resources/<type>/<subject>/<board>/<topic or General>
  const folderPath = subject && board ? `resources/${type.replace(/\s+/g, "")}/${subject}/${board}/${topic || "General"}` : null;

  const loadFiles = async () => {
    if (!folderPath) return setFiles([]);
    setLoading(true);
    // Try Supabase storage first
    try {
      if (supabase && supabase.storage) {
        const { data, error } = await supabase.storage.from("resources").list(folderPath);
        if (!error && data) {
          const mapped = data.filter((f) => f.name !== ".emptyFolderPlaceholder").map((f) => {
            const { data: pub } = supabase.storage.from("resources").getPublicUrl(`${folderPath}/${f.name}`);
            return { name: f.name, url: pub?.publicUrl || "" };
          });
          setFiles(mapped);
        } else {
          setFiles([]); // no files or error
        }
      } else {
        // fallback: try localStorage (in-session)
        const raw = localStorage.getItem(folderPath);
        setFiles(raw ? JSON.parse(raw) : []);
      }
    } catch (err) {
      setFiles([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderPath]);

  const upload = async (ev) => {
    if (!folderPath) return alert("Select subject/board/topic first.");
    const list = Array.from(ev.target.files || []);
    if (list.length === 0) return;
    setLoading(true);

    try {
      if (supabase && supabase.storage) {
        for (const f of list) {
          const path = `${folderPath}/${f.name}`;
          // upsert true to overwrite if same name
          const { error } = await supabase.storage.from("resources").upload(path, f, { upsert: true });
          if (error) console.error("Upload error", error);
        }
        await loadFiles();
      } else {
        // fallback: store metadata + Blob url in session (no persistence across reload)
        const existing = files.slice();
        for (const f of list) {
          const url = URL.createObjectURL(f);
          existing.push({ name: f.name, url });
        }
        setFiles(existing);
        localStorage.setItem(folderPath, JSON.stringify(existing));
      }
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    }
    setLoading(false);
  };

  const remove = async (name) => {
    if (!folderPath) return;
    if (!window.confirm(`Delete ${name}?`)) return;
    setLoading(true);
    try {
      if (supabase && supabase.storage) {
        await supabase.storage.from("resources").remove([`${folderPath}/${name}`]);
        await loadFiles();
      } else {
        const filtered = files.filter((f) => f.name !== name);
        setFiles(filtered);
        localStorage.setItem(folderPath, JSON.stringify(filtered));
      }
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
    setLoading(false);
  };

  return (
    <section style={{ padding: "40px 20px", background: "#f9fafb", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ margin: 0 }}>{isNotes ? "📚 Revision Notes" : "📝 Past Questions"}</h2>
          <div>
            <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee", background: "#fff" }}>Back</button>
          </div>
        </div>

        <div style={{ marginBottom: 12, color: "#666" }}>{isNotes ? "Browse by Subject → Exam board → Topic" : "Browse by Subject → Exam board"}</div>

        {!subject ? (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
            {RES_SUBJECTS.map((s) => <button key={s} onClick={() => { setSubject(s); setBoard(null); setTopic(null); }} style={{ padding: 18, borderRadius: 10, background: "#fff", border: "1px solid #eee" }}>{s}</button>)}
          </div>
        ) : !board ? (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
            {EXAM_BOARDS.map((b) => <button key={b} onClick={() => setBoard(b)} style={{ padding: 18, borderRadius: 10, background: "#fff", border: "1px solid #eee" }}>{b}</button>)}
          </div>
        ) : isNotes && !topic ? (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
            {SUBJECTS[subject].map((t) => <button key={t} onClick={() => setTopic(t)} style={{ padding: 14, borderRadius: 10, background: "#fff", border: "1px solid #eee", textAlign: "left" }}>{t}</button>)}
            <button onClick={() => setTopic("General")} style={{ padding: 14, borderRadius: 10, background: "#fff", border: "1px solid #eee" }}>General</button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 800 }}>{subject} · {board}{topic ? ` · ${topic}` : ""}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {isAdmin && <button onClick={() => inputRef.current?.click()} style={{ padding: "8px 12px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none" }}>Upload</button>}
                <input ref={inputRef} type="file" multiple onChange={upload} style={{ display: "none" }} />
                <button onClick={() => { setTopic(null); setBoard(null); setSubject(null); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee", background: "#fff" }}>Back</button>
              </div>
            </div>

            {loading ? <div>Loading…</div> : files.length === 0 ? <div style={{ color: "#666", padding: 20 }}>No files uploaded here yet.</div> : (
              <div style={{ display: "grid", gap: 10 }}>
                {files.map((f) => (
                  <div key={f.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "#f8fafc" }}>
                    <div>{f.name}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <a href={f.url} target="_blank" rel="noreferrer" style={{ color: "#0969da" }}>View</a>
                      <a href={f.url} download style={{ color: "#06b6d4" }}>Download</a>
                      {isAdmin && <button onClick={() => remove(f.name)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>Delete</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Videos Browser (Subject -> Topic). Uses localStorage for quick setup; if Supabase 'videos' table exists, reads/writes there.
function VideoBrowser({ resource, onClose, isAdmin }) {
  // resource: { type: "Videos", subject?, topic? }
  const [subject, setSubject] = useState(resource?.subject || null);
  const [topic, setTopic] = useState(resource?.topic || null);
  const [videos, setVideos] = useState([]); // array of { id?, title, url }
  const [loading, setLoading] = useState(false);

  const storageKey = (sub, top) => `jd_videos::${sub || "all"}::${top || "all"}`;

  const loadLocal = () => {
    if (!subject || !topic) {
      setVideos([]);
      return;
    }
    const raw = localStorage.getItem(storageKey(subject, topic));
    setVideos(raw ? JSON.parse(raw) : []);
  };

  useEffect(() => {
    loadLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, topic]);

  const addVideoLocal = (title, url) => {
    if (!subject || !topic) return alert("Select subject and topic");
    const next = [...videos, { id: Date.now(), title, url: toEmbedUrl(url) }];
    setVideos(next);
    localStorage.setItem(storageKey(subject, topic), JSON.stringify(next));
  };

  const removeLocal = (id) => {
    const next = videos.filter((v) => v.id !== id);
    setVideos(next);
    localStorage.setItem(storageKey(subject, topic), JSON.stringify(next));
  };

  const handleAdd = () => {
    const title = window.prompt("Video title:");
    if (!title) return;
    const url = window.prompt("YouTube link (or embed):");
    if (!url) return;
    addVideoLocal(title, url);
  };

  return (
    <section style={{ padding: "40px 20px", background: "#f9fafb", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>🎬 Video Lessons</h2>
          <div>
            <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee", background: "#fff" }}>Back</button>
          </div>
        </div>

        {!subject ? (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
            {RES_SUBJECTS.map((s) => <button key={s} onClick={() => setSubject(s)} style={{ padding: 18, borderRadius: 10, background: "#fff", border: "1px solid #eee" }}>{s}</button>)}
          </div>
        ) : !topic ? (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <button onClick={() => { setSubject(null); setTopic(null); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee" }}>← Subjects</button>
              <div style={{ fontWeight: 800, alignSelf: "center" }}>{subject}</div>
              <div style={{ marginLeft: "auto" }}>
                {isAdmin && <button onClick={handleAdd} style={{ padding: "8px 12px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none" }}>＋ Add video</button> }
              </div>
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
              {SUBJECTS[subject].map((t) => <div key={t} style={{ padding: 14, borderRadius: 10, background: "#fff", border: "1px solid #eee" }}><div style={{ fontWeight: 700 }}>{t}</div><div style={{ marginTop: 8 }}><button onClick={() => setTopic(t)} style={{ padding: "8px 12px", borderRadius: 8, background: "#ef4444", color: "#fff", border: "none" }}>Watch</button></div></div>)}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 800 }}>{subject} · {topic}</div>
              <div>
                <button onClick={() => setTopic(null)} style={{ marginRight: 8, padding: "8px 12px", borderRadius: 8, border: "1px solid #eee", background: "#fff" }}>← Topics</button>
                {isAdmin && <button onClick={handleAdd} style={{ padding: "8px 12px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none" }}>＋ Add</button>}
              </div>
            </div>

            {videos.length === 0 ? (
              <div style={{ padding: 24, background: "#fff", borderRadius: 8, border: "1px solid #eee" }}>
                <div style={{ color: "#666" }}>No videos here yet.</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {videos.map((v) => (
                  <div key={v.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ position: "relative", paddingTop: "56.25%" }}>
                      <iframe src={v.url} title={v.title} style={{ position: "absolute", inset: 0, border: 0 }} allowFullScreen />
                    </div>
                    <div style={{ padding: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontWeight: 700 }}>{v.title}</div>
                      {isAdmin && <button onClick={() => removeLocal(v.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer" }}>Delete</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Contact component
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "Physics", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n\n${form.message}`;
    window.location.href = `mailto:${CONTACT.email}?subject=JDScience enquiry&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <section id="contact" style={{ padding: "40px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2>Contact</h2>
        <p style={{ color: "#666" }}>Email: {CONTACT.email} • Phone: {CONTACT.phone}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
          <div>
            <p style={{ color: "#666" }}>Prefer to talk? Call or email us directly.</p>
          </div>
          <div style={{ background: "#f8fafc", padding: 14, borderRadius: 10 }}>
            {sent ? <div>Thanks — your email client should have opened.</div> : (
              <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                <input required placeholder="Your email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #eee" }}>
                  {Object.keys(SUBJECTS).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <textarea required rows={4} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} style={{ padding: 8, borderRadius: 6, border: "1px solid #eee" }} />
                <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff" }}>Send</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer style={{ padding: 20, background: "#fff", borderTop: "1px solid #eee", marginTop: 20 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800, color: "#7c3aed" }}>JDScience</div>
        <div style={{ color: "#666" }}>{CONTACT.email} • {CONTACT.phone}</div>
        <div style={{ color: "#999" }}>© JDScience</div>
      </div>
    </footer>
  );
}

// App root
function App() {
  const [view, setView] = useState({ name: "home" }); // {name:home} | {name:subject, subject} | {name:resource, resourceObj} | {name:videos, resourceObj}
  const [resourceObj, setResourceObj] = useState(null);
  const [subjectPage, setSubjectPage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem("jd_admin") === "1");

  useEffect(() => {
    // keep admin flag in sessionStorage
    sessionStorage.setItem("jd_admin", isAdmin ? "1" : "0");
  }, [isAdmin]);

  const openResource = (res) => {
    // res can be string e.g., "Revision Notes" or object { type, subject?, board?, topic? }
    const resource = typeof res === "string" ? { type: res } : res;
    setResourceObj(resource);
    setView({ name: resource.type === "Videos" ? "videos" : "resource" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openSubject = (subject) => {
    setSubjectPage(subject);
    setView({ name: "subject" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openVideosHub = (subject) => {
    setResourceObj({ type: "Videos", subject });
    setView({ name: "videos" });
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", color: "#111" }}>
      <Navbar onOpenResource={openResource} onOpenVideos={() => openVideosHub()} onOpenSubject={openSubject} onSearch={(q) => { setResourceObj({ type: "Search", query: q }); setView({ name: "search" }); }} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

      {view.name === "home" && (
        <>
          <Hero onBook={() => alert("Booking flow - open modal or link to Stripe")} />
          <FrontVideo />
          <Subjects onOpenSubject={(s) => openSubject(s)} onOpenResource={openResource} />
        </>
      )}

      {view.name === "subject" && subjectPage && <SubjectPage subject={subjectPage} onBack={() => { setView({ name: "home" }); setSubjectPage(null); }} onOpenResource={(r) => openResource(r)} />}

      {view.name === "resource" && resourceObj && <ResourceBrowser resource={resourceObj} onClose={() => setView({ name: "home" })} isAdmin={isAdmin} />}

      {view.name === "videos" && <VideoBrowser resource={resourceObj || { type: "Videos" }} onClose={() => setView({ name: "home" })} isAdmin={isAdmin} />}

      {view.name === "search" && resourceObj && (
        <section style={{ padding: 24 }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Search: {resourceObj.query}</h2>
              <button onClick={() => setView({ name: "home" })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee" }}>Clear</button>
            </div>
            <div style={{ marginTop: 12 }}>
              {Object.keys(SUBJECTS).map((s) => {
                const matched = SUBJECTS[s].filter((t) => `${t}`.toLowerCase().includes(resourceObj.query.toLowerCase()) || s.toLowerCase().includes(resourceObj.query.toLowerCase()));
                if (matched.length === 0 && !s.toLowerCase().includes(resourceObj.query.toLowerCase())) return null;
                return (
                  <div key={s} style={{ background: "#fff", padding: 12, borderRadius: 8, border: "1px solid #eee", marginBottom: 8 }}>
                    <div style={{ fontWeight: 800 }}>{s}</div>
                    <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {matched.length ? matched.map((t) => <button key={t} onClick={() => openResource({ type: "Revision Notes", subject: s, topic: t })} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #eee" }}>{t}</button>) : <div style={{ color: "#666" }}>No topics matched</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Contact />
      <Footer />
    </div>
  );
}

export default App;
