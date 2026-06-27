// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

/*
  Single-file rebuilt App.jsx
  - Admin-editable front video stored in site_settings (key = 'front_video')
  - Tutor submissions upload optional photo to 'tutor_photos' bucket and insert into tutors (approved=false)
  - Homepage shows tutors where approved = true
  - Admin login via Supabase; when logged in, admin sees "✎ Change Home Video" and can approve tutors via Supabase UI (or you can add an admin approval UI later)
*/

/* -------------------- Config / constants -------------------- */
const HERO_IMG = "https://cdn.abacus.ai/images/a3ac8de7-2ad2-4a64-bab2-8fbe6d17616e.png";
const CONTACT = { email: "info@jdscience.co.uk", phone: "07466142805" };
const DEFAULT_FRONT_VIDEO = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // change to your default embed if desired
const TUTOR_PHOTO_BUCKET = "tutor_photos";

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: ".95rem",
  width: "100%",
  boxSizing: "border-box",
};

/* -------------------- Subjects & Boards (AQA/Edexcel/OCR/Eduqas) -------------------- */
const subjects = [
  { icon: "⚛️", name: "Physics", desc: "Physics topics and exam-board breakdown", boards: {
      AQA:{ code:"8463", papers: { "Paper 1":["Energy","Electricity"], "Paper 2":["Forces","Waves"] }},
      Edexcel:{ code:"1PH0", papers: { "Paper 1":["Key Concepts","Motion"], "Paper 2":["Forces","Electricity"] }},
      OCR:{ code:"J249", papers: { "Paper 1":["Matter","Forces"], "Paper 2":["Waves","Radioactivity"] }},
      Eduqas:{ code:"C420P", papers: { "Component 1":["Electric Circuits"], "Component 2":["Motion"] }}
    }
  },
  { icon: "⚗️", name: "Chemistry", desc: "Chemistry topics and exam-board breakdown", boards: {
      AQA:{ code:"8462", papers:{ "Paper 1":["Atomic Structure"], "Paper 2":["Organic Chemistry"] }},
      Edexcel:{ code:"1CH0", papers:{ "Paper 1":["Key Concepts"], "Paper 2":["Groups"] }},
      OCR:{ code:"J248", papers:{ "Paper 1":["Particles"], "Paper 2":["Predicting Reactions"] }},
      Eduqas:{ code:"C410P", papers:{ "Component 1":["Substances"], "Component 2":["Acids & Bases"] }}
    }
  },
  { icon: "🧬", name: "Biology", desc: "Biology topics and exam-board breakdown", boards: {
      AQA:{ code:"8461", papers:{ "Paper 1":["Cell Biology"], "Paper 2":["Homeostasis"] }},
      Edexcel:{ code:"1BI0", papers:{ "Paper 1":["Key Concepts"], "Paper 2":["Ecosystems"] }},
      OCR:{ code:"J247", papers:{ "Paper 1":["Cell Level"], "Paper 2":["Community Level"] }},
      Eduqas:{ code:"C400P", papers:{ "Component 1":["Cells"], "Component 2":["Genetics"] }}
    }
  },
  { icon: "🧮", name: "Maths", desc: "Mathematics topics and exam-board breakdown", boards: {
      AQA:{ code:"8300", papers:{ "Paper 1":["Number","Algebra"], "Paper 2":["Geometry","Statistics"] }},
      Edexcel:{ code:"1MA1", papers:{ "Paper 1":["Number"], "Paper 2":["Algebra"] }},
      OCR:{ code:"J560", papers:{ "Paper 1":["Number"], "Paper 2":["Algebra"] }},
      Eduqas:{ code:"C300", papers:{ "Paper 1":["Number"], "Paper 2":["Algebra"] }}
    }
  }
];

const EXAM_BOARDS = ["AQA","Edexcel","OCR","Eduqas"];
const RES_SUBJECTS = ["Physics","Chemistry","Biology","Maths"];

