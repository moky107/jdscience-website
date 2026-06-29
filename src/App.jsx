import React, { useState, useEffect } from "react";

/* ─── navigation data ─── */
const NAV_DROPDOWNS = {
  "11+": ["English","Maths","Verbal Reasoning","Non-Verbal Reasoning"],
  "GCSE/IGCSE": ["Paper 1: Biology 1","Paper 2: Biology 2","Paper 3: Chemistry 1","Paper 4: Chemistry 2","Paper 5: Physics 1","Paper 6: Physics 2"],
  "A-Level": ["Paper 1: Love Through the Ages","Paper 2: Texts in Shared Contexts","Non-Exam Assessment: Independent Critical Study"],
  "BTEC": ["Unit 1: Principles and Applications of Science I","Unit 2: Practical Scientific Procedures and Techniques","Unit 3: Science Investigation Skills","Unit 4: Laboratory Techniques and their Application","Unit 5: Principles and Applications of Science II","Unit 6: Investigative Project","Unit 7: Contemporary Issues in Science","Unit 8: Physiology of Human Body Systems","Unit 9: Human Regulation and Reproduction","Unit 10: Biological Molecules and Metabolic Pathways","Unit 11: Genetics and Genetic Engineering","Unit 12: Diseases and Infections","Unit 13: Applications of Inorganic Chemistry","Unit 14: Applications of Organic Chemistry","Unit 15: Electrical Circuits and their Application","Unit 16: Astronomy and Space Science","Unit 17: Microbiology and Microbiological Techniques","Unit 18: Industrial Chemical Reactions","Unit 19: Practical Chemical Analysis","Unit 20: Biomedical Science","Unit 21: Medical Physics Applications","Unit 22: Materials Science","Unit 23: Forensic Evidence, Collection and Analysis","Unit 24: Cryogenics and Vacuum Technology","Unit 25: Forensic Fire Investigation","Unit 26: Forensic Traffic Collision Investigation"],
  "T-Level": ["Core Biology Concepts","Core Chemistry Concepts","Core Physics Concepts","Working in the Science Sector","Good Scientific Practice","Occupational Specialism: Laboratory Sciences","Occupational Specialism: Food Sciences"]
};

const BANNER_URL = "https://cdn.abacus.ai/images/d7483150-c314-4b0b-9738-b709d80ad9db.png";

/* ─── keyframe styles injected once ─── */
const GLOBAL_STYLE = `
@keyframes tutorPulse {
  0%   { box-shadow: 0 0 0 0 rgba(0,150,136,.45); }
  70%  { box-shadow: 0 0 0 12px rgba(0,150,136,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,150,136,0); }
}
@keyframes fadeIn {
  from { opacity:0; transform:translateY(18px); }
  to   { opacity:1; transform:translateY(0); }
}
`;

/* ══════════════════════════════════════════════
   Reusable small components
   ══════════════════════════════════════════════ */

function NavDropdown({ label, items, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "none", border: "none", color: "#fff",
          fontWeight: 600, cursor: "pointer", padding: "10px 14px",
          fontSize: 15, whiteSpace: "nowrap"
        }}
      >
        {label} ▾
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, minWidth: 280,
          background: "#fff", borderRadius: 8, boxShadow: "0 8px 32px rgba(0,0,0,.18)",
          zIndex: 1000, maxHeight: 420, overflowY: "auto", padding: "6px 0"
        }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => { onSelect(label, item); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: "none", border: "none", padding: "10px 18px",
                cursor: "pointer", fontSize: 14, color: "#333",
                borderBottom: i < items.length - 1 ? "1px solid #f0f0f0" : "none"
              }}
              onMouseOver={e => e.currentTarget.style.background = "#e0f2f1"}
              onMouseOut={e => e.currentTarget.style.background = "none"}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NavLink({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "rgba(255,255,255,.18)" : "none",
        border: "none", color: "#fff", fontWeight: 600,
        cursor: "pointer", padding: "10px 14px", fontSize: 15,
        borderRadius: 6, whiteSpace: "nowrap"
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.12)"; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = "none"; }}
    >
      {label}
    </button>
  );
}

