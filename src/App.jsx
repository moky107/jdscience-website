import React, { useEffect, useState } from "react";

const ADMIN_PASSWORD = "jdscience2026";
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/REPLACE_WITH_YOUR_STRIPE_LINK";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

const LEVELS = ["11+", "GCSE/IGCSE", "A-Level", "T-Level", "BTEC"];

const LEVEL_SUBJECTS = {
  "11+": ["Maths", "English", "Verbal Reasoning", "Non-Verbal Reasoning"],
  "GCSE/IGCSE": ["Physics", "Chemistry", "Biology", "Combined Science", "Maths"],
  "A-Level": ["Physics", "Chemistry", "Biology", "Maths"],
  "T-Level": ["Core Science", "Laboratory Sciences", "The Science Sector"],
  BTEC: [
    "Unit 1: Principles & Applications of Science I",
    "Unit 2: Practical Scientific Procedures",
    "Unit 3: Science Investigation Skills",
    "Unit 8: Physiology of Human Body Systems",
  ],
};

const LEVEL_BOARDS = {
  "11+": ["GL Assessment", "CEM"],
  "GCSE/IGCSE": ["AQA", "Edexcel", "OCR", "Eduqas"],
  "A-Level": ["AQA", "Edexcel", "OCR"],
  "T-Level": ["NCFE"],
  BTEC: ["Pearson"],
};

const RESOURCE_TYPES = ["Revision Notes", "Worksheets", "Past Questions", "Mark Schemes", "Videos"];

const starterResources = [
  {
    id: 1,
    level: "GCSE/IGCSE",
    subject: "Chemistry",
    board: "AQA",
    type: "Revision Notes",
    topic: "Atomic Structure",
    url: "/resources/gcse/chemistry/aqa/revision-notes.pdf",
  },
  {
    id: 2,
    level: "GCSE/IGCSE",
    subject: "Chemistry",
    board: "AQA",
    type: "Worksheets",
    topic: "Atomic Structure",
    url: "/resources/gcse/chemistry/aqa/worksheets.pdf",
  },
  {
    id: 3,
    level: "GCSE/IGCSE",
    subject: "Chemistry",
    board: "AQA",
    type: "Past Questions",
    topic: "Atomic Structure",
    url: "/resources/gcse/chemistry/aqa/past-questions.pdf",
  },
  {
    id: 4,
    level: "GCSE/IGCSE",
    subject: "Chemistry",
    board: "AQA",
    type: "Mark Schemes",
    topic: "Atomic Structure",
    url: "/resources/gcse/chemistry/aqa/mark-schemes.pdf",
  },
];

function getSaved(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function setSaved(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 760);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return mobile;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [resources, setResources] = useState(starterResources);
  const [tutors, setTutors] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setResources(getSaved("jd_resources", starterResources));
    setTutors(getSaved("jd_tutors", []));
    setBookings(getSaved("jd_bookings", []));
    setIsAdmin(sessionStorage.getItem("jd_admin") === "yes");
  }, []);

  const navigate = (target) => {
    setPage(target);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const adminLogin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      sessionStorage.removeItem("jd_admin");
      return;
    }

    const password = window.prompt("Enter admin password");

    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem("jd_admin", "yes");
    } else if (password) {
      alert("Incorrect password");
    }
  };

  return (
    <div style={styles.site}>
      <Navbar
        page={page}
        navigate={navigate}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        isAdmin={isAdmin}
        adminLogin={adminLogin}
      />

      {page === "home" && <Home navigate={navigate} tutors={tutors} />}
      {page === "resources" && <Resources resources={resources} />}
      {page === "booking" && (
        <Booking bookings={bookings} setBookings={setBookings} tutors={tutors} />
      )}
      {page === "tutors" && <Tutors tutors={tutors} />}
      {page === "becomeTutor" && <BecomeTutor tutors={tutors} setTutors={setTutors} />}
      {page === "admin" && (
        <Admin
          isAdmin={isAdmin}
          adminLogin={adminLogin}
          resources={resources}
          setResources={setResources}
          tutors={tutors}
          setTutors={setTutors}
          bookings={bookings}
        />
      )}

      <Footer />
    </div>
  );
}

