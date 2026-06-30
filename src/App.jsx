import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const ADMIN_EMAILS = ["jd943791@gmail.com"];
const BUCKET = "resources";

const LEVELS = ["GCSE/IGCSE", "A-Level", "BTEC", "T-Level", "11+"];
const SUBJECTS = {
  "GCSE/IGCSE": ["Chemistry", "Physics", "Biology", "Maths", "Combined Science"],
  "A-Level": ["Chemistry", "Physics", "Biology", "Maths"],
  BTEC: ["Applied Science", "Unit 1", "Unit 2", "Unit 3", "Unit 8"],
  "T-Level": ["Science", "Laboratory Science"],
  "11+": ["Maths", "English", "Verbal Reasoning", "Non-Verbal Reasoning"],
};
const BOARDS = {
  "GCSE/IGCSE": ["AQA", "Edexcel", "OCR", "Eduqas"],
  "A-Level": ["AQA", "Edexcel", "OCR"],
  BTEC: ["Pearson"],
  "T-Level": ["NCFE"],
  "11+": ["GL Assessment", "CEM"],
};

const LEARNING_CATEGORIES = ["Revision Notes", "How Questions Are Framed"];
const ASSESSMENT_CATEGORIES = ["Past Questions", "Mark Schemes", "Examiner Reports"];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function App() {
  const [page, setPage] = useState("home");
  const [session, setSession] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email);

  useEffect(() => {
    loadResources();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadResources() {
    setLoading(true);
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("published", true)
      .order("topic_order", { ascending: true })
      .order("title", { ascending: true });

    if (!error) setResources(data || []);
    setLoading(false);
  }

  function go(target) {
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  return (
    <div style={styles.site}>
      <Navbar
        page={page}
        go={go}
        session={session}
        isAdmin={isAdmin}
        logout={logout}
        openAuth={() => setAuthOpen(true)}
      />

      {page === "home" && <Home go={go} />}
      {page === "resources" && <Resources resources={resources} loading={loading} />}
      {page === "pastpapers" && <PastPapers resources={resources} loading={loading} />}
      {page === "admin" && (
        <Admin
          session={session}
          isAdmin={isAdmin}
          openAuth={() => setAuthOpen(true)}
          reload={loadResources}
        />
      )}

      {authOpen && <AuthModal close={() => setAuthOpen(false)} />}

      <footer style={styles.footer}>
        <strong>JD Science</strong>
        <p>Science and Maths Tutoring</p>
      </footer>
    </div>
  );
}

function Navbar({ page, go, session, isAdmin, logout, openAuth }) {
  return (
    <header style={styles.navbar}>
      <button onClick={() => go("home")} style={styles.brand}>
        <span style={styles.logo}>JD</span>
        <span>
          <strong>JD Science</strong>
          <small>Science and Maths Tutoring</small>
        </span>
      </button>

      <nav style={styles.nav}>
        <button onClick={() => go("home")} style={page === "home" ? styles.active : styles.navBtn}>Home</button>
        <button onClick={() => go("resources")} style={page === "resources" ? styles.active : styles.navBtn}>Resources</button>
        <button onClick={() => go("pastpapers")} style={page === "pastpapers" ? styles.active : styles.navBtn}>Past Papers</button>
        <button onClick={() => go("admin")} style={page === "admin" ? styles.active : styles.navBtn}>Admin</button>

        {session ? (
          <button onClick={logout} style={styles.darkBtn}>
            {isAdmin ? "Admin ✓" : "Logout"}
          </button>
        ) : (
          <button onClick={openAuth} style={styles.darkBtn}>Register / Login</button>
        )}
      </nav>
    </header>
  );
}

function Home({ go }) {
  return (
    <main>
      <section style={styles.hero}>
        <div style={styles.heroOverlay}>
          <div style={styles.heroText}>
            <h1>Learn Smarter. Revise Better. Achieve More.</h1>
            <p>
              Organised science and maths resources by level, subject, exam board and
              specification, with tutoring support for learners.
            </p>
            <div style={styles.heroActions}>
              <button onClick={() => go("resources")} style={styles.primary}>Explore Resources</button>
              <button onClick={() => go("pastpapers")} style={styles.outline}>View Past Papers</button>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.cards}>
        <Card title="Quality Resources" text="Revision notes, PowerPoints and learning guides." />
        <Card title="Past Papers" text="Questions, mark schemes and examiner reports." />
        <Card title="Expert Tutors" text="Qualified tutors supporting learners." />
        <Card title="Worldwide Access" text="Accessible on mobile, tablet and laptop." />
      </section>
    </main>
  );
}

function Resources({ resources, loading }) {
  return (
    <ResourceBrowser
      title="Resources"
      subtitle="Revision Notes and How Questions Are Framed notes."
      categories={LEARNING_CATEGORIES}
      resources={resources}
      loading={loading}
    />
  );
}

function PastPapers({ resources, loading }) {
  return (
    <ResourceBrowser
      title="Past Papers"
      subtitle="Past questions, mark schemes and examiner reports."
      categories={ASSESSMENT_CATEGORIES}
      resources={resources}
      loading={loading}
    />
  );
}

function ResourceBrowser({ title, subtitle, categories, resources, loading }) {
  const [level, setLevel] = useState("GCSE/IGCSE");
  const [subject, setSubject] = useState("Chemistry");
  const [board, setBoard] = useState("AQA");
  const [category, setCategory] = useState(categories[0]);

  const filtered = useMemo(() => {
    return resources.filter(
      (r) =>
        r.level === level &&
        r.subject === subject &&
        r.exam_board === board &&
        categories.includes(r.resource_category)
    );
  }, [resources, level, subject, board, categories]);

  const categoryItems = filtered.filter((r) => r.resource_category === category);

  return (
    <main style={styles.page}>
      <h1>{title}</h1>
      <p style={styles.muted}>{subtitle}</p>

      <div style={styles.filters}>
        <Select label="Level" value={level} setValue={setLevel} options={LEVELS} />
        <Select label="Subject" value={subject} setValue={setSubject} options={SUBJECTS[level]} />
        <Select label="Exam Board" value={board} setValue={setBoard} options={BOARDS[level]} />
      </div>

      <div style={styles.tabRow}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={category === cat ? styles.activeTab : styles.tab}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading resources...</p>
      ) : categoryItems.length === 0 ? (
        <p style={styles.empty}>No files uploaded yet.</p>
      ) : (
        <div style={styles.list}>
          {categoryItems.map((item) => (
            <div key={item.id} style={styles.resourceCard}>
              <div>
                <h3>{item.title}</h3>
                <p style={styles.muted}>{item.file_name}</p>
              </div>
              <a href={item.file_url} target="_blank" rel="noreferrer" style={styles.download}>
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Admin({ session, isAdmin, openAuth, reload }) {
  if (!session) {
    return (
      <main style={styles.page}>
        <h1>Admin Login</h1>
        <p>Please login with your Supabase admin account.</p>
        <button onClick={openAuth} style={styles.primary}>Login</button>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main style={styles.page}>
        <h1>Access Denied</h1>
        <p>This account is not authorised as admin.</p>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <h1>Admin Upload Centre</h1>
      <UploadForm title="Upload Learning Resource" categories={LEARNING_CATEGORIES} reload={reload} />
      <UploadForm title="Upload Assessment Material" categories={ASSESSMENT_CATEGORIES} reload={reload} />
    </main>
  );
}

function UploadForm({ title, categories, reload }) {
  const [level, setLevel] = useState("GCSE/IGCSE");
  const [subject, setSubject] = useState("Chemistry");
  const [board, setBoard] = useState("AQA");
  const [category, setCategory] = useState(categories[0]);
  const [titleText, setTitleText] = useState("");
  const [topicOrder, setTopicOrder] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function upload() {
    if (!titleText || !file) {
      alert("Please enter a title and choose a file.");
      return;
    }

    setBusy(true);

    const cleanName = `${Date.now()}-${slugify(file.name)}`;
    const path = `${slugify(level)}/${slugify(subject)}/${slugify(board)}/${slugify(category)}/${cleanName}`;

    const uploadResult = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (uploadResult.error) {
      alert(uploadResult.error.message);
      setBusy(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const insertResult = await supabase.from("resources").insert({
      level,
      subject,
      exam_board: board,
      resource_category: category,
      topic_order: topicOrder ? Number(topicOrder) : null,
      title: titleText,
      file_name: file.name,
      file_url: data.publicUrl,
      file_type: file.type || file.name.split(".").pop(),
      storage_path: path,
      published: true,
    });

    if (insertResult.error) {
      alert(insertResult.error.message);
    } else {
      alert("Resource uploaded successfully.");
      setTitleText("");
      setTopicOrder("");
      setFile(null);
      reload();
    }

    setBusy(false);
  }

  return (
    <section style={styles.panel}>
      <h2>{title}</h2>

      <div style={styles.filters}>
        <Select label="Level" value={level} setValue={setLevel} options={LEVELS} />
        <Select label="Subject" value={subject} setValue={setSubject} options={SUBJECTS[level]} />
        <Select label="Exam Board" value={board} setValue={setBoard} options={BOARDS[level]} />
        <Select label="Category" value={category} setValue={setCategory} options={categories} />
      </div>

      <input
        style={styles.input}
        placeholder="Title, e.g. Topic 1 - Atomic Structure"
        value={titleText}
        onChange={(e) => setTitleText(e.target.value)}
      />

      <input
        style={styles.input}
        placeholder="Topic order, e.g. 1"
        value={topicOrder}
        onChange={(e) => setTopicOrder(e.target.value)}
      />

      <input
        style={styles.input}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={upload} disabled={busy} style={styles.primary}>
        {busy ? "Uploading..." : "Upload Resource"}
      </button>
    </section>
  );
}

function AuthModal({ close }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) alert(result.error.message);
    else close();
  }

  return (
    <div style={styles.modalBack}>
      <div style={styles.modal}>
        <h2>{mode === "login" ? "Login" : "Register"}</h2>
        <input style={styles.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={submit} style={styles.primary}>{mode === "login" ? "Login" : "Register"}</button>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} style={styles.linkBtn}>
          {mode === "login" ? "Create an account" : "Already have an account?"}
        </button>
        <button onClick={close} style={styles.linkBtn}>Close</button>
      </div>
    </div>
  );
}

function Select({ label, value, setValue, options = [] }) {
  return (
    <div>
      <label style={styles.label}>{label}</label>
      <select style={styles.input} value={value} onChange={(e) => setValue(e.target.value)}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Card({ title, text }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

const styles = {
  site: { minHeight: "100vh", background: "#f8fafc", color: "#061633", fontFamily: "system-ui, sans-serif" },
  navbar: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 5%", background: "#061633", color: "white", flexWrap: "wrap" },
  brand: { display: "flex", gap: 12, alignItems: "center", background: "none", border: 0, color: "white", cursor: "pointer" },
  logo: { width: 48, height: 48, borderRadius: "50%", background: "#089f91", display: "grid", placeItems: "center", fontWeight: 900 },
  nav: { display: "flex", gap: 10, flexWrap: "wrap" },
  navBtn: { padding: "12px 16px", borderRadius: 12, border: 0, fontWeight: 800, cursor: "pointer" },
  active: { padding: "12px 16px", borderRadius: 12, border: 0, fontWeight: 800, cursor: "pointer", background: "#089f91", color: "white" },
  darkBtn: { padding: "12px 16px", borderRadius: 12, border: "1px solid white", background: "transparent", color: "white", fontWeight: 800, cursor: "pointer" },
  hero: { minHeight: 560, backgroundImage: "linear-gradient(90deg, rgba(0,0,0,.75), rgba(0,0,0,.15)), url('/hero-students.png')", backgroundSize: "cover", backgroundPosition: "center" },
  heroOverlay: { minHeight: 560, display: "flex", alignItems: "center", padding: "0 5%" },
  heroText: { maxWidth: 660, color: "white" },
  heroActions: { display: "flex", gap: 14, flexWrap: "wrap", marginTop: 24 },
  primary: { padding: "14px 20px", borderRadius: 12, border: 0, background: "#089f91", color: "white", fontWeight: 900, cursor: "pointer" },
  outline: { padding: "14px 20px", borderRadius: 12, border: "1px solid white", background: "transparent", color: "white", fontWeight: 900, cursor: "pointer" },
  page: { maxWidth: 1180, margin: "0 auto", padding: "50px 5%" },
  muted: { color: "#64748b" },
  cards: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20, padding: "40px 5%" },
  card: { background: "white", borderRadius: 18, padding: 24, boxShadow: "0 10px 25px rgba(0,0,0,.08)" },
  filters: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, margin: "24px 0" },
  label: { display: "block", fontWeight: 900, marginBottom: 6 },
  input: { width: "100%", padding: 14, borderRadius: 12, border: "1px solid #cbd5e1", boxSizing: "border-box", marginBottom: 12 },
  tabRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 },
  tab: { padding: "12px 16px", borderRadius: 12, border: 0, cursor: "pointer", fontWeight: 800 },
  activeTab: { padding: "12px 16px", borderRadius: 12, border: 0, cursor: "pointer", fontWeight: 800, background: "#089f91", color: "white" },
  list: { display: "grid", gap: 14 },
  resourceCard: { background: "white", borderRadius: 18, padding: 22, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", boxShadow: "0 8px 20px rgba(0,0,0,.06)" },
  download: { background: "#089f91", color: "white", padding: "12px 18px", borderRadius: 12, textDecoration: "none", fontWeight: 900 },
  panel: { background: "white", padding: 24, borderRadius: 18, marginTop: 24, boxShadow: "0 10px 25px rgba(0,0,0,.08)" },
  empty: { background: "white", padding: 22, borderRadius: 16, border: "1px dashed #cbd5e1" },
  modalBack: { position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 999 },
  modal: { background: "white", padding: 28, borderRadius: 20, width: "min(420px, 90vw)" },
  linkBtn: { background: "none", border: 0, color: "#089f91", fontWeight: 800, cursor: "pointer", marginTop: 10 },
  footer: { background: "#061633", color: "white", textAlign: "center", padding: 34 },
};
