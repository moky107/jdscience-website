import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

// --- Constants & Config ---
const HERO_IMG = "https://cdn.abacus.ai/images/a3ac8de7-2ad2-4a64-bab2-8fbe6d17616e.png";
const CONTACT = { email: "info@jdscience.co.uk", phone: "07466142805" };
const DEFAULT_VIDEO = "https://www.youtube.com/embed/dQw4w9WgXcQ";

const inputStyle = { padding: "12px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: ".95rem", outline: "none", width: "100%", boxSizing: "border-box" };

const navMenu = [
  { label: "Home", id: "home" },
  { label: "11+", options: ["English", "Maths", "Verbal Reasoning", "Non-Verbal Reasoning"] },
  { label: "GCSE / IGCSE", options: ["Physics", "Chemistry", "Biology", "Maths"], subOptions: ["AQA", "Edexcel", "OCR", "Eduqas"] },
  { label: "A-Level", options: ["Physics", "Chemistry", "Biology", "Maths"], subOptions: ["AQA", "Edexcel", "OCR", "Eduqas"] },
  { label: "T-Levels", options: ["Health & Science", "Engineering", "Digital", "Education"] },
  { label: "BTEC", options: ["Applied Science", "Engineering", "IT", "Health & Social Care"] },
  { label: "Resources", resource: true, options: ["Revision Notes", "Past Questions", "Videos"] },
  { label: "Tutors", id: "tutors" },
  { label: "Contact", id: "contact" }
];

// --- Components ---

function FrontVideo({ isAdmin }) {
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO);
  const toEmbed = (url) => { const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/); return m ? `https://www.youtube.com/embed/${m[1]}` : url; };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("value").eq("key", "front_video").single();
      if (data && data.value) setVideoUrl(data.value);
    })();
  }, []);

  const changeVideo = async () => {
    const url = window.prompt("Paste YouTube link:", videoUrl);
    if (!url) return;
    const finalUrl = toEmbed(url.trim());
    await supabase.from("site_settings").upsert({ key: "front_video", value: finalUrl });
    setVideoUrl(finalUrl);
  };

  return (
    <section id="intro-video" style={{ padding: "60px 20px", background: "#0b0420", textAlign: "center" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", color: "#fff" }}>
        <h2 style={{ fontSize: "2rem", marginBottom: 20 }}>How JDScience Works</h2>
        {isAdmin && <button onClick={changeVideo} style={{ background: "#7c3aed", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, marginBottom: 20, cursor: "pointer" }}>✎ Change Home Video</button>}
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 12, overflow: "hidden", border: "1px solid #333" }}>
          <iframe src={videoUrl} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
        </div>
      </div>
    </section>
  );
}

