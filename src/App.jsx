/* ============================================================
   jdscience.co.uk — PMT-style site, Teal Classic theme
   Vercel/Vite ready: has `App` (no ReactDOM.render).
   Paste this whole file into src/App.jsx.
   🔌 SUPABASE markers show where to wire your storage calls
   (paths unchanged → no data loss).
============================================================ */

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const ADMIN_PASSWORD = "jdscience2026"; // change to your real one

const SUBJECTS = ["Physics", "Chemistry", "Biology", "Maths"];
const LEVELS = ["GCSE", "A-Level", "T-Level"];
const BOARDS = ["AQA", "Edexcel", "OCR", "Eduqas"];
const RES_TYPES = ["Revision Notes", "Past Questions", "Mark Schemes", "Videos"];

const DEMO_PAPERS = ["Paper 1", "Paper 2", "Paper 3", "Topic Questions", "Mark Schemes"];

/* ---------- Mobile detection hook ---------- */
function useIsMobile(bp = 768) {
  const [m, setM] = useState(
    typeof window !== "undefined" ? window.innerWidth <= bp : false
  );
  useEffect(() => {
    const r = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [bp]);
  return m;
}

/* ========================= NAVBAR ========================= */
function Navbar({ onNav, onSearch, isAdmin, setIsAdmin }) {
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAdmin = () => {
    if (isAdmin) { setIsAdmin(false); return; }
    const pw = window.prompt("Admin password:");
    if (pw === ADMIN_PASSWORD) { setIsAdmin(true); alert("Admin enabled"); }
    else if (pw) alert("Wrong password");
  };

  const menu = [
    { label: "Home", action: () => onNav("home") },
    { label: "Past Papers", action: () => onNav("papers") },
    { label: "Resources", options: RES_TYPES },
    { label: "Find a Tutor", action: () => onNav("book") },
    { label: "Contact", action: () => onNav("contact") },
  ];

  const submit = (e) => { e.preventDefault(); onSearch(q); setMenuOpen(false); };

  const logo = (
    <div onClick={() => onNav("home")}
      style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
      <div style={{ fontWeight: 800, color: "#0f172a" }}>jdscience.co.uk</div>
    </div>
  );

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000, background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", gap: 12 }}>
        {logo}
        {!isMobile && (
          <form onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input placeholder="Search subjects or topics..." value={q} onChange={(e) => setQ(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", width: 220 }} />
            <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer" }}>Search</button>
            <button type="button" onClick={handleAdmin}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: isAdmin ? "#10b981" : "#fff", color: isAdmin ? "#fff" : "#111", cursor: "pointer" }}>Admin</button>
          </form>
        )}
        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} aria-label="Menu"
            style={{ fontSize: 26, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </div>

      {!isMobile && (
        <nav style={{ display: "flex", gap: 6, padding: "8px 18px", background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
          {menu.map((it, i) => (
            <div key={it.label} style={{ position: "relative" }}
              onMouseEnter={() => setOpenIdx(i)} onMouseLeave={() => setOpenIdx(null)}>
              <button onClick={() => it.action ? it.action() : onNav("papers")}
                style={{ background: "transparent", border: "none", padding: "8px 12px", cursor: "pointer", fontWeight: 700, color: "#0f172a" }}>
                {it.label}{it.options ? " ▾" : ""}
              </button>
              {it.options && openIdx === i && (
                <div style={{ position: "absolute", top: "100%", left: 0, minWidth: 190, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", borderRadius: 8, overflow: "hidden" }}>
                  {it.options.map(opt => (
                    <div key={opt} onClick={() => onNav("papers")}
                      style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #f3f4f6" }}>{opt}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}

      {isMobile && menuOpen && (
        <nav style={{ background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)", padding: "8px 0" }}>
          {menu.map(it => (
            <div key={it.label}>
              <button onClick={() => { it.action ? it.action() : onNav("papers"); setMenuOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "12px 18px", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>
                {it.label}
              </button>
              {it.options && it.options.map(opt => (
                <button key={opt} onClick={() => { onNav("papers"); setMenuOpen(false); }}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "8px 34px", cursor: "pointer", color: "#0e7490", fontSize: 14 }}>
                  • {opt}
                </button>
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
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: isAdmin ? "#10b981" : "#fff", color: isAdmin ? "#fff" : "#111" }}>
              {isAdmin ? "Admin: ON" : "Admin"}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

/* ========================= HERO ========================= */
function Hero({ onNav }) {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, color: "#fff", padding: isMobile ? "32px 16px" : "52px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 420px", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,.12)", padding: "6px 12px", borderRadius: 20, marginBottom: 12, fontSize: 13 }}>🏆 Expert Science & Maths Tutoring</div>
          <h1 style={{ fontSize: isMobile ? 26 : 36, margin: "12px 0", lineHeight: 1.12 }}>
            Learn <span style={{ color: "#80cbc4" }}>Smarter</span>. Revise <span style={{ color: "#2dd4bf" }}>Better</span>. Achieve <span style={{ color: "#fbbf24" }}>More</span>.
          </h1>
          <p style={{ color: "rgba(255,255,255,.9)", maxWidth: 600 }}>
            Free past papers, revision notes and mark schemes organised by subject, level and exam board — plus 1-to-1 tutoring.
          </p>
          <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => onNav("papers")} style={{ padding: "11px 18px", borderRadius: 8, border: "none", background: "#fff", color: TEAL_DARK, cursor: "pointer", fontWeight: 700 }}>Browse Past Papers</button>
            <button onClick={() => onNav("book")} style={{ padding: "11px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,.5)", background: "transparent", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Book a Tutor</button>
          </div>
        </div>
        <div style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 16px 48px rgba(0,0,0,.4)", order: isMobile ? -1 : 0 }}>
          <img src="https://placehold.co/420x300/004d40/ffffff?text=jdscience" alt="hero" style={{ width: "100%", display: "block" }} />
        </div>
      </div>
    </section>
  );
}

/* ============== EXAM BOARD STRIP ============== */
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

/* ========================= SUBJECT CARDS (home) ========================= */
function SubjectCards({ onPick }) {
  const isMobile = useIsMobile();
  const colors = { Physics: "#0ea5e9", Chemistry: "#f59e0b", Biology: "#22c55e", Maths: "#8b5cf6" };
  const icons = { Physics: "⚛️", Chemistry: "🧪", Biology: "🧬", Maths: "📐" };
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#0f172a", fontSize: 28 }}>Choose Your Subject</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: 4 }}>GCSE · A-Level · T-Level resources for every exam board</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginTop: 26 }}>
          {SUBJECTS.map(s => (
            <div key={s} onClick={() => onPick(s)}
              style={{ background: "#fff", borderRadius: 14, padding: 22, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.06)", borderTop: `4px solid ${colors[s]}`, transition: "transform .15s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}>
              <div style={{ fontSize: 34 }}>{icons[s]}</div>
              <h3 style={{ margin: "10px 0 4px", color: "#0f172a" }}>{s}</h3>
              <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Past papers, notes & mark schemes</p>
              <div style={{ marginTop: 12, color: colors[s], fontWeight: 700, fontSize: 14 }}>View resources →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================= PMT-STYLE PAST PAPERS PAGE ========================= */
function PastPapers({ subject, isAdmin }) {
  const isMobile = useIsMobile();
  const [activeSubject, setActiveSubject] = useState(subject || "Physics");
  const [activeLevel, setActiveLevel] = useState("GCSE");

  useEffect(() => { if (subject) setActiveSubject(subject); }, [subject]);

  // 🔌 SUPABASE: replace DEMO_PAPERS with a listing of files from
  // bucket `resources` at path `PastQuestions/${activeSubject}/${board}/${activeLevel}`
  const getPapers = (board) => DEMO_PAPERS;
  const openPaper = (board, paper) => {
    // 🔌 SUPABASE: getPublicUrl(...) then window.open(url)
    alert(`Open: ${activeSubject} ${activeLevel} ${board} — ${paper}`);
  };

  return (
    <section style={{ padding: isMobile ? "20px 14px" : "28px 20px", background: "#f8fafc", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 10 }}>Home › Past Papers › {activeSubject}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,.06)", marginBottom: 22, flexWrap: "wrap" }}>
          <img src="https://placehold.co/80x80/009688/ffffff?text=JD" alt="tutor" style={{ width: 70, height: 70, borderRadius: "50%" }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Need help with {activeSubject}?</div>
            <div style={{ color: "#64748b", fontSize: 14 }}>1-to-1 tutoring with an experienced specialist · ✓ Qualified Teacher · ⭐ 5.0</div>
          </div>
          <button style={{ padding: "10px 18px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>Book Tutor</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {SUBJECTS.map(s => (
            <button key={s} onClick={() => setActiveSubject(s)}
              style={{ padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, background: activeSubject === s ? TEAL : "#e2e8f0", color: activeSubject === s ? "#fff" : "#334155" }}>{s}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setActiveLevel(l)}
              style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${activeLevel === l ? TEAL : "#cbd5e1"}`, cursor: "pointer", fontWeight: 600, background: activeLevel === l ? "#ecfeff" : "#fff", color: activeLevel === l ? TEAL_DARK : "#475569" }}>{l}</button>
          ))}
        </div>

        <h2 style={{ color: "#0f172a", marginBottom: 16 }}>{activeLevel} {activeSubject} — Past Papers by Exam Board</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18 }}>
          {BOARDS.map(board => (
            <div key={board} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,.06)" }}>
              <div style={{ background: TEAL_DARK, color: "#fff", padding: "12px 14px", fontWeight: 800 }}>{board}</div>
              <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                {getPapers(board).map(p => (
                  <button key={p} onClick={() => openPaper(board, p)}
                    style={{ textAlign: "left", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 14, color: "#0f172a" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#ecfeff"; e.currentTarget.style.borderColor = TEAL; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
                    📄 {p}
                  </button>
                ))}
                {isAdmin && (
                  <button onClick={() => alert(`Upload to ${activeSubject}/${board}/${activeLevel}`)}
                    style={{ padding: "9px 12px", borderRadius: 8, border: `1px dashed ${TEAL}`, background: "#fff", color: TEAL, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                    + Upload file
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================= BOOKING ========================= */
function Booking() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ name: "", email: "", subject: "Physics", level: "GCSE", message: "" });
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = (e) => { e.preventDefault(); setSent(true); /* 🔌 wire email/Supabase here */ };

  return (
    <section style={{ background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, padding: isMobile ? "32px 16px" : "48px 20px", color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 28, alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 28, marginTop: 0 }}>Book a Tutoring Session</h2>
          <p style={{ color: "rgba(255,255,255,.9)" }}>Personalised 1-to-1 lessons in Physics, Chemistry, Biology and Maths. Tell us what you need and we'll get back to you.</p>
          <ul style={{ lineHeight: 1.9, paddingLeft: 18 }}>
            <li>✓ Experienced, qualified tutors</li>
            <li>✓ All exam boards covered</li>
            <li>✓ Flexible online sessions</li>
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
              <textarea placeholder="What would you like help with?" value={form.message} onChange={e => set("message", e.target.value)} rows={3} style={inp} />
              <button type="submit" style={{ padding: "12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 800 }}>Request Session</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
const inp = { padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, width: "100%", boxSizing: "border-box" };

/* ========================= CONTACT + FOOTER ========================= */
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
          <p style={{ fontSize: 14, marginTop: 8 }}>Free science & maths resources and expert tutoring for GCSE, A-Level and T-Level.</p>
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

/* ========================= ROOT APP ========================= */
function App() {
  const [page, setPage] = useState("home");
  const [pickedSubject, setPickedSubject] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const goTo = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNav = (target) => {
    if (target === "contact") {
      if (page !== "home") { setPage("home"); setTimeout(() => document.getElementById("contact-anchor")?.scrollIntoView({ behavior: "smooth" }), 50); }
      else document.getElementById("contact-anchor")?.scrollIntoView({ behavior: "smooth" });
    } else if (target === "book") {
      if (page !== "home") { setPage("home"); setTimeout(() => document.getElementById("book-anchor")?.scrollIntoView({ behavior: "smooth" }), 50); }
      else document.getElementById("book-anchor")?.scrollIntoView({ behavior: "smooth" });
    } else goTo(target);
  };

  const pickSubject = (s) => { setPickedSubject(s); goTo("papers"); };

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#0f172a", background: "#f8fafc" }}>
      <Navbar onNav={handleNav} onSearch={(q) => q && goTo("papers")} isAdmin={isAdmin} setIsAdmin={setIsAdmin} />

      {page === "home" && (
        <main>
          <Hero onNav={handleNav} />
          <BoardStrip />
          <SubjectCards onPick={pickSubject} />
          <div id="book-anchor"><Booking /></div>
          <div id="contact-anchor"><Contact /></div>
        </main>
      )}

      {page === "papers" && (
        <main>
          <PastPapers subject={pickedSubject} isAdmin={isAdmin} />
        </main>
      )}

      <Footer />
    </div>
  );
}

export default App;
