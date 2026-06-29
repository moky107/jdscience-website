import React, { useState } from "react";
// ====== CONFIG: replace these after creating free Formspree forms ======
const FORMSPREE_BOOKING = "https://formspree.io/f/YOUR_FORM_ID";
const FORMSPREE_TUTOR = "https://formspree.io/f/YOUR_FORM_ID";
// Calendly placeholder — paste your link here later, e.g. "https://calendly.com/jdscience"
const CALENDLY_LINK = "";

// ====== SUBJECT / TOPIC DATA ======
const LEVELS = {
  "GCSE": {
    price: "£35/hr",
    subjects: ["Biology", "Chemistry", "Physics", "Combined Science", "Maths"],
  },
  "A-Level": {
    price: "£40/hr",
    subjects: ["Biology", "Chemistry", "Physics", "Maths"],
  },
  "BTEC": {
    price: "£35/hr",
    subjects: [
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
      "Unit 12: Diseases and Infection",
      "Unit 13: Applications of Inorganic Chemistry",
      "Unit 14: Applications of Organic Chemistry",
      "Unit 15: Electrical Circuits and their Applications",
      "Unit 16: Astronomy and Space Science",
      "Unit 17: Microbiology and Microbiological Techniques",
    ],
  },
  "T-Level": {
    price: "£35/hr",
    subjects: [
      "Core Biology Concepts",
      "Core Chemistry Concepts",
      "Core Physics Concepts",
      "The Science Sector (Synoptic)",
      "Occupational Specialism: Laboratory Sciences",
    ],
  },
  "11+": {
    price: "£35/hr",
    subjects: ["Maths", "English", "Verbal Reasoning", "Non-Verbal Reasoning"],
  },
};

const TEAL = "#13b3a6";
const DARK = "#0f2e35";