function Navbar({ isAdmin, onOpenResource, onSetAdmin }) {
  const [openIndex, setOpenIndex] = useState(null);
  const handleAuth = async () => {
    if (isAdmin) { await supabase.auth.signOut(); onSetAdmin(false); return; }
    const email = window.prompt("Admin Email:");
    const pass = window.prompt("Admin Password:");
    if (!email || !pass) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) alert(error.message); else onSetAdmin(true);
  };

  const scrollTo = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth" }); };

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 1000, background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 40px", alignItems: "center" }}>
        <div onClick={() => scrollTo("home")} style={{ fontSize: "1.5rem", fontWeight: 800, color: "#7c3aed", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 35, height: 35, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", borderRadius: 6 }}></div> JDScience
        </div>
        <button onClick={handleAuth} style={{ background: isAdmin ? "#10b981" : "#eee", border: "none", padding: "8px 15px", borderRadius: 6, cursor: "pointer" }}>{isAdmin ? "Logout" : "Admin"}</button>
      </div>
      <div style={{ background: "#2dd4bf", display: "flex", justifyContent: "center" }}>
        {navMenu.map((item, i) => (
          <div key={i} onMouseEnter={() => setOpenIndex(i)} onMouseLeave={() => setOpenIndex(null)} style={{ position: "relative" }}>
            <button onClick={() => item.id && scrollTo(item.id)} style={{ padding: "12px 20px", border: "none", background: "transparent", fontWeight: 700, cursor: "pointer" }}>{item.label.toUpperCase()} {item.options && "▾"}</button>
            {item.options && openIndex === i && (
              <div style={{ position: "absolute", top: "100%", left: 0, background: "#1f2937", minWidth: 200, padding: "10px 0", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}>
                {item.options.map((opt, j) => (
                  <div key={j} onClick={() => item.resource ? onOpenResource(opt) : scrollTo("subjects")} style={{ padding: "10px 20px", color: "#fff", cursor: "pointer", fontSize: "0.9rem" }}>{opt}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

function ResourceHub({ type, onClose, isAdmin }) {
  const [subject, setSubject] = useState(null);
  const [board, setBoard] = useState(null);
  const [files, setFiles] = useState([]);

  const loadFiles = async () => {
    // For videos, we fetch from the database 'videos' table. For others, from storage.
    if (type === "Videos") {
        const { data } = await supabase.from("videos").select("*").eq("subject", subject);
        if (data) setFiles(data.map(v => ({ name: v.title, url: v.url })));
    } else {
        const path = `${type}/${subject}/${board}`;
        const { data } = await supabase.storage.from("resources").list(path);
        if (data) setFiles(data.map(f => ({ name: f.name, url: supabase.storage.from("resources").getPublicUrl(`${path}/${f.name}`).data.publicUrl })));
    }
  };

  useEffect(() => { if (subject && (type === "Videos" || board)) loadFiles(); }, [subject, board, type]);

  return (
    <section style={{ padding: "60px 40px", background: "#f9fafb", minHeight: "80vh" }}>
      <button onClick={onClose} style={{ marginBottom: 20, cursor: "pointer", border: "none", background: "#eee", padding: "8px 15px", borderRadius: 5 }}>← Back to Home</button>
      <h2 style={{ marginBottom: 25 }}>{type} Library</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {["Physics", "Chemistry", "Biology", "Maths"].map(s => <button key={s} onClick={() => setSubject(s)} style={{ padding: "10px 20px", background: subject === s ? "#7c3aed" : "#fff", color: subject === s ? "#fff" : "#333", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>{s}</button>)}
      </div>
      {subject && type !== "Videos" && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {["AQA", "Edexcel", "OCR", "Eduqas"].map(b => <button key={b} onClick={() => setBoard(b)} style={{ padding: "10px 20px", background: board === b ? "#06b6d4" : "#fff", color: board === b ? "#fff" : "#333", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer" }}>{b}</button>)}
        </div>
      )}
      
      <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: type === "Videos" ? "repeat(auto-fit, minmax(300px, 1fr))" : "1fr", gap: 20 }}>
        {files.length > 0 ? files.map((f, i) => (
          <div key={i} style={{ padding: "15px", background: "#fff", border: "1px solid #eee", borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            {type === "Videos" ? (
                <div>
                    <h4 style={{ marginBottom: 10 }}>{f.name}</h4>
                    <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 8, overflow: "hidden" }}>
                        <iframe src={f.url} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} allowFullScreen />
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{f.name}</span>
                    <a href={f.url} target="_blank" rel="noreferrer" style={{ color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>Download</a>
                </div>
            )}
          </div>
        )) : <p style={{ color: "#666" }}>Please select a subject (and exam board for notes) to view content.</p>}
      </div>
    </section>
  );
}

function ContactForm() {
    const [status, setStatus] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        const body = `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nMessage: ${data.get("message")}`;
        window.location.href = `mailto:${CONTACT.email}?subject=New Inquiry&body=${encodeURIComponent(body)}`;
        setStatus("Your email client has been opened!");
    };
    return (
        <section id="contact" style={{ padding: "80px 40px", background: "#fff" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <h2 style={{ textAlign: "center", marginBottom: 30 }}>Contact Us</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                    <input required name="name" placeholder="Your Name" style={inputStyle} />
                    <input required name="email" type="email" placeholder="Your Email" style={inputStyle} />
                    <textarea required name="message" placeholder="How can we help?" rows={5} style={inputStyle} />
                    <button type="submit" style={{ background: "#7c3aed", color: "#fff", padding: "15px", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Send Message</button>
                    {status && <p style={{ color: "green", textAlign: "center" }}>{status}</p>}
                </form>
            </div>
        </section>
    );
}

// --- Main App ---

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [resourceTab, setResourceTab] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAdmin(!!data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: "#1f2937" }}>
      <Navbar isAdmin={isAdmin} onOpenResource={setResourceTab} onSetAdmin={setIsAdmin} />
      
      {resourceTab ? (
        <ResourceHub type={resourceTab} onClose={() => setResourceTab(null)} isAdmin={isAdmin} />
      ) : (
        <>
          <section id="home" style={{ background: "linear-gradient(135deg,#1a0533,#2d1060)", padding: "100px 40px", color: "#fff", textAlign: "center" }}>
            <h1 style={{ fontSize: "3.5rem", fontWeight: 900, marginBottom: 20 }}>JD Education</h1>
            <p style={{ fontSize: "1.2rem", maxWidth: 700, margin: "0 auto 40px" }}>Expert tutoring for 11+, GCSE, A-Levels and more. We provide the tools you need to excel in science and maths.</p>
            <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 20, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
                <img src={HERO_IMG} style={{ width: "100%", display: "block" }} alt="Diverse Students" />
            </div>
          </section>

          <FrontVideo isAdmin={isAdmin} />

          <section id="subjects" style={{ padding: "80px 40px", textAlign: "center" }}>
            <h2 style={{ fontSize: "2.5rem", marginBottom: 40 }}>Our Core Subjects</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 30, maxWidth: 1200, margin: "0 auto" }}>
              {["Physics", "Chemistry", "Biology", "Maths"].map(s => (
                <div key={s} style={{ padding: "40px", background: "#fff", border: "1px solid #eee", borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <div style={{ fontSize: "3rem", marginBottom: 15 }}>{s === "Physics" ? "⚛️" : s === "Chemistry" ? "⚗️" : s === "Biology" ? "🧬" : "🧮"}</div>
                    <h3 style={{ fontSize: "1.5rem", marginBottom: 10 }}>{s}</h3>
                    <p style={{ color: "#666" }}>Full curriculum coverage for AQA, Edexcel, OCR, and Eduqas exam boards.</p>
                </div>
              ))}
            </div>
          </section>

          <ContactForm />
        </>
      )}

      <footer style={{ padding: "40px", textAlign: "center", borderTop: "1px solid #eee", background: "#f9fafb" }}>
        <p style={{ fontWeight: 800, color: "#7c3aed" }}>JDScience © 2026</p>
        <p style={{ fontSize: "0.8rem", color: "#999" }}>{CONTACT.email} | {CONTACT.phone}</p>
      </footer>
    </div>
  );
}
