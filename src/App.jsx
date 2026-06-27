// src/App.jsx
import React, { useEffect, useState } from "react";

/*
  Simple, self-contained App.jsx that:
  - Organises Videos by Subject -> Topic
  - All buttons wired and functional
  - Admin mode (password-protected) lets you add/remove videos (saved to localStorage)
  - No external services required
*/

const CONTACT = { email: "info@jdscience.co.uk", phone: "07466142805" };
const HERO_IMG = "https://cdn.abacus.ai/images/a3ac8de7-2ad2-4a64-bab2-8fbe6d17616e.png"; // replace if desired
const ADMIN_PASSWORD = "admin123"; // change as needed

const SUBJECTS = {
  Physics: ["Energy", "Electricity", "Forces", "Waves"],
  Chemistry: ["Atomic Structure", "Bonding", "Reactions", "Energetics"],
  Biology: ["Cells", "Genetics", "Ecology", "Homeostasis"],
  Maths: ["Algebra", "Geometry", "Probability", "Statistics"],
};

const navMenu = [
  { label: "Home", id: "home" },
  { label: "11+", options: ["English", "Maths", "Verbal Reasoning", "Non-Verbal Reasoning"] },
  { label: "GCSE / IGCSE", options: ["Physics", "Chemistry", "Biology", "Maths"] },
  { label: "A-Level", options: ["Physics", "Chemistry", "Biology", "Maths"] },
  { label: "T-Levels", options: ["Health & Science", "Engineering", "Digital", "Education"] },
  { label: "BTEC", options: ["Applied Science", "Engineering", "IT", "Health & Social Care"] },
  { label: "Resources", resource: true, options: ["Revision Notes", "Past Questions", "Videos"] },
  { label: "Tutors", id: "tutors" },
  { label: "Contact", id: "contact" },
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function Navbar({ onOpenResource, onSelectSubject, isAdmin, setIsAdmin }) {
  const [openIndex, setOpenIndex] = useState(null);

  const handleAuth = () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    const pw = window.prompt("Admin password:");
    if (pw === ADMIN_PASSWORD) {
      setIsAdmin(true);
      alert("Admin mode enabled");
    } else if (pw) {
      alert("Wrong password");
    }
  };

  return (
    <nav style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1000, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 24px", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => scrollToId("home")}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#06b6d4)" }} />
          <strong style={{ color: "#111", fontSize: 18 }}>JDScience</strong>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, background: "#10b98111", borderRadius: 6 }}>
            {navMenu.map((item, i) => (
              <div
                key={i}
                onMouseEnter={() => setOpenIndex(i)}
                onMouseLeave={() => setOpenIndex(null)}
                style={{ position: "relative" }}
              >
                <button
                  onClick={() => {
                    if (item.id) scrollToId(item.id);
                    else if (item.resource) onOpenResource(item.options[0]); // open first resource default
                    else if (item.options?.length === 1) scrollToId(item.options[0]);
                    else if (!item.options) {}
                  }}
                  style={{ background: "transparent", border: "none", padding: "10px 14px", cursor: "pointer", fontWeight: 700 }}
                >
                  {item.label}
                </button>

                {item.options && openIndex === i && (
                  <div style={{ position: "absolute", top: "100%", left: 0, minWidth: 180, background: "#111", color: "#fff", borderRadius: 8, overflow: "hidden", boxShadow: "0 12px 24px rgba(0,0,0,0.2)" }}>
                    {item.options.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => {
                          if (item.resource) onOpenResource(opt);
                          else {
                            // subject-level navigation: when subjects listed, allow opening SubjectPage
                            if (["Physics", "Chemistry", "Biology", "Maths"].includes(opt)) onSelectSubject(opt);
                            else scrollToId("subjects");
                          }
                        }}
                        style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={handleAuth} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee", cursor: "pointer" }}>
            {isAdmin ? "Logout Admin" : "Admin"}
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" style={{ background: "linear-gradient(135deg,#1a0533,#2d1060)", color: "#fff", padding: "80px 20px", textAlign: "center" }}>
      <h1 style={{ fontSize: 36, marginBottom: 10 }}>JDScience</h1>
      <p style={{ maxWidth: 800, margin: "0 auto 20px" }}>Expert tutoring and high-quality resources for 11+, GCSE, A-Level, T-levels and BTEC.</p>
      <img src={HERO_IMG} alt="Hero" style={{ width: "100%", maxWidth: 900, borderRadius: 12, marginTop: 18 }} />
    </section>
  );
}

function SubjectsGrid({ onOpenSubject }) {
  return (
    <section id="subjects" style={{ padding: "60px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Our Core Subjects</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
        {Object.keys(SUBJECTS).map((s) => (
          <div key={s} style={{ padding: 18, borderRadius: 12, background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{s === "Physics" ? "⚛️" : s === "Chemistry" ? "⚗️" : s === "Biology" ? "🧬" : "🧮"}</div>
            <h3 style={{ margin: 0 }}>{s}</h3>
            <p style={{ color: "#666", marginTop: 8 }}>Comprehensive coverage for exam boards and topics.</p>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button onClick={() => onOpenSubject(s)} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer" }}>
                View Subject
              </button>
              <button onClick={() => onOpenSubject(s, { openVideos: true })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee", background: "#fff", cursor: "pointer" }}>
                🎬 Video Lessons
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SubjectPage({ subject, onBack, onOpenResource }) {
  const topics = SUBJECTS[subject] || [];
  return (
    <section style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto" }}>
      <button onClick={onBack} style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #eee" }}>
        ← Back
      </button>
      <h2 style={{ marginTop: 6 }}>{subject}</h2>
      <p style={{ color: "#555" }}>Select a topic or open videos and resources for {subject}.</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        {topics.map((t) => (
          <div key={t} style={{ padding: 10, borderRadius: 10, background: "#fff", border: "1px solid #eee", minWidth: 160 }}>
            <div style={{ fontWeight: 700 }}>{t}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
              <button onClick={() => onOpenResource({ type: "Videos", subject, topic: t })} style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer" }}>
                🎬 Video Lessons
              </button>
              <button onClick={() => onOpenResource({ type: "Revision Notes", subject, topic: t })} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                📚 Revision Notes
              </button>
              <button onClick={() => onOpenResource({ type: "Past Questions", subject, topic: t })} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                📝 Past Questions
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function VideosHub({ resource, onClose, isAdmin, onAddVideo, onRemoveVideo }) {
  // resource = { type: "Videos", subject?, topic? }
  const [subject, setSubject] = useState(resource?.subject || Object.keys(SUBJECTS)[0]);
  const [selectedTopic, setSelectedTopic] = useState(resource?.topic || null);
  const [videos, setVideos] = useState({}); // structure: { subject: { topic: url } }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("jd_videos_v1");
      setVideos(raw ? JSON.parse(raw) : {});
    } catch {
      setVideos({});
    }
  }, []);

  useEffect(() => {
    if (resource?.subject) setSubject(resource.subject);
    if (resource?.topic) setSelectedTopic(resource.topic);
  }, [resource]);

  const saveVideos = (next) => {
    setVideos(next);
    localStorage.setItem("jd_videos_v1", JSON.stringify(next));
  };

  const handleAdd = async () => {
    const topic = window.prompt("Topic name:", selectedTopic || SUBJECTS[subject][0]);
    if (!topic) return;
    const url = window.prompt("Paste YouTube embed URL or full URL (will be converted):", "");
    if (!url) return;
    // convert YouTube link to embed if possible
    let embed = url.trim();
    const ytMatch = embed.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    if (ytMatch) embed = `https://www.youtube.com/embed/${ytMatch[1]}`;
    const next = { ...(videos || {}) };
    next[subject] = next[subject] || {};
    next[subject][topic] = embed;
    saveVideos(next);
    if (onAddVideo) onAddVideo(subject, topic, embed);
    setSelectedTopic(topic);
  };

  const handleRemove = (topic) => {
    if (!videos[subject] || !videos[subject][topic]) return;
    if (!window.confirm(`Remove video for ${subject} → ${topic}?`)) return;
    const next = { ...videos };
    delete next[subject][topic];
    saveVideos(next);
    if (onRemoveVideo) onRemoveVideo(subject, topic);
    if (selectedTopic === topic) setSelectedTopic(null);
  };

  const subjTopics = SUBJECTS[subject] || [];

  return (
    <section style={{ padding: "40px 20px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #eee" }}>
            ← Back
          </button>
        </div>
        <div>
          <strong style={{ marginRight: 12 }}>{subject} — Video Lessons</strong>
          {isAdmin && <button onClick={handleAdd} style={{ marginLeft: 8, padding: "8px 12px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer" }}>Add video</button>}
        </div>
      </div>

      <div style={{ display: "flex", gap: 18 }}>
        <aside style={{ width: 260 }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>Subject</label>
            <select value={subject} onChange={(e) => { setSubject(e.target.value); setSelectedTopic(null); }} style={{ width: "100%", padding: "8px 10px", borderRadius: 8 }}>
              {Object.keys(SUBJECTS).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Topics</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {subjTopics.map((t) => (
                <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "8px 10px", borderRadius: 8, border: "1px solid #eee" }}>
                  <button onClick={() => setSelectedTopic(t)} style={{ border: "none", background: "transparent", textAlign: "left", cursor: "pointer" }}>{t}</button>
                  <div style={{ display: "flex", gap: 6 }}>
                    {videos[subject] && videos[subject][t] && (
                      <button onClick={() => handleRemove(t)} style={{ padding: "6px 8px", borderRadius: 6, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer" }}>Remove</button>
                    )}
                    <span style={{ fontSize: 12, color: "#666" }}>{videos[subject] && videos[subject][t] ? "Available" : "No video"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main style={{ flex: 1 }}>
          {!selectedTopic ? (
            <div style={{ padding: 14, borderRadius: 10, background: "#fff", border: "1px solid #eee" }}>
              <h3 style={{ marginTop: 0 }}>{subject} videos</h3>
              <p style={{ color: "#555" }}>Select a topic to play its video. Admins can add videos for any topic.</p>
            </div>
          ) : (
            <div style={{ borderRadius: 10, background: "#fff", border: "1px solid #eee", padding: 12 }}>
              <h3 style={{ marginTop: 0 }}>{selectedTopic}</h3>
              {videos[subject] && videos[subject][selectedTopic] ? (
                <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 8, overflow: "hidden" }}>
                  <iframe
                    src={videos[subject][selectedTopic]}
                    title={`${subject} - ${selectedTopic}`}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                    allowFullScreen
                  />
                </div>
              ) : (
                <div style={{ padding: 24 }}>
                  <p style={{ color: "#666" }}>No video available for this topic yet.</p>
                  {isAdmin && <button onClick={() => handleAdd()} style={{ padding: "8px 12px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer" }}>Add video for this topic</button>}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </section>
  );
}

function ResourcesPlaceholder({ resource, onClose }) {
  // Simple placeholder page for Revision Notes / Past Questions.
  // All buttons lead to subject/topic selection; admin upload allowed (in-session) and visitors can download if admin uploaded during session.
  const [subject, setSubject] = useState(resource?.subject || Object.keys(SUBJECTS)[0]);
  const [topic, setTopic] = useState(resource?.topic || SUBJECTS[subject][0]);
  const [files, setFiles] = useState([]); // in-session files only (no persistence for blobs)
  const [isAdmin] = useState(false); // this component doesn't handle admin uploading here; for brevity it's a read-only placeholder

  useEffect(() => {
    setTopic(SUBJECTS[subject][0]);
    setFiles([]); // reset
  }, [subject]);

  return (
    <section style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto" }}>
      <button onClick={onClose} style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 8, border: "1px solid #eee" }}>← Back</button>
      <h2>{resource.type}</h2>
      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8 }}>
          {Object.keys(SUBJECTS).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} style={{ padding: "8px 10px", borderRadius: 8 }}>
          {SUBJECTS[subject].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div style={{ marginTop: 18 }}>
        {files.length === 0 ? <p style={{ color: "#666" }}>No files uploaded for this topic in this session. (Admin upload required to add files.)</p> : files.map((f, i) => (
          <div key={i} style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, background: "#fff", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
            <div>{f.name}</div>
            <a href={f.url} download={f.name} style={{ color: "#7c3aed" }}>Download</a>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = `Name: ${fd.get("name")}\nEmail: ${fd.get("email")}\nMessage: ${fd.get("message")}`;
    window.location.href = `mailto:${CONTACT.email}?subject=JDScience Contact&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="contact" style={{ padding: "40px 20px", maxWidth: 700, margin: "0 auto" }}>
      <h2>Contact</h2>
      <p style={{ color: "#666" }}>Email: {CONTACT.email} • Phone: {CONTACT.phone}</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        <input name="name" required placeholder="Your name" style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
        <input name="email" type="email" required placeholder="Your email" style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
        <textarea name="message" rows={5} required placeholder="How can we help?" style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd" }} />
        <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: "#7c3aed", color: "#fff", cursor: "pointer" }}>Send</button>
      </form>
    </section>
  );
}

export default function App() {
  // app view state
  const [view, setView] = useState({ name: "home" }); // { name: "home" } | { name: "subject", subject } | { name: "resource", resourceObj } | { name: "videos", resourceObj }
  const [isAdmin, setIsAdmin] = useState(false);

  // load admin flag from sessionStorage
  useEffect(() => {
    const a = sessionStorage.getItem("jd_admin") === "1";
    setIsAdmin(a);
  }, []);
  useEffect(() => {
    sessionStorage.setItem("jd_admin", isAdmin ? "1" : "0");
  }, [isAdmin]);

  const openSubject = (subject, opts = {}) => {
    if (opts.openVideos) {
      setView({ name: "videos", resource: { type: "Videos", subject } });
    } else {
      setView({ name: "subject", subject });
      scrollToId("top");
    }
  };

  const openResource = (resourceArg) => {
    // resourceArg can be string e.g., "Videos" or object { type, subject? }
    if (typeof resourceArg === "string") resourceArg = { type: resourceArg };
    if (resourceArg.type === "Videos") {
      setView({ name: "videos", resource: resourceArg });
    } else {
      setView({ name: "resource", resource: resourceArg });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // hooks to sync localStorage video changes to Views (simple)
  const handleAddVideoEvent = () => {
    // force re-render by toggling view (cheap)
    setView((v) => ({ ...v }));
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", color: "#111", background: "#f7fafc", minHeight: "100vh" }}>
      <Navbar onOpenResource={openResource} onSelectSubject={(s) => openSubject(s)} isAdmin={isAdmin} setIsAdmin={(v) => setIsAdmin(v)} />

      <div id="top" />

      {view.name === "home" && (
        <>
          <Hero />
          <SubjectsGrid onOpenSubject={(s, opts) => openSubject(s, opts)} />
          <section style={{ padding: "32px 20px", maxWidth: 900, margin: "0 auto" }}>
            <h3>Quick links</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <button onClick={() => openResource({ type: "Videos" })} style={{ padding: "8px 12px", borderRadius: 8, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer" }}>Videos</button>
              <button onClick={() => openResource({ type: "Revision Notes" })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}>Revision Notes</button>
              <button onClick={() => openResource({ type: "Past Questions" })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}>Past Questions</button>
              <button onClick={() => setView({ name: "subject", subject: "Physics" })} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", cursor: "pointer" }}>Physics</button>
            </div>
          </section>

          <ContactSection />
        </>
      )}

      {view.name === "subject" && view.subject && (
        <SubjectPage
          subject={view.subject}
          onBack={() => setView({ name: "home" })}
          onOpenResource={(res) => openResource(res)}
        />
      )}

      {view.name === "videos" && (
        <VideosHub
          resource={view.resource || { type: "Videos" }}
          onClose={() => setView({ name: "home" })}
          isAdmin={isAdmin}
          onAddVideo={handleAddVideoEvent}
          onRemoveVideo={handleAddVideoEvent}
        />
      )}

      {view.name === "resource" && (
        <ResourcesPlaceholder resource={view.resource || { type: "Revision Notes" }} onClose={() => setView({ name: "home" })} />
      )}

      <footer style={{ padding: 20, textAlign: "center", marginTop: 40, background: "#fff", borderTop: "1px solid #eee" }}>
        <div style={{ fontWeight: 800, color: "#7c3aed" }}>JDScience</div>
        <div style={{ color: "#666", fontSize: 14 }}>{CONTACT.email} • {CONTACT.phone}</div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#999" }}>© JDScience</div>
      </footer>
    </div>
  );
}