/* ── Tutor Card with pulse animation ── */
function TutorCard({ tutor, onBook }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,.10)",
      animation: "tutorPulse 2.2s infinite",
      transition: "transform .25s", cursor: "default",
      width: 260, flexShrink: 0
    }}
      onMouseOver={e => e.currentTarget.style.transform = "translateY(-6px)"}
      onMouseOut={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{
        height: 180, background: "#b2dfdb",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"
      }}>
        {tutor.photo ? (
          <img src={tutor.photo} alt={tutor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 64, color: "#00796b" }}>👤</span>
        )}
      </div>
      <div style={{ padding: "18px 16px" }}>
        <h4 style={{ margin: "0 0 4px", color: "#004d40" }}>{tutor.name}</h4>
        <p style={{ margin: "0 0 2px", fontSize: 14, color: "#555" }}>{tutor.subject}</p>
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#888" }}>{tutor.experience} yrs experience</p>
        <button
          onClick={() => onBook(tutor)}
          style={{
            width: "100%", padding: "10px 0", background: "#009688", color: "#fff",
            border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14
          }}
          onMouseOver={e => e.currentTarget.style.background = "#00796b"}
          onMouseOut={e => e.currentTarget.style.background = "#009688"}
        >
          Book Session
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main App
   ══════════════════════════════════════════════ */