function App() {
  const [level, setLevel] = useState("GCSE");
  const [subject, setSubject] = useState(LEVELS["GCSE"].subjects[0]);

  const handleLevel = (e) => {
    const l = e.target.value;
    setLevel(l);
    setSubject(LEVELS[l].subjects[0]);
  };

  const wrap = { maxWidth: 1100, margin: "0 auto", padding: "0 20px" };

  return (
    <div style={{ fontFamily: "system-ui, Arial, sans-serif", color: "#1a1a1a", lineHeight: 1.5 }}>
      {/* NAV */}
      <nav style={{ background: DARK, color: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ ...wrap, display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <a href="#home" style={{ color: "#fff", fontWeight: 800, fontSize: 22, textDecoration: "none" }}>
            jd<span style={{ color: TEAL }}>science</span>
          </a>
          <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
            <a href="#resources" style={navLink}>Resources</a>
            <a href="#subjects" style={navLink}>Subjects</a>
            <a href="#booking" style={navLink}>Book a Tutor</a>
            <a href="#tutor" style={navLink}>Become a Tutor</a>
            <a href="#contact" style={navLink}>Contact</a>
            <a href="#booking" style={{ ...btnTeal, padding: "8px 16px", fontSize: 14 }}>Book Now</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header id="home" style={{ background: `linear-gradient(135deg, ${DARK}, #16424c)`, color: "#fff", padding: "70px 0" }}>
        <div style={wrap}>
          <h1 style={{ fontSize: 44, margin: 0, fontWeight: 800 }}>
            Expert Science Tutoring for <span style={{ color: TEAL }}>Every Level</span>
          </h1>
          <p style={{ fontSize: 19, maxWidth: 640, opacity: 0.9, marginTop: 16 }}>
            GCSE, A-Level, BTEC, T-Level & 11+ — Biology, Chemistry, Physics & Maths.
            Worksheets, notes, past questions and 1-to-1 online lessons.
          </p>
          <div style={{ marginTop: 26, display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a href="#booking" style={btnTeal}>Book a Tutor</a>
            <a href="#resources" style={btnOutline}>Free Resources</a>
          </div>
        </div>
      </header>

      {/* EXAM BOARD STRIP */}
      <div style={{ background: "#eef7f6", padding: "16px 0", textAlign: "center", fontWeight: 600, color: DARK }}>
        <div style={wrap}>AQA · Edexcel · OCR · Eduqas — all major exam boards covered</div>
      </div>

      {/* RESOURCES */}
      <section id="resources" style={{ ...wrap, padding: "60px 20px" }}>
        <h2 style={h2}>Free Resources</h2>
        <div style={grid3}>
          {["Worksheets", "Revision Notes", "Past Questions", "Mark Schemes"].map((r) => (
            <div key={r} style={card}>
              <h3 style={{ margin: "0 0 8px", color: DARK }}>{r}</h3>
              <p style={{ margin: 0, color: "#555" }}>Curated {r.toLowerCase()} across all levels and exam boards.</p>
              <a href="#subjects" style={{ color: TEAL, fontWeight: 600, display: "inline-block", marginTop: 10, textDecoration: "none" }}>
                Browse →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* SUBJECTS / LEVEL PICKER */}
      <section id="subjects" style={{ background: "#f6f9f9", padding: "60px 0" }}>
        <div style={wrap}>
          <h2 style={h2}>Choose Your Level & Subject</h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 10 }}>
            <select value={level} onChange={handleLevel} style={select}>
              {Object.keys(LEVELS).map((l) => <option key={l}>{l}</option>)}
            </select>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={select}>
              {LEVELS[level].subjects.map((s) => <option key={s}>{s}</option>)}
            </select>
            <span style={{ alignSelf: "center", fontWeight: 700, color: DARK }}>
              Pricing: {LEVELS[level].price}
            </span>
          </div>
          <p style={{ marginTop: 20, color: "#555" }}>
            Selected: <b>{level}</b> — <b>{subject}</b>. Resources and a matched tutor available for this combination.
          </p>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" style={{ ...wrap, padding: "60px 20px" }}>
        <h2 style={h2}>Book a Tutor</h2>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={priceCard}><b style={{ fontSize: 26, color: TEAL }}>£35/hr</b><div>GCSE · BTEC · T-Level · 11+ (all subjects)</div></div>
          <div style={priceCard}><b style={{ fontSize: 26, color: TEAL }}>£40/hr</b><div>A-Level (all subjects)</div></div>
        </div>

        {CALENDLY_LINK ? (
          <a href={CALENDLY_LINK} target="_blank" rel="noreferrer" style={btnTeal}>Pick a time on Calendly</a>
        ) : (
          <p style={{ background: "#fff7e6", border: "1px solid #ffd591", padding: "10px 14px", borderRadius: 8, color: "#7a5b00" }}>
            📅 Calendly scheduling coming soon. For now, submit the form below and we'll confirm your slot & send Microsoft Teams details by email.
          </p>
        )}

        <form action={FORMSPREE_BOOKING} method="POST" style={formBox}>
          <input name="name" placeholder="Your name" required style={input} />
          <input name="email" type="email" placeholder="Your email" required style={input} />
          <input name="phone" placeholder="Phone number" style={input} />
          <input name="level" value={level} readOnly style={input} />
          <input name="subject" value={subject} readOnly style={input} />
          <textarea name="message" placeholder="Preferred days/times & anything we should know" rows={3} style={input} />
          <button type="submit" style={btnTeal}>Request Booking</button>
        </form>
      </section>

      {/* BECOME A TUTOR */}
      <section id="tutor" style={{ background: DARK, color: "#fff", padding: "60px 0" }}>
        <div style={wrap}>
          <h2 style={{ ...h2, color: "#fff" }}>Become a Tutor</h2>
          <p style={{ opacity: 0.85, maxWidth: 640 }}>
            Submit your profile below. Our team reviews every application — once approved, you'll be added to our tutor list.
          </p>
          <form action={FORMSPREE_TUTOR} method="POST" style={{ ...formBox, background: "#16424c" }}>
            <input name="full_name" placeholder="Full name" required style={input} />
            <input name="email" type="email" placeholder="Email" required style={input} />
            <input name="phone" placeholder="Phone" style={input} />
            <input name="subjects" placeholder="Subjects & levels you teach (e.g. A-Level Chemistry, GCSE Biology)" required style={input} />
            <input name="qualifications" placeholder="Qualifications (e.g. BSc Chemistry, QTS)" required style={input} />
            <textarea name="bio" placeholder="Short bio / teaching experience" rows={4} required style={input} />
            <button type="submit" style={btnTeal}>Submit Application</button>
          </form>
        </div>
      </section>

      {/* FOOTER / CONTACT */}
      <footer id="contact" style={{ background: "#0a2228", color: "#cfe7e4", padding: "40px 0" }}>
        <div style={{ ...wrap, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>jd<span style={{ color: TEAL }}>science</span></div>
            <p style={{ maxWidth: 280, opacity: 0.8 }}>Expert science & maths tuition across GCSE, A-Level, BTEC, T-Level and 11+.</p>
          </div>
          <div>
            <h4 style={{ color: "#fff" }}>Contact</h4>
            <p>Email: <a href="mailto:info@jdscience.co.uk" style={{ color: TEAL }}>info@jdscience.co.uk</a></p>
            <p>Phone: <a href="tel:07466142805" style={{ color: TEAL }}>07466 142805</a></p>
          </div>
        </div>
        <div style={{ ...wrap, marginTop: 20, opacity: 0.6, fontSize: 13 }}>
          © {new Date().getFullYear()} jdscience.co.uk — All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// ====== STYLES ======
const navLink = { color: "#dff3f1", textDecoration: "none", fontSize: 15 };
const btnTeal = { background: TEAL, color: "#fff", padding: "12px 22px", borderRadius: 8, textDecoration: "none", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 15, display: "inline-block" };
const btnOutline = { border: "2px solid #fff", color: "#fff", padding: "12px 22px", borderRadius: 8, textDecoration: "none", fontWeight: 700 };
const h2 = { fontSize: 30, color: DARK, marginBottom: 24 };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 };
const card = { background: "#fff", border: "1px solid #e3eceb", borderRadius: 12, padding: 22, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" };
const priceCard = { background: "#eef7f6", borderRadius: 12, padding: "18px 26px", minWidth: 200 };
const select = { padding: "12px 14px", borderRadius: 8, border: "1px solid #cdd9d8", fontSize: 15, minWidth: 220, background: "#fff" };
const formBox = { display: "grid", gap: 12, maxWidth: 520, marginTop: 20 };
const input = { padding: "12px 14px", borderRadius: 8, border: "1px solid #cdd9d8", fontSize: 15, fontFamily: "inherit" };
export default App;
