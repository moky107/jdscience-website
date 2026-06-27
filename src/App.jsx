import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_PASSWORD = "admin123"; 
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

function toEmbedUrl(url = "") {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}

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
    }
  };

  const navMenu = [
    { label: "Home", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { label: "Resources", options: ["Revision Notes", "Past Questions"] },
    { label: "Videos", action: () => onOpenVideos() },
    { label: "Contact", action: () => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }) },
  ];

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px" }}>
        <div style={{ fontWeight: 800, cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>JDScience</div>
        <form onSubmit={(e) => { e.preventDefault(); onSearch(q); }} style={{ display: "flex", gap: 8 }}>
          <input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} style={{ padding: "8px", borderRadius: 8, border: "1px solid #ddd" }} />
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none" }}>Search</button>
          <button type="button" onClick={handleAdmin} style={{ padding: "8px 12px", background: isAdmin ? "#10b981" : "#eee", border: "none", borderRadius: 8 }}>Admin</button>
        </form>
      </div>
      <nav style={{ display: "flex", gap: 15, padding: "10px 20px", background: "#f8fafc" }}>
        {navMenu.map((it, i) => (
          <div key={it.label} onMouseEnter={() => setOpenIndex(i)} onMouseLeave={() => setOpenIndex(null)} style={{ position: "relative" }}>
            <button onClick={it.action} style={{ background: "none", border: "none", fontWeight: 700, cursor: "pointer" }}>{it.label}</button>
            {it.options && openIndex === i && (
              <div style={{ position: "absolute", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 8, top: "100%", zIndex: 10 }}>
                {it.options.map(opt => <div key={opt} onClick={() => onOpenResource(opt)} style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee" }}>{opt}</div>)}
              </div>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section style={{ background: "#1a0533", color: "#fff", padding: "60px 20px", textAlign: "center" }}>
      <h1>Expert Science & Maths Tutoring</h1>
      <img src={HERO_IMG} alt="students" style={{ maxWidth: "100%", borderRadius: 12, marginTop: 20 }} />
    </section>
  );
}

function ResourceBrowser({ resource, onClose, isAdmin }) {
  const [subject, setSubject] = useState(null);
  const [board, setBoard] = useState(null);
  const [topic, setTopic] = useState(null);
  const type = resource?.type || "Revision Notes";

  return (
    <section style={{ padding: "40px 20px", background: "#f9fafb" }}>
      <button onClick={onClose} style={{ marginBottom: 20 }}>← Back home</button>
      <h2>{type}</h2>
      {!subject ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {RES_SUBJECTS.map(s => <button key={s} onClick={() => setSubject(s)} style={{ padding: 20 }}>{s}</button>)}
        </div>
      ) : !board ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {EXAM_BOARDS.map(b => <button key={b} onClick={() => setBoard(b)} style={{ padding: 20 }}>{b}</button>)}
        </div>
      ) : (
        <div style={{ background: "#fff", padding: 20, borderRadius: 12 }}>
          <h3>{subject} - {board}</h3>
          <p>Files will appear here...</p>
          <button onClick={() => { setSubject(null); setBoard(null); }}>Back to Boards</button>
        </div>
      )}
    </section>
  );
}

function VideoBrowser({ onClose }) {
  return (
    <section style={{ padding: "40px 20px" }}>
      <button onClick={onClose}>← Back</button>
      <h2>Video Lessons</h2>
      <iframe src={toEmbedUrl(FRONT_VIDEO)} width="100%" height="450" style={{ borderRadius: 12 }} title="video" />
    </section>
  );
}

function App() {
  const [view, setView] = useState({ name: "home" });
  const [resourceObj, setResourceObj] = useState(null);
  const [isAdmin, setIsAdmin] = useState(sessionStorage.getItem("jd_admin") === "1");

  useEffect(() => {
    sessionStorage.setItem("jd_admin", isAdmin ? "1" : "0");
  }, [isAdmin]);

  const openResource = (type) => {
    setResourceObj({ type });
    setView({ name: "resource" });
  };

  const openVideos = () => setView({ name: "videos" });
  const goHome = () => setView({ name: "home" });

  return (
    <div>
      <Navbar 
        onOpenResource={openResource} 
        onOpenVideos={openVideos} 
        onOpenSubject={() => {}} 
        onSearch={() => {}} 
        isAdmin={isAdmin} 
        setIsAdmin={setIsAdmin} 
      />
      {view.name === "home" && (
        <>
          <Hero />
          <section id="contact" style={{ padding: 40 }}>
            <h2>Contact Us</h2>
            <p>{CONTACT.email}</p>
          </section>
        </>
      )}
      {view.name === "resource" && <ResourceBrowser resource={resourceObj} onClose={goHome} isAdmin={isAdmin} />}
      {view.name === "videos" && <VideoBrowser onClose={goHome} />}
      <footer style={{ padding: 20, textAlign: "center", borderTop: "1px solid #eee" }}>© JDScience</footer>
    </div>
  );
}

export default App;