/* -------------------- Helper utilities -------------------- */
const subjectByName = (n) => subjects.find(s => s.name === n);
const topicsFor = (subjectName, boardName) => {
  const s = subjectByName(subjectName); if (!s) return [];
  const b = s.boards[boardName] || Object.values(s.boards)[0];
  return Object.values(b.papers).flat();
};

/* -------------------- FrontPage Video (admin-editable) -------------------- */
function FrontVideo({ isAdmin, defaultVideo = DEFAULT_FRONT_VIDEO }) {
  const [videoUrl, setVideoUrl] = useState(defaultVideo);
  const mountedRef = useRef(true);

  const toEmbed = (url) => {
    if (!url) return url;
    const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}` : url;
  };

  useEffect(() => {
    mountedRef.current = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "front_video")
          .single();
        if (!mountedRef.current) return;
        if (error && error.code !== "PGRST116") {
          // ignore "no rows" type error
          console.warn("FrontVideo load error:", error.message);
        } else if (data && data.value) {
          setVideoUrl(data.value);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { mountedRef.current = false; };
  }, []);

  const changeVideo = async () => {
    const url = window.prompt("Paste YouTube link (any format) or direct .mp4 URL:", videoUrl || "");
    if (!url) return;
    const final = toEmbed(url.trim());
    const { error } = await supabase.from("site_settings").upsert({ key: "front_video", value: final });
    if (error) return alert("Failed to save video: " + error.message);
    setVideoUrl(final);
    alert("Front video updated.");
  };

  const isYouTube = /youtube\.com|youtu\.be/.test(videoUrl || "");

  return (
    <section id="intro-video" style={{ padding: "40px 20px", textAlign: "center", background: "#0b0420" }}>
      <div style={{ maxWidth: 920, margin: "0 auto", color: "#fff" }}>
        <div style={{ marginBottom: 10, fontWeight: 800 }}>🎬 Intro</div>
        <h2 style={{ margin: "8px 0 14px", fontSize: "1.8rem" }}>See how JDScience helps students succeed</h2>
        {isAdmin && (
          <div style={{ marginBottom: 14 }}>
            <button onClick={changeVideo} style={{ background: "#a78bfa", color: "#1a0533", padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer" }}>
              ✎ Change Home Video
            </button>
          </div>
        )}
        <div style={{ position: "relative", paddingTop: "56.25%", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,.08)" }}>
          {isYouTube ? (
            <iframe src={videoUrl} title="Intro video" allowFullScreen style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }} />
          ) : (
            <video src={videoUrl} controls style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
      </div>
    </section>
  );
}

/* -------------------- Tutor submission component -------------------- */
function TutorSubmission({ onSubmitted }) {
  const [form, setForm] = useState({ name: "", subject: "", bio: "", rate: "", payment_link: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadPhoto = async (file) => {
    if (!file) return null;
    const path = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const { error } = await supabase.storage.from(TUTOR_PHOTO_BUCKET).upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(TUTOR_PHOTO_BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.subject) return alert("Please provide name and subject.");
    setLoading(true);
    try {
      let photoUrl = null;
      if (photoFile) photoUrl = await uploadPhoto(photoFile);
      const payload = {
        name: form.name,
        subject: form.subject,
        bio: form.bio,
        rate: form.rate,
        photo: photoUrl,
        payment_link: form.payment_link,
        approved: false, // admin must approve
      };
      const { error } = await supabase.from("tutors").insert(payload);
      if (error) throw error;
      alert("Thanks — your profile has been submitted and will appear once approved.");
      setForm({ name: "", subject: "", bio: "", rate: "", payment_link: "" });
      setPhotoFile(null);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      alert("Submission failed: " + (err.message || err.error || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 720, margin: "0 auto", display: "grid", gap: 12 }}>
      <input required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
      <input required placeholder="Subject(s) (e.g. Physics, Maths)" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} style={inputStyle} />
      <textarea placeholder="Short bio" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
      <input placeholder="Rate (e.g. £35/hr)" value={form.rate} onChange={e => setForm({ ...form, rate: e.target.value })} style={inputStyle} />
      <input placeholder="Payment link (optional)" value={form.payment_link} onChange={e => setForm({ ...form, payment_link: e.target.value })} style={inputStyle} />
      <div>
        <label style={{ display: "block", marginBottom: 6 }}>Photo (optional)</label>
        <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={loading} style={{ padding: "10px 14px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer" }}>
          {loading ? "Submitting…" : "Submit Tutor Profile"}
        </button>
      </div>
    </form>
  );
}

/* -------------------- Navbar -------------------- */
function Navbar({ isAdmin, onLoginToggle }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.08)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div style={{ width: 42, height: 42, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900 }}>JD</div>
          <div style={{ fontWeight: 800, color: "#111" }}>JDScience</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onLoginToggle} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: isAdmin ? "#16a34a" : "#e5e7eb", color: isAdmin ? "#fff" : "#333", cursor: "pointer" }}>{isAdmin ? "Logout" : "Admin"}</button>
        </div>
      </div>
      <div style={{ background: "#2dd4bf", display: "flex", justifyContent: "center", gap: 6, padding: "8px 0" }}>
        <NavButton label="Home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        <NavButton label="11+" onClick={() => document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" })} />
        <NavButton label="GCSE / IGCSE" onClick={() => document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" })} />
        <NavButton label="A-Level" onClick={() => document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" })} />
        <NavButton label="T-Levels" onClick={() => document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" })} />
        <NavButton label="BTEC" onClick={() => document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" })} />
        <NavButton label="Resources" onClick={() => document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" })} />
        <NavButton label="Tutors" onClick={() => document.getElementById("tutors")?.scrollIntoView({ behavior: "smooth" })} />
        <NavButton label="Contact" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })} />
      </div>
    </nav>
  );
}
function NavButton({ label, onClick }) {
  return <button onClick={onClick} style={{ background: "transparent", border: "none", padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>{label}</button>;
}

/* -------------------- Hero -------------------- */
function Hero({ onBook }) {
  return (
    <section id="home" style={{ padding: "60px 20px", background: "linear-gradient(135deg,#1a0533,#2d1060)", color: "#fff", textAlign: "center" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 36, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 320 }}>
            <h1 style={{ fontSize: "2.8rem", lineHeight: 1.05, marginBottom: 14, fontWeight: 900 }}>
              Learn <span style={{ color: "#a78bfa" }}>Smarter</span>. Revise <span style={{ color: "#2dd4bf" }}>Better</span>. Achieve More.
            </h1>
            <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 20 }}>Personalised tutoring for 11+, GCSE, A-Level, T-Levels and BTEC.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-start", flexWrap: "wrap" }}>
              <button onClick={() => document.getElementById("subjects")?.scrollIntoView({ behavior: "smooth" })} style={{ background: "rgba(255,255,255,.12)", color: "#fff", padding: "12px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,.18)", cursor: "pointer", fontWeight: 800 }}>Explore Subjects</button>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 320, borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>
            <img src={HERO_IMG} alt="students" style={{ width: "100%", display: "block" }} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Tutors (homepage listing) -------------------- */
function TutorsSection({ isAdmin, onOpenSubmission }) {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tutors").select("*").eq("approved", true).order("created_at", { ascending: false });
    if (error) {
      console.error("Load tutors error", error);
      setTutors([]);
    } else {
      setTutors(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <section id="tutors" style={{ padding: "60px 20px", background: "#faf5ff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h2 style={{ fontSize: "1.8rem", margin: 0 }}>Meet Our Tutors</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onOpenSubmission} style={{ padding: "8px 12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Become a Tutor</button>
            {isAdmin && <button onClick={() => { window.open('/supabase', '_blank'); }} style={{ padding: "8px 12px", background: "#06b6d4", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Admin (Supabase)</button>}
          </div>
        </div>

        {loading ? <p>Loading tutors…</p> : tutors.length === 0 ? <p>No approved tutors yet.</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>
            {tutors.map(t => (
              <div key={t.id} style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #eee", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ height: 140, borderRadius: 10, overflow: "hidden", background: t.photo ? `url(${t.photo}) center/cover` : "linear-gradient(135deg,#7c3aed,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "2.2rem" }}>
                  {!t.photo && "👩‍🏫"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{t.name}</h3>
                    <div style={{ color: "#7c3aed", fontWeight: 700, marginTop: 6 }}>{t.subject} {t.rate ? `· ${t.rate}` : ""}</div>
                  </div>
                </div>
                <p style={{ margin: 0, color: "#444" }}>{t.bio}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href={t.payment_link || "#"} target="_blank" rel="noreferrer" style={{ padding: "8px 10px", background: "#635bff", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>Book</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* -------------------- Contact -------------------- */
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "Physics", message: "" });
  const [sent, setSent] = useState(false);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nSubject: ${form.subject}\n\n${form.message}`;
    window.location.href = `mailto:${CONTACT.email}?subject=Enquiry from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };
  return (
    <section id="contact" style={{ padding: "60px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2>Contact</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <p style={{ marginTop: 8 }}>Email: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
            <p>Phone: <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a></p>
            <p>Or send a message using the form.</p>
          </div>
          <div>
            {sent ? (
              <div>
                <h3>Message Opened</h3>
                <p>Thank you — your email client opened to send the message.</p>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
                <input required name="name" placeholder="Your name" value={form.name} onChange={change} style={inputStyle} />
                <input required name="email" placeholder="Your email" value={form.email} onChange={change} style={inputStyle} />
                <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={change} style={inputStyle} />
                <select name="subject" value={form.subject} onChange={change} style={inputStyle}>
                  {subjects.map(s => <option key={s.name}>{s.name}</option>)}
                </select>
                <textarea required name="message" placeholder="Your message" value={form.message} onChange={change} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                <button type="submit" style={{ padding: "10px 14px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", cursor: "pointer" }}>Send</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------- Footer -------------------- */
function Footer() {
  return (
    <footer style={{ padding: 20, borderTop: "1px solid #eee", textAlign: "center" }}>
      <div style={{ fontWeight: 800, color: "#7c3aed" }}>JDScience</div>
      <div style={{ marginTop: 8, color: "#666" }}>© {new Date().getFullYear()} JDScience. All rights reserved.</div>
    </footer>
  );
}

/* -------------------- App (root) -------------------- */
export default function App() {
  const [session, setSession] = useState(null);
  const [showTutorForm, setShowTutorForm] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data?.session || null);
    })();
    const { subscription } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const isAdmin = !!session;

  const handleAdminToggle = async () => {
    if (isAdmin) {
      await supabase.auth.signOut();
      setSession(null);
      return;
    }
    const email = window.prompt("Admin email:");
    if (!email) return;
    const password = window.prompt("Admin password:");
    if (!password) return;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert("Login failed: " + error.message);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", color: "#111" }}>
      <Navbar isAdmin={isAdmin} onLoginToggle={handleAdminToggle} />
      <main>
        <Hero />
        <FrontVideo isAdmin={isAdmin} />
        <section id="subjects" style={{ padding: "60px 20px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2>Subjects We Offer</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 18 }}>
              {subjects.map(s => (
                <div key={s.name} style={{ padding: 18, borderRadius: 12, background: "#fff", border: "1px solid #eee" }}>
                  <div style={{ fontSize: "1.6rem" }}>{s.icon}</div>
                  <h3 style={{ marginTop: 8 }}>{s.name}</h3>
                  <p style={{ color: "#555" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <TutorsSection isAdmin={isAdmin} onOpenSubmission={() => setShowTutorForm(true)} />

        {showTutorForm && (
          <div onClick={() => setShowTutorForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1200 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "94%", maxWidth: 820, background: "#fff", borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>Become a Tutor</h3>
                <button onClick={() => setShowTutorForm(false)} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }}>✕</button>
              </div>
              <TutorSubmission onSubmitted={() => setShowTutorForm(false)} />
            </div>
          </div>
        )}

        <Contact />
      </main>

      <Footer />
    </div>
  );
}