function App() {
  /* ── state ── */
  const [page, setPage] = useState("home");
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tutors
  const [tutors, setTutors] = useState([]);
  const [tutorForm, setTutorForm] = useState({
    name: "", email: "", phone: "", subject: "Physics",
    level: "GCSE", experience: "", qualifications: "", bio: "", photo: null
  });
  const [tutorSubmitted, setTutorSubmitted] = useState(false);

  // Booking
  const [bookingTutor, setBookingTutor] = useState(null);
  const [bookingForm, setBookingForm] = useState({ name: "", email: "", date: "", message: "" });
  const [bookingSent, setBookingSent] = useState(false);

  // Contact
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  // Admin
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState("");

  // Seed sample tutors
  useEffect(() => {
    setTutors([
      { id: 1, name: "Dr. Sarah Johnson", email: "sarah@jdscience.co.uk", phone: "07400000001", subject: "Physics", level: "A-Level", experience: "8", qualifications: "PhD in Astrophysics", bio: "Passionate about making physics accessible.", photo: null, status: "approved" },
      { id: 2, name: "Mr. James Chen", email: "james@jdscience.co.uk", phone: "07400000002", subject: "Chemistry", level: "GCSE", experience: "5", qualifications: "MSc Organic Chemistry", bio: "Specialist in GCSE and IGCSE Chemistry.", photo: null, status: "approved" },
      { id: 3, name: "Ms. Priya Patel", email: "priya@jdscience.co.uk", phone: "07400000003", subject: "Biology", level: "A-Level", experience: "10", qualifications: "MSc Molecular Biology", bio: "Experienced A-Level Biology examiner.", photo: null, status: "approved" },
      { id: 4, name: "Dr. Emily Clarke", email: "emily@jdscience.co.uk", phone: "07400000004", subject: "Maths", level: "11+", experience: "6", qualifications: "PhD Mathematics", bio: "Helping students excel in 11+ entrance exams.", photo: null, status: "approved" }
    ]);
  }, []);

  const approvedTutors = tutors.filter(t => t.status === "approved");
  const pendingTutors = tutors.filter(t => t.status === "pending");

  /* ── inject global CSS once ── */
  useEffect(() => {
    const id = "jds-global-style";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = GLOBAL_STYLE;
      document.head.appendChild(tag);
    }
  }, []);

  /* ── helpers ── */
  const goHome = () => { setPage("home"); setSelectedLevel(null); setSelectedTopic(null); };
  const handleDropdownSelect = (level, topic) => {
    setSelectedLevel(level);
    setSelectedTopic(topic);
    setPage("topic");
    setMobileMenuOpen(false);
  };

  const handleTutorSubmit = (e) => {
    e.preventDefault();
    const newTutor = {
      ...tutorForm,
      id: Date.now(),
      status: "pending",
      photo: tutorForm.photo || null
    };
    setTutors(prev => [...prev, newTutor]);
    setTutorSubmitted(true);
  };

  const approveTutor = (id) => setTutors(prev => prev.map(t => t.id === id ? { ...t, status: "approved" } : t));
  const rejectTutor = (id) => setTutors(prev => prev.filter(t => t.id !== id));

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */

  /* ── Shared wrapper ── */
  const shell = (content) => (
    <div style={{ fontFamily: "'Segoe UI', Roboto, sans-serif", color: "#333", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ─ Top Bar ─ */}
      <nav style={{
        background: "linear-gradient(135deg,#009688,#004d40)",
        padding: "0 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", position: "sticky",
        top: 0, zIndex: 999, boxShadow: "0 2px 12px rgba(0,0,0,.25)"
      }}>
        <div
          onClick={goHome}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "10px 0" }}
        >
          <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>JD</span>
          <span style={{ fontSize: 14, color: "#b2dfdb", fontWeight: 500 }}>Science</span>
        </div>

        {/* hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none", background: "none", border: "none",
            color: "#fff", fontSize: 28, cursor: "pointer",
            ...(window.innerWidth <= 900 ? { display: "block" } : {})
          }}
        >☰</button>

        {/* nav items */}
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2,
          ...(window.innerWidth <= 900
            ? {
                display: mobileMenuOpen ? "flex" : "none",
                flexDirection: "column", width: "100%",
                paddingBottom: 12, alignItems: "flex-start"
              }
            : {})
        }}>
          <NavLink label="Home" active={page === "home"} onClick={goHome} />
          {Object.entries(NAV_DROPDOWNS).map(([level, items]) => (
            <NavDropdown key={level} label={level} items={items} onSelect={handleDropdownSelect} />
          ))}
          <NavLink label="Become a Tutor" active={page === "become-tutor"}
            onClick={() => { setPage("become-tutor"); setTutorSubmitted(false); setMobileMenuOpen(false); }} />
          <NavLink label="Past Papers" active={page === "past-papers"}
            onClick={() => { setPage("past-papers"); setMobileMenuOpen(false); }} />
          <NavLink label="Resources" active={page === "resources"}
            onClick={() => { setPage("resources"); setMobileMenuOpen(false); }} />
          <NavLink label="Find a Tutor" active={page === "find-tutor"}
            onClick={() => { setPage("find-tutor"); setMobileMenuOpen(false); }} />
          <NavLink label="Contact" active={page === "contact"}
            onClick={() => { setPage("contact"); setContactSent(false); setMobileMenuOpen(false); }} />
          <NavLink label="Admin" active={page === "admin"}
            onClick={() => { setPage("admin"); setMobileMenuOpen(false); }} />
        </div>
      </nav>

      {/* ─ Page Content ─ */}
      <main style={{ flex: 1 }}>
        {content}
      </main>

      {/* ─ Footer ─ */}
      <footer style={{
        background: "#004d40", color: "#b2dfdb", padding: "40px 24px",
        textAlign: "center", fontSize: 14
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h3 style={{ color: "#fff", marginBottom: 8 }}>JD Science</h3>
          <p style={{ margin: "4px 0" }}>Empowering students to excel in science education</p>
          <p style={{ margin: "12px 0 4px" }}>
            ✉️ <a href="mailto:info@jdscience.co.uk" style={{ color: "#80cbc4" }}>info@jdscience.co.uk</a>
            &nbsp;&nbsp;|&nbsp;&nbsp;
            📞 <a href="tel:07466142805" style={{ color: "#80cbc4" }}>07466 142 805</a>
          </p>
          <p style={{ marginTop: 18, color: "#5f9ea0", fontSize: 12 }}>© {new Date().getFullYear()} JD Science. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );

  /* ════════════════════════════════════
     PAGE: HOME
     ════════════════════════════════════ */
  if (page === "home") return shell(
    <>
      {/* Hero */}
      <section style={{
        position: "relative", minHeight: 420, display: "flex",
        alignItems: "center", justifyContent: "center",
        background: `linear-gradient(rgba(0,77,64,.55),rgba(0,77,64,.7)), url("${BANNER_URL}") center/cover no-repeat`,
        color: "#fff", textAlign: "center", padding: "60px 24px"
      }}>
        <div style={{ maxWidth: 720, animation: "fadeIn .8s ease" }}>
          <h1 style={{ fontSize: "clamp(28px,5vw,52px)", fontWeight: 800, marginBottom: 12, textShadow: "0 2px 12px rgba(0,0,0,.3)" }}>
            Welcome to JD Science
          </h1>
          <p style={{ fontSize: "clamp(16px,2.5vw,22px)", lineHeight: 1.6, marginBottom: 28, maxWidth: 600, margin: "0 auto 28px" }}>
            Expert science tutoring for 11+, GCSE, IGCSE, A-Level, BTEC &amp; T-Level students. Achieve your academic goals with personalised support.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setPage("find-tutor")}
              style={{
                padding: "14px 36px", background: "#fff", color: "#004d40",
                border: "none", borderRadius: 30, fontWeight: 700, fontSize: 16,
                cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,.18)"
              }}
            >Find a Tutor</button>
            <button
              onClick={() => setPage("past-papers")}
              style={{
                padding: "14px 36px", background: "transparent", color: "#fff",
                border: "2px solid #fff", borderRadius: 30, fontWeight: 700,
                fontSize: 16, cursor: "pointer"
              }}
            >Past Papers</button>
          </div>
        </div>
      </section>

      {/* Quick Level Cards */}
      <section style={{ padding: "56px 24px", background: "#f9fffe" }}>
        <h2 style={{ textAlign: "center", color: "#004d40", marginBottom: 36, fontSize: 30 }}>Explore by Level</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center", maxWidth: 1100, margin: "0 auto" }}>
          {Object.keys(NAV_DROPDOWNS).map(level => (
            <div
              key={level}
              onClick={() => { setSelectedLevel(level); setSelectedTopic(null); setPage("level-overview"); }}
              style={{
                background: "#fff", borderRadius: 12, padding: "28px 24px",
                width: 190, textAlign: "center", cursor: "pointer",
                boxShadow: "0 2px 12px rgba(0,0,0,.08)", transition: "transform .2s, box-shadow .2s",
                border: "2px solid transparent"
              }}
              onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#009688"; }}
              onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "transparent"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>📚</div>
              <h3 style={{ color: "#009688", margin: 0, fontSize: 20 }}>{level}</h3>
              <p style={{ fontSize: 13, color: "#777", marginTop: 6 }}>{NAV_DROPDOWNS[level].length} subjects</p>
            </div>
          ))}
        </div>
      </section>

      {/* Approved Tutors Section */}
      {approvedTutors.length > 0 && (
        <section style={{ padding: "56px 24px", background: "#fff" }}>
          <h2 style={{ textAlign: "center", color: "#004d40", marginBottom: 12, fontSize: 30 }}>Our Tutors</h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 36, maxWidth: 540, margin: "0 auto 36px" }}>
            Meet our qualified and experienced science tutors ready to help you succeed.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center", maxWidth: 1200, margin: "0 auto" }}>
            {approvedTutors.map(t => (
              <TutorCard key={t.id} tutor={t} onBook={(tutor) => { setBookingTutor(tutor); setBookingSent(false); setPage("booking"); }} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{
        background: "linear-gradient(135deg,#009688,#004d40)", color: "#fff",
        padding: "52px 24px", textAlign: "center"
      }}>
        <h2 style={{ marginBottom: 12 }}>Are You a Science Expert?</h2>
        <p style={{ marginBottom: 24, maxWidth: 500, margin: "0 auto 24px", opacity: .9 }}>
          Join our team of tutors and help students achieve their academic goals.
        </p>
        <button
          onClick={() => { setPage("become-tutor"); setTutorSubmitted(false); }}
          style={{
            padding: "14px 40px", background: "#fff", color: "#004d40",
            border: "none", borderRadius: 30, fontWeight: 700, fontSize: 16,
            cursor: "pointer"
          }}
        >Become a Tutor</button>
      </section>
    </>
  );

  /* ════════════════════════════════════
     PAGE: LEVEL OVERVIEW
     ════════════════════════════════════ */
  if (page === "level-overview" && selectedLevel) return shell(
    <section style={{ padding: "48px 24px", maxWidth: 900, margin: "0 auto", animation: "fadeIn .5s ease" }}>
      <button onClick={goHome} style={{ background: "none", border: "none", color: "#009688", cursor: "pointer", fontWeight: 600, marginBottom: 20, fontSize: 15 }}>← Back to Home</button>
      <h2 style={{ color: "#004d40", marginBottom: 8, fontSize: 32 }}>{selectedLevel}</h2>
      <p style={{ color: "#666", marginBottom: 32 }}>Select a subject or paper below to view content and resources.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
        {NAV_DROPDOWNS[selectedLevel].map((item, i) => (
          <div
            key={i}
            onClick={() => { setSelectedTopic(item); setPage("topic"); }}
            style={{
              background: "#fff", borderRadius: 10, padding: "22px 20px",
              cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,.07)",
              borderLeft: "4px solid #009688", transition: "transform .2s"
            }}
            onMouseOver={e => e.currentTarget.style.transform = "translateX(6px)"}
            onMouseOut={e => e.currentTarget.style.transform = "translateX(0)"}
          >
            <h4 style={{ margin: 0, color: "#004d40" }}>{item}</h4>
          </div>
        ))}
      </div>
    </section>
  );

  /* ════════════════════════════════════
     PAGE: TOPIC DETAIL
     ════════════════════════════════════ */
  if (page === "topic" && selectedLevel && selectedTopic) return shell(
    <section style={{ padding: "48px 24px", maxWidth: 860, margin: "0 auto", animation: "fadeIn .5s ease" }}>
      <button onClick={() => { setPage("level-overview"); setSelectedTopic(null); }}
        style={{ background: "none", border: "none", color: "#009688", cursor: "pointer", fontWeight: 600, marginBottom: 20, fontSize: 15 }}>
        ← Back to {selectedLevel}
      </button>
      <span style={{ display: "inline-block", background: "#e0f2f1", color: "#00796b", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{selectedLevel}</span>
      <h2 style={{ color: "#004d40", marginBottom: 16, fontSize: 30 }}>{selectedTopic}</h2>
      <div style={{ background: "#fff", borderRadius: 12, padding: "32px 28px", boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
        <p style={{ color: "#555", lineHeight: 1.7, marginBottom: 24 }}>
          Welcome to the <strong>{selectedTopic}</strong> page for <strong>{selectedLevel}</strong>. Here you will find revision notes, past paper questions, mark schemes, and expert tutor support for this topic.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
          {["📝 Revision Notes", "📄 Past Papers", "✅ Mark Schemes", "🎥 Video Lessons"].map(r => (
            <div key={r} style={{
              background: "#f1f8e9", borderRadius: 8, padding: "16px 14px",
              textAlign: "center", fontWeight: 600, color: "#33691e", fontSize: 14
            }}>{r}</div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}>
          <button
            onClick={() => setPage("find-tutor")}
            style={{
              padding: "12px 32px", background: "#009688", color: "#fff",
              border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 15
            }}
          >Find a Tutor for {selectedLevel}</button>
        </div>
      </div>
    </section>
  );

  /* ════════════════════════════════════
     PAGE: BECOME A TUTOR
     ════════════════════════════════════ */
  if (page === "become-tutor") return shell(
    <section style={{ padding: "48px 24px", maxWidth: 680, margin: "0 auto", animation: "fadeIn .5s ease" }}>
      <h2 style={{ color: "#004d40", marginBottom: 8, fontSize: 30 }}>Become a Tutor</h2>
      <p style={{ color: "#666", marginBottom: 32 }}>Join our team and share your expertise with students across the UK.</p>

      {tutorSubmitted ? (
        <div style={{ background: "#e8f5e9", borderRadius: 12, padding: "36px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
          <h3 style={{ color: "#2e7d32", marginBottom: 8 }}>Application Submitted!</h3>
          <p style={{ color: "#555" }}>Your profile is now <strong>pending approval</strong>. Our admin team will review your application shortly.</p>
          <button onClick={goHome}
            style={{ marginTop: 20, padding: "10px 28px", background: "#009688", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
            Back to Home
          </button>
        </div>
      ) : (
        <form onSubmit={handleTutorSubmit} style={{ background: "#fff", borderRadius: 12, padding: "32px 28px", boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
          {[
            { label: "Full Name", key: "name", type: "text", required: true },
            { label: "Email", key: "email", type: "email", required: true },
            { label: "Phone", key: "phone", type: "tel", required: true }
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>{f.label}</label>
              <input
                type={f.type} required={f.required}
                value={tutorForm[f.key]}
                onChange={e => setTutorForm({ ...tutorForm, [f.key]: e.target.value })}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8,
                  border: "1px solid #ccc", fontSize: 15, boxSizing: "border-box"
                }}
              />
            </div>
          ))}

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>Subject Specialization</label>
            <select
              value={tutorForm.subject}
              onChange={e => setTutorForm({ ...tutorForm, subject: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, boxSizing: "border-box" }}
            >
              {["Physics", "Chemistry", "Biology", "Maths"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>Education Level</label>
            <select
              value={tutorForm.level}
              onChange={e => setTutorForm({ ...tutorForm, level: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, boxSizing: "border-box" }}
            >
              {["11+", "GCSE", "A-Level", "BTEC", "T-Level"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>Years of Experience</label>
            <input
              type="number" min="0" required
              value={tutorForm.experience}
              onChange={e => setTutorForm({ ...tutorForm, experience: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>Qualifications</label>
            <input
              type="text" required
              value={tutorForm.qualifications}
              onChange={e => setTutorForm({ ...tutorForm, qualifications: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>Bio</label>
            <textarea
              rows={4} required
              value={tutorForm.bio}
              onChange={e => setTutorForm({ ...tutorForm, bio: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, resize: "vertical", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>Photo Upload</label>
            <div style={{
              border: "2px dashed #b2dfdb", borderRadius: 10, padding: "28px 20px",
              textAlign: "center", color: "#888", cursor: "pointer", background: "#f9fffe"
            }}
              onClick={() => {
                const url = prompt("Enter a URL for your profile photo (or leave blank):");
                if (url) setTutorForm({ ...tutorForm, photo: url });
              }}
            >
              {tutorForm.photo ? (
                <p style={{ color: "#009688", fontWeight: 600 }}>✓ Photo added</p>
              ) : (
                <p>📷 Click to add a photo URL</p>
              )}
            </div>
          </div>

          <button type="submit" style={{
            width: "100%", padding: "14px 0", background: "#009688", color: "#fff",
            border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16,
            cursor: "pointer", boxShadow: "0 4px 16px rgba(0,150,136,.3)"
          }}>Submit Application</button>
        </form>
      )}
    </section>
  );

  /* ════════════════════════════════════
     PAGE: FIND A TUTOR
     ════════════════════════════════════ */
  if (page === "find-tutor") return shell(
    <section style={{ padding: "48px 24px", maxWidth: 1100, margin: "0 auto", animation: "fadeIn .5s ease" }}>
      <h2 style={{ color: "#004d40", marginBottom: 8, fontSize: 30 }}>Find a Tutor</h2>
      <p style={{ color: "#666", marginBottom: 36 }}>Browse our approved tutors and book a session today.</p>
      {approvedTutors.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999", padding: 40 }}>No tutors available yet. Check back soon!</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "center" }}>
          {approvedTutors.map(t => (
            <TutorCard key={t.id} tutor={t} onBook={(tutor) => { setBookingTutor(tutor); setBookingSent(false); setPage("booking"); }} />
          ))}
        </div>
      )}
    </section>
  );

  /* ════════════════════════════════════
     PAGE: BOOKING
     ════════════════════════════════════ */
  if (page === "booking" && bookingTutor) return shell(
    <section style={{ padding: "48px 24px", maxWidth: 600, margin: "0 auto", animation: "fadeIn .5s ease" }}>
      <button onClick={() => setPage("find-tutor")}
        style={{ background: "none", border: "none", color: "#009688", cursor: "pointer", fontWeight: 600, marginBottom: 20, fontSize: 15 }}>
        ← Back to Tutors
      </button>
      <h2 style={{ color: "#004d40", marginBottom: 6 }}>Book a Session</h2>
      <p style={{ color: "#666", marginBottom: 28 }}>with <strong>{bookingTutor.name}</strong> — {bookingTutor.subject}</p>
      {bookingSent ? (
        <div style={{ background: "#e8f5e9", borderRadius: 12, padding: "36px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
          <h3 style={{ color: "#2e7d32" }}>Booking Request Sent!</h3>
          <p style={{ color: "#555" }}>We'll be in touch shortly to confirm your session.</p>
          <button onClick={goHome} style={{ marginTop: 16, padding: "10px 28px", background: "#009688", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Home</button>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); setBookingSent(true); }}
          style={{ background: "#fff", borderRadius: 12, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
          {[
            { label: "Your Name", key: "name", type: "text" },
            { label: "Email", key: "email", type: "email" },
            { label: "Preferred Date", key: "date", type: "date" }
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>{f.label}</label>
              <input
                type={f.type} required
                value={bookingForm[f.key]}
                onChange={e => setBookingForm({ ...bookingForm, [f.key]: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>Message (optional)</label>
            <textarea rows={3}
              value={bookingForm.message}
              onChange={e => setBookingForm({ ...bookingForm, message: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, resize: "vertical", boxSizing: "border-box" }}
            />
          </div>
          <button type="submit" style={{
            width: "100%", padding: "14px 0", background: "#009688", color: "#fff",
            border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer"
          }}>Send Booking Request</button>
        </form>
      )}
    </section>
  );

  /* ════════════════════════════════════
     PAGE: PAST PAPERS
     ════════════════════════════════════ */
  if (page === "past-papers") return shell(
    <section style={{ padding: "48px 24px", maxWidth: 900, margin: "0 auto", animation: "fadeIn .5s ease" }}>
      <h2 style={{ color: "#004d40", marginBottom: 8, fontSize: 30 }}>Past Papers</h2>
      <p style={{ color: "#666", marginBottom: 32 }}>Access past exam papers organised by qualification level.</p>
      {Object.entries(NAV_DROPDOWNS).map(([level, items]) => (
        <div key={level} style={{ marginBottom: 28 }}>
          <h3 style={{ color: "#00796b", borderBottom: "2px solid #e0f2f1", paddingBottom: 8, marginBottom: 14 }}>{level}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
            {items.map((item, i) => (
              <div
                key={i}
                onClick={() => handleDropdownSelect(level, item)}
                style={{
                  background: "#fff", borderRadius: 8, padding: "14px 16px",
                  cursor: "pointer", boxShadow: "0 1px 6px rgba(0,0,0,.06)",
                  borderLeft: "3px solid #009688", fontSize: 14, transition: "background .2s"
                }}
                onMouseOver={e => e.currentTarget.style.background = "#e0f2f1"}
                onMouseOut={e => e.currentTarget.style.background = "#fff"}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );

  /* ════════════════════════════════════
     PAGE: RESOURCES
     ════════════════════════════════════ */
  if (page === "resources") return shell(
    <section style={{ padding: "48px 24px", maxWidth: 900, margin: "0 auto", animation: "fadeIn .5s ease" }}>
      <h2 style={{ color: "#004d40", marginBottom: 8, fontSize: 30 }}>Resources</h2>
      <p style={{ color: "#666", marginBottom: 32 }}>Free study materials, revision guides, and tools for every level.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
        {[
          { icon: "📖", title: "Revision Guides", desc: "Comprehensive topic summaries for all levels" },
          { icon: "🧪", title: "Practical Guides", desc: "Step-by-step laboratory experiment guides" },
          { icon: "🎥", title: "Video Tutorials", desc: "Bite-sized video explanations of key concepts" },
          { icon: "📊", title: "Formula Sheets", desc: "Essential formulae for Physics, Chemistry & Maths" },
          { icon: "🃏", title: "Flashcards", desc: "Quick revision flashcards for key topics" },
          { icon: "📝", title: "Worked Examples", desc: "Step-by-step solutions to exam-style questions" }
        ].map((r, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 12, padding: "28px 22px",
            boxShadow: "0 2px 10px rgba(0,0,0,.06)", textAlign: "center"
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>{r.icon}</div>
            <h4 style={{ color: "#004d40", margin: "0 0 6px" }}>{r.title}</h4>
            <p style={{ fontSize: 13, color: "#777", margin: 0 }}>{r.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );

  /* ════════════════════════════════════
     PAGE: CONTACT
     ════════════════════════════════════ */
  if (page === "contact") return shell(
    <section style={{ padding: "48px 24px", maxWidth: 600, margin: "0 auto", animation: "fadeIn .5s ease" }}>
      <h2 style={{ color: "#004d40", marginBottom: 8, fontSize: 30 }}>Contact Us</h2>
      <p style={{ color: "#666", marginBottom: 8 }}>Get in touch — we'd love to hear from you.</p>
      <p style={{ marginBottom: 28, fontSize: 14 }}>
        ✉️ <a href="mailto:info@jdscience.co.uk" style={{ color: "#009688" }}>info@jdscience.co.uk</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        📞 <a href="tel:07466142805" style={{ color: "#009688" }}>07466 142 805</a>
      </p>
      {contactSent ? (
        <div style={{ background: "#e8f5e9", borderRadius: 12, padding: "36px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📨</div>
          <h3 style={{ color: "#2e7d32" }}>Message Sent!</h3>
          <p style={{ color: "#555" }}>We'll get back to you as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); setContactSent(true); }}
          style={{ background: "#fff", borderRadius: 12, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
          {[
            { label: "Name", key: "name", type: "text" },
            { label: "Email", key: "email", type: "email" }
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>{f.label}</label>
              <input
                type={f.type} required
                value={contactForm[f.key]}
                onChange={e => setContactForm({ ...contactForm, [f.key]: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, boxSizing: "border-box" }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: "#004d40", fontSize: 14 }}>Message</label>
            <textarea rows={5} required
              value={contactForm.message}
              onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, resize: "vertical", boxSizing: "border-box" }}
            />
          </div>
          <button type="submit" style={{
            width: "100%", padding: "14px 0", background: "#009688", color: "#fff",
            border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer"
          }}>Send Message</button>
        </form>
      )}
    </section>
  );

  /* ════════════════════════════════════
     PAGE: ADMIN
     ════════════════════════════════════ */
  if (page === "admin") return shell(
    <section style={{ padding: "48px 24px", maxWidth: 900, margin: "0 auto", animation: "fadeIn .5s ease" }}>
      <h2 style={{ color: "#004d40", marginBottom: 8, fontSize: 30 }}>Admin Panel</h2>

      {!adminLoggedIn ? (
        <div style={{ maxWidth: 400, margin: "40px auto" }}>
          <form onSubmit={e => {
            e.preventDefault();
            if (adminPass === "jdscience2024") setAdminLoggedIn(true);
            else alert("Incorrect password");
          }}
            style={{ background: "#fff", borderRadius: 12, padding: "32px 28px", boxShadow: "0 2px 12px rgba(0,0,0,.07)" }}>
            <p style={{ color: "#666", marginBottom: 20 }}>Enter the admin password to continue.</p>
            <input
              type="password" placeholder="Password" required
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 15, marginBottom: 16, boxSizing: "border-box" }}
            />
            <button type="submit" style={{
              width: "100%", padding: "12px 0", background: "#009688", color: "#fff",
              border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 15
            }}>Login</button>
          </form>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <p style={{ color: "#666" }}>Manage tutor applications and site settings.</p>
            <button onClick={() => { setAdminLoggedIn(false); setAdminPass(""); }}
              style={{ background: "#ef5350", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontWeight: 600, cursor: "pointer" }}>
              Logout
            </button>
          </div>

          {/* Pending */}
          <div style={{ marginBottom: 36 }}>
            <h3 style={{ color: "#e65100", marginBottom: 14 }}>
              ⏳ Pending Applications ({pendingTutors.length})
            </h3>
            {pendingTutors.length === 0 ? (
              <p style={{ color: "#999", fontStyle: "italic" }}>No pending applications.</p>
            ) : (
              pendingTutors.map(t => (
                <div key={t.id} style={{
                  background: "#fff3e0", borderRadius: 10, padding: "18px 20px",
                  marginBottom: 12, display: "flex", justifyContent: "space-between",
                  alignItems: "center", flexWrap: "wrap", gap: 12
                }}>
                  <div>
                    <strong style={{ color: "#004d40" }}>{t.name}</strong>
                    <span style={{ margin: "0 8px", color: "#aaa" }}>|</span>
                    <span style={{ color: "#555" }}>{t.subject} — {t.level}</span>
                    <span style={{ margin: "0 8px", color: "#aaa" }}>|</span>
                    <span style={{ color: "#888", fontSize: 13 }}>{t.experience} yrs exp.</span>
                    <p style={{ fontSize: 13, color: "#777", margin: "4px 0 0" }}>{t.bio}</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => approveTutor(t.id)}
                      style={{ padding: "8px 20px", background: "#4caf50", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => rejectTutor(t.id)}
                      style={{ padding: "8px 20px", background: "#ef5350", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Approved */}
          <div>
            <h3 style={{ color: "#2e7d32", marginBottom: 14 }}>
              ✅ Approved Tutors ({approvedTutors.length})
            </h3>
            {approvedTutors.map(t => (
              <div key={t.id} style={{
                background: "#e8f5e9", borderRadius: 10, padding: "14px 20px",
                marginBottom: 8, display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap"
              }}>
                <div>
                  <strong style={{ color: "#004d40" }}>{t.name}</strong>
                  <span style={{ margin: "0 8px", color: "#aaa" }}>|</span>
                  <span style={{ color: "#555" }}>{t.subject} — {t.level}</span>
                  <span style={{ margin: "0 8px", color: "#aaa" }}>|</span>
                  <span style={{ color: "#888", fontSize: 13 }}>{t.experience} yrs exp.</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );

  /* ── Fallback ── */
  return shell(
    <section style={{ padding: "80px 24px", textAlign: "center" }}>
      <h2 style={{ color: "#004d40" }}>Page Not Found</h2>
      <p style={{ color: "#666" }}>The page you're looking for doesn't exist.</p>
      <button onClick={goHome}
        style={{ marginTop: 16, padding: "10px 28px", background: "#009688", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
        Go Home
      </button>
    </section>
  );
}

export default App;
{
  "11+": [
    "English",
    "Maths",
    "Verbal Reasoning",
    "Non-Verbal Reasoning"
  ],
  "GCSE/IGCSE": [
    "Paper 1: Biology 1",
    "Paper 2: Biology 2",
    "Paper 3: Chemistry 1",
    "Paper 4: Chemistry 2",
    "Paper 5: Physics 1",
    "Paper 6: Physics 2"
  ],
  "A-Level": [
    "Paper 1: Love Through the Ages",
    "Paper 2: Texts in Shared Contexts",
    "Non-Exam Assessment: Independent Critical Study"
  ],
  "BTEC": [
    "Unit 1: Principles and Applications of Science I",
    "Unit 2: Practical Scientific Procedures and Techniques",
    "Unit 3: Science Investigation Skills",
    "Unit 4: Laboratory Techniques and their Application",
    "Unit 5: Principles and Applications of Science II",
    "Unit 6: Investigative Project",
    "Unit 7: Contemporary Issues in Science",
    "Unit 8: Physiology of Human Body Systems",
    "Unit 9: Human Regulation and Reproduction",
    "Unit 10: Biological Molecules and Metabolic Pathways",
    "Unit 11: Genetics and Genetic Engineering",
    "Unit 12: Diseases and Infections",
    "Unit 13: Applications of Inorganic Chemistry",
    "Unit 14: Applications of Organic Chemistry",
    "Unit 15: Electrical Circuits and their Application",
    "Unit 16: Astronomy and Space Science",
    "Unit 17: Microbiology and Microbiological Techniques",
    "Unit 18: Industrial Chemical Reactions",
    "Unit 19: Practical Chemical Analysis",
    "Unit 20: Biomedical Science",
    "Unit 21: Medical Physics Applications",
    "Unit 22: Materials Science",
    "Unit 23: Forensic Evidence, Collection and Analysis",
    "Unit 24: Cryogenics and Vacuum Technology",
    "Unit 25: Forensic Fire Investigation",
    "Unit 26: Forensic Traffic Collision Investigation"
  ],
  "T-Level": [
    "Core Biology Concepts",
    "Core Chemistry Concepts",
    "Core Physics Concepts",
    "Working in the Science Sector",
    "Good Scientific Practice",
    "Occupational Specialism: Laboratory Sciences",
    "Occupational Specialism: Food Sciences"
  ]
}