function Navbar({ page, navigate, menuOpen, setMenuOpen, isAdmin, adminLogin }) {
  const mobile = useIsMobile();

  const links = [
    ["home", "Home"],
    ["resources", "Resources"],
    ["booking", "Book a Session"],
    ["tutors", "Tutors"],
    ["becomeTutor", ],
    ["admin", "Admin"],
  ];

  return (
    <header style={styles.navbar}>
      <div style={styles.navInner}>
        <button onClick={() => navigate("home")} style={styles.brand}>
          <span style={styles.logo}>JD</span>
          <span>
            <strong>JD Science</strong>
            <small style={styles.small}>Science and Maths Tutoring</small>
          </span>
        </button>

        {mobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={styles.menuButton}>
            {menuOpen ? "✕" : "☰"}
          </button>
        )}

        {(!mobile || menuOpen) && (
          <nav style={mobile ? styles.mobileNav : styles.desktopNav}>
            {links.map(([key, label]) => (
              <button
                key={key}
                onClick={() => navigate(key)}
                style={{
                  ...styles.navLink,
                  ...(page === key ? styles.activeNav : {}),
                }}
              >
                {label}
              </button>
            ))}

            <button onClick={adminLogin} style={styles.adminButton}>
              {isAdmin ? "Admin ✓" : "Login"}
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

function Home({ navigate, tutors }) {
  const approvedTutors = tutors.filter((t) => t.status === "approved");

  return (
    <main>
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.badge}>Expert Science and Maths Tutoring</p>
          <h1 style={styles.heroTitle}>Learn Smarter. Revise Better. Achieve More.</h1>
          <p style={styles.heroText}>
            Organised science and maths resources by level, subject, exam board and specification,
            with tutoring support for learners.
          </p>

          <div style={styles.heroActions}>
            <button onClick={() => navigate("resources")} style={styles.primary}>Browse Resources</button>
            <button onClick={() => navigate("booking")} style={styles.secondary}>Book a Session</button>
            <button onClick={() => navigate("becomeTutor")} style={styles.goldButton}>Become a Tutor</button>
          </div>
        </div>
      </section>

      <section style={styles.page}>
        <h2>What JD Science Offers</h2>

        <div style={styles.cardGrid}>
          <Card title="Resources" text="Revision notes, worksheets, past questions, mark schemes and videos." />
          <Card title="Tutoring" text="Book support for GCSE, IGCSE, A-Level, BTEC and T-Level." />
          <Card title="Tutor Profiles" text="Approved tutors appear live after admin approval." />
          <Card title="Admin Control" text="Admin can add resources, approve tutors and view bookings." />
        </div>

        <h2 style={{ marginTop: 45 }}>Available Tutors</h2>

        {approvedTutors.length === 0 ? (
          <p style={styles.empty}>Approved tutor profiles will appear here.</p>
        ) : (
          <div style={styles.cardGrid}>
            {approvedTutors.map((tutor) => (
              <Card
                key={tutor.id}
                title={tutor.name}
                text={`${tutor.subjects} | ${tutor.levels}`}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function Resources({ resources }) {
  const [level, setLevel] = useState("GCSE/IGCSE");
  const [subject, setSubject] = useState("Chemistry");
  const [board, setBoard] = useState("AQA");
  const [type, setType] = useState("Revision Notes");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const subjects = LEVEL_SUBJECTS[level] || [];
    if (!subjects.includes(subject)) {
      setSubject(subjects[0] || "");
    }
  }, [level, subject]);

  const filtered = resources.filter((r) => {
    return (
      r.level === level &&
      r.subject === subject &&
      r.board === board &&
      r.type === type &&
      `${r.topic} ${r.type}`.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <main style={styles.page}>
      <h1>Resources</h1>
      <p style={styles.muted}>
        Browse by level, subject, exam board, specification topic and resource type.
      </p>

      <div style={styles.filterGrid}>
        <Select label="Level" value={level} setValue={setLevel} options={LEVELS} />
        <Select label="Subject" value={subject} setValue={setSubject} options={LEVEL_SUBJECTS[level] || []} />
        <Select label="Exam Board" value={board} setValue={setBoard} options={LEVEL_BOARDS[level] || []} />
        <Select label="Resource Type" value={type} setValue={setType} options={RESOURCE_TYPES} />

        <div>
          <label style={styles.label}>Search Topic</label>
          <input
            style={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Atomic Structure"
          />
        </div>
      </div>

      <div style={styles.resourceList}>
        {filtered.length === 0 ? (
          <p style={styles.empty}>No resources uploaded yet for this selection.</p>
        ) : (
          filtered.map((r) => (
            <div key={r.id} style={styles.resourceItem}>
              <div>
                <strong>{r.topic}</strong>
                <p style={styles.muted}>
                  {r.level} | {r.subject} | {r.board} | {r.type}
                </p>
              </div>
              <a href={r.url} download style={styles.download}>
                Download
              </a>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

function Booking({ bookings, setBookings, tutors }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    level: "GCSE/IGCSE",
    subject: "Chemistry",
    tutor: "",
    message: "",
  });

  const approvedTutors = tutors.filter((t) => t.status === "approved");

  const update = (key, value) => setForm({ ...form, [key]: value });

  const submit = () => {
    if (!form.name || !form.email) {
      alert("Please enter your name and email.");
      return;
    }

    const newBooking = {
      ...form,
      id: Date.now(),
      status: "pending payment",
      date: new Date().toLocaleString(),
    };

    const updated = [...bookings, newBooking];
    setBookings(updated);
    setSaved("jd_bookings", updated);

    window.location.href = STRIPE_PAYMENT_LINK;
  };

  return (
    <main style={styles.page}>
      <h1>Book a Tutoring Session</h1>
      <p style={styles.muted}>
        Complete the form and continue to payment. Replace the Stripe payment link in the code.
      </p>

      <div style={styles.form}>
        <input style={styles.input} placeholder="Learner name" value={form.name} onChange={(e) => update("name", e.target.value)} />
        <input style={styles.input} placeholder="Email address" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />

        <Select label="Level" value={form.level} setValue={(v) => update("level", v)} options={LEVELS} />
        <Select label="Subject" value={form.subject} setValue={(v) => update("subject", v)} options={LEVEL_SUBJECTS[form.level] || []} />

        <label style={styles.label}>Choose Tutor</label>
        <select style={styles.input} value={form.tutor} onChange={(e) => update("tutor", e.target.value)}>
          <option value="">Any available tutor</option>
          {approvedTutors.map((t) => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>

        <textarea style={styles.textarea} placeholder="What support do you need?" value={form.message} onChange={(e) => update("message", e.target.value)} />

        <button onClick={submit} style={styles.primary}>Continue to Payment</button>
      </div>
    </main>
  );
}

function Tutors({ tutors }) {
  const approvedTutors = tutors.filter((t) => t.status === "approved");

  return (
    <main style={styles.page}>
      <h1>Our Tutors</h1>

      {approvedTutors.length === 0 ? (
        <p style={styles.empty}>No approved tutors are live yet.</p>
      ) : (
        <div style={styles.cardGrid}>
          {approvedTutors.map((t) => (
            <Card
              key={t.id}
              title={t.name}
              text={`${t.subjects}. Levels: ${t.levels}. ${t.bio}`}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function BecomeTutor({ tutors, setTutors }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subjects: "",
    levels: "",
    qualifications: "",
    bio: "",
  });

  const update = (key, value) => setForm({ ...form, [key]: value });

  const submit = () => {
    if (!form.name || !form.email || !form.subjects) {
      alert("Please complete name, email and subjects.");
      return;
    }

    const application = {
      ...form,
      id: Date.now(),
      status: "pending",
      date: new Date().toLocaleString(),
    };

    const updated = [...tutors, application];
    setTutors(updated);
    setSaved("jd_tutors", updated);

    alert("Application submitted. Admin will review it before it goes live.");

    setForm({
      name: "",
      email: "",
      phone: "",
      subjects: "",
      levels: "",
      qualifications: "",
      bio: "",
    });
  };

  return (
    <main style={styles.page}>
      <h1>Become a Tutor</h1>
      <p style={styles.muted}>
        Fill in the form below. Your profile will only appear after admin approval.
      </p>

      <div style={styles.form}>
        <input style={styles.input} placeholder="Full name" value={form.name} onChange={(e) => update("name", e.target.value)} />
        <input style={styles.input} placeholder="Email address" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        <input style={styles.input} placeholder="Phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        <input style={styles.input} placeholder="Subjects you teach" value={form.subjects} onChange={(e) => update("subjects", e.target.value)} />
        <input style={styles.input} placeholder="Levels you teach" value={form.levels} onChange={(e) => update("levels", e.target.value)} />
        <input style={styles.input} placeholder="Qualifications" value={form.qualifications} onChange={(e) => update("qualifications", e.target.value)} />
        <textarea style={styles.textarea} placeholder="Short biography and teaching experience" value={form.bio} onChange={(e) => update("bio", e.target.value)} />

        <button onClick={submit} style={styles.primary}>Submit Application</button>
      </div>
    </main>
  );
}

function Admin({ isAdmin, adminLogin, resources, setResources, tutors, setTutors, bookings }) {
  const [resourceForm, setResourceForm] = useState({
    level: "GCSE/IGCSE",
    subject: "Chemistry",
    board: "AQA",
    type: "Revision Notes",
    topic: "",
    url: "",
  });

  const updateResource = (key, value) => {
    setResourceForm({ ...resourceForm, [key]: value });
  };

  const addResource = () => {
    if (!resourceForm.topic || !resourceForm.url) {
      alert("Add both topic and file URL.");
      return;
    }

    const newResource = {
      ...resourceForm,
      id: Date.now(),
    };

    const updated = [...resources, newResource];
    setResources(updated);
    setSaved("jd_resources", updated);

    alert("Resource added.");
    setResourceForm({ ...resourceForm, topic: "", url: "" });
  };

  const approveTutor = (id) => {
    const updated = tutors.map((t) =>
      t.id === id ? { ...t, status: "approved" } : t
    );
    setTutors(updated);
    setSaved("jd_tutors", updated);
  };

  const deleteTutor = (id) => {
    const updated = tutors.filter((t) => t.id !== id);
    setTutors(updated);
    setSaved("jd_tutors", updated);
  };

  if (!isAdmin) {
    return (
      <main style={styles.page}>
        <h1>Admin Login</h1>
        <p style={styles.muted}>Login to manage resources, tutors and bookings.</p>
        <button onClick={adminLogin} style={styles.primary}>Login</button>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <h1>Admin Dashboard</h1>

      <section style={styles.panel}>
        <h2>Add Resource</h2>

        <div style={styles.filterGrid}>
          <Select label="Level" value={resourceForm.level} setValue={(v) => updateResource("level", v)} options={LEVELS} />
          <Select label="Subject" value={resourceForm.subject} setValue={(v) => updateResource("subject", v)} options={LEVEL_SUBJECTS[resourceForm.level] || []} />
          <Select label="Board" value={resourceForm.board} setValue={(v) => updateResource("board", v)} options={LEVEL_BOARDS[resourceForm.level] || []} />
          <Select label="Type" value={resourceForm.type} setValue={(v) => updateResource("type", v)} options={RESOURCE_TYPES} />

          <div>
            <label style={styles.label}>Specification Topic</label>
            <input style={styles.input} value={resourceForm.topic} onChange={(e) => updateResource("topic", e.target.value)} placeholder="e.g. Atomic Structure" />
          </div>

          <div>
            <label style={styles.label}>File URL</label>
            <input style={styles.input} value={resourceForm.url} onChange={(e) => updateResource("url", e.target.value)} placeholder="/resources/file.pdf" />
          </div>
        </div>

        <button onClick={addResource} style={styles.primary}>Add Resource</button>
      </section>

      <section style={styles.panel}>
        <h2>Tutor Applications</h2>

        {tutors.length === 0 ? (
          <p style={styles.empty}>No tutor applications yet.</p>
        ) : (
          tutors.map((t) => (
            <div key={t.id} style={styles.resourceItem}>
              <div>
                <strong>{t.name}</strong>
                <p style={styles.muted}>{t.email} | {t.subjects} | {t.levels} | {t.status}</p>
              </div>

              <div>
                {t.status !== "approved" && (
                  <button onClick={() => approveTutor(t.id)} style={styles.smallButton}>Approve</button>
                )}
                <button onClick={() => deleteTutor(t.id)} style={styles.deleteButton}>Delete</button>
              </div>
            </div>
          ))
        )}
      </section>

      <section style={styles.panel}>
        <h2>Bookings</h2>

        {bookings.length === 0 ? (
          <p style={styles.empty}>No bookings yet.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.id} style={styles.resourceItem}>
              <div>
                <strong>{b.name}</strong>
                <p style={styles.muted}>{b.email} | {b.level} | {b.subject} | {b.status}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

function Select({ label, value, setValue, options }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <select style={styles.input} value={value} onChange={(e) => setValue(e.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p style={styles.muted}>{text}</p>
    </div>
  );
}

function Footer() {
  return (
    <footer style={styles.footer}>
      <h3>JD Science</h3>
      <p>Science and Maths Tutoring</p>
      <p>info@jdscience.co.uk</p>
    </footer>
  );
}

const styles = {
  site: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
  },
  navInner: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brand: {
    background: "none",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    textAlign: "left",
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: TEAL,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },
  small: {
    display: "block",
    fontSize: 12,
    color: "#64748b",
  },
  desktopNav: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  mobileNav: {
    position: "absolute",
    top: 70,
    left: 0,
    right: 0,
    background: "#fff",
    padding: 16,
    display: "grid",
    gap: 8,
    borderBottom: "1px solid #e5e7eb",
  },
  menuButton: {
    background: TEAL,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 20,
    cursor: "pointer",
  },
  navLink: {
    background: "#f1f5f9",
    border: "none",
    padding: "10px 13px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 700,
    textAlign: "left",
  },
  activeNav: {
    background: TEAL_DARK,
    color: "#fff",
  },
  adminButton: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "10px 13px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 800,
  },
  hero: {
    background: `linear-gradient(135deg, ${TEAL_DARK}, ${TEAL})`,
    color: "#fff",
    padding: "85px 20px",
  },
  heroInner: {
    maxWidth: 1180,
    margin: "0 auto",
  },
  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.15)",
    padding: "8px 14px",
    borderRadius: 999,
    fontWeight: 700,
  },
  heroTitle: {
    fontSize: "clamp(36px, 7vw, 64px)",
    maxWidth: 820,
    lineHeight: 1.05,
    margin: "18px 0",
  },
  heroText: {
    maxWidth: 760,
    fontSize: 18,
    lineHeight: 1.7,
  },
  heroActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 28,
  },
  primary: {
    background: TEAL_DARK,
    color: "#fff",
    border: "none",
    padding: "13px 18px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    textDecoration: "none",
  },
  secondary: {
    background: "#fff",
    color: TEAL_DARK,
    border: "none",
    padding: "13px 18px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  goldButton: {
    background: "#fbbf24",
    color: "#0f172a",
    border: "none",
    padding: "13px 18px",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  page: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "55px 20px",
  },
  muted: {
    color: "#64748b",
    lineHeight: 1.6,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 18,
    marginTop: 22,
  },
  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 14,
    margin: "25px 0",
  },
  label: {
    display: "block",
    fontWeight: 800,
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: 13,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    font: "inherit",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    padding: 13,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
    font: "inherit",
    boxSizing: "border-box",
  },
  resourceList: {
    display: "grid",
    gap: 12,
    marginTop: 24,
  },
  resourceItem: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
  },
  download: {
    background: TEAL,
    color: "#fff",
    padding: "11px 16px",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 800,
  },
  empty: {
    background: "#fff",
    border: "1px dashed #cbd5e1",
    padding: 20,
    borderRadius: 16,
    color: "#64748b",
  },
  form: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 24,
    maxWidth: 700,
    display: "grid",
    gap: 14,
    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
  },
  panel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 24,
    marginTop: 24,
    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
  },
  smallButton: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "9px 12px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
    marginRight: 8,
  },
  deleteButton: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "9px 12px",
    borderRadius: 10,
    fontWeight: 800,
    cursor: "pointer",
  },
  footer: {
    background: "#0f172a",
    color: "#fff",
    textAlign: "center",
    padding: "38px 20px",
  },
};
