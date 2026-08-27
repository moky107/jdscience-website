import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import AuthModal from "./AuthModal";
import ResourceAccessGate from "./ResourceAccessGate";
import TermsAgreement from "./TermsAgreement";
import TutorChoosingNotice from "./TutorChoosingNotice";
import { TERMS_ACCEPTANCE_ERROR, TERMS_VERSION } from "./termsAndConditions";
import { FEATURED_ROTATION_MS, FEATURED_TUTOR_SLOTS, featuredTutorWindow, tutorsForHomepage } from "./tutorRotation";
import { isResourceLibraryPage, preferredVisitorAuthMode, RESOURCE_LOGIN_REQUIRED, syncSignedInCookie } from "./visitorAuth";
import AdviceNewsSection from "./AdviceNewsSection";
import AdminAdviceEditor from "./AdminAdviceEditor";
import { AQA_GCSE_MATHS_RESOURCES } from "./aqaGcseMathsResources";
import { AQA_ALEVEL_CHEMISTRY_RESOURCES } from "./aqaAlevelChemistryResources";
import { AQA_SCIENCE_RESOURCES } from "./aqaScienceResources";
import { EDEXCEL_SCIENCE_MATHS_RESOURCES } from "./edexcelScienceMathsResources";
import { OCR_SCIENCE_MATHS_RESOURCES } from "./ocrScienceMathsResources";
import { EDUQAS_WJEC_SCIENCE_MATHS_RESOURCES } from "./eduqasWjecScienceMathsResources";
import { JD_SCIENCE_WORKSHEETS } from "./jdScienceWorksheets";
import { NCFE_TLEVEL_RESOURCES } from "./ncfeTLevelResources";
import { PEARSON_BTEC_RESOURCES } from "./pearsonBtecResources";
import { applyDocumentMeta, pageFromPathname, pathForPage } from "./seo";
import { parsePapersQuery } from "./papersQuery";
import { hostedRevisionNotesForCatalog } from "./hostedRevisionNotes";
import { mergeResourceCatalog, resourceOpenHref } from "./resourceNormalize";
/* ============================================================
   jdscience.co.uk — Teal Classic (Supabase-connected)
============================================================ */

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const ADMIN_EMAILS = ["jd943791@gmail.com"];
const BUCKET = "resources"; // Supabase Storage bucket name

const BANNER_IMG = "/hero-students.png.png";
const INTRO_VIDEO_SRC = "/homepage-promo.mp4";

/* -------- Qualification-specific data (single source of truth) -------- */
const LEVELS = ["11+", "GCSE/IGCSE", "A-Level", "T-Level", "BTEC"];

const SUBJECTS_BY_LEVEL = {
  "11+": ["English", "Maths", "Verbal Reasoning", "Non-Verbal Reasoning"],
  "GCSE/IGCSE": ["Biology", "Chemistry", "Physics", "Maths"],
  "A-Level": ["Biology", "Chemistry", "Physics", "Maths"],
  "T-Level": ["Science", "Laboratory Sciences", "Food Sciences", "Health", "Healthcare Science"],
  "BTEC": ["Applied Science", "Health and Social Care", "Engineering", "Business", "Computing"],
};

const BOARDS_BY_LEVEL = {
  "11+": ["Independent Schools", "Grammar Schools"],
  "GCSE/IGCSE": ["AQA", "Edexcel", "OCR", "Eduqas", "WJEC"],
  "A-Level": ["AQA", "Edexcel", "OCR", "Eduqas", "WJEC"],
  "T-Level": ["NCFE", "Pearson", "City & Guilds"],
  "BTEC": ["Pearson"],
};

const RES_TYPES = [
  "Specifications",
  "Revision Notes",
  "Past Questions",
  "Mark Schemes",
  "Examiner Reports",
  "Worksheets",
  "Videos",
];

const RESOURCE_BOARDS = ["Edexcel", "AQA", "OCR", "Eduqas", "WJEC"];
const RESOURCE_LEVELS = ["GCSE", "IGCSE", "A-Level", "BTEC", "T-Level", "11+"];
const RESOURCE_SUBJECTS = ["Chemistry", "Physics", "Biology", "Maths"];
const TUTOR_STORAGE_BUCKET = "tutor-applications";
const TUTOR_SUBJECT_OPTIONS = ["Chemistry", "Physics", "Biology", "Mathematics", "Applied Science", "Other"];
const TUTOR_LEVEL_OPTIONS = ["11+", "GCSE", "IGCSE", "A Level", "BTEC", "T Level", "Other"];
const PROFILE_PHOTO_ACCEPT = ".jpg,.jpeg,.png,.webp";
const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";
const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 8 * 1024 * 1024;

const PLACEHOLDER_RESOURCE_LINKS = {
  Specifications: ["Specification (Current)", "Specification (Legacy)"],
  "Revision Notes": ["Topic Summary Pack", "Quick Revision Guide", "Exam Technique Notes"],
  "Past Questions": ["Mixed Practice Set", "Topic-by-Topic Questions", "Timed Mock Questions"],
  "Mark Schemes": ["Official-Style Mark Scheme", "Model Answers", "Grade Boundary Hints"],
  "Examiner Reports": ["Examiner Feedback", "Common Mistakes Review"],
  Worksheets: ["Foundation Worksheet", "Higher Worksheet", "Challenge Problems"],
  Videos: ["Core Concepts Video", "Worked Example Video", "Exam Tips Video"],
};

const STATIC_RESOURCE_ITEMS = [
  ...hostedRevisionNotesForCatalog(),
  // GCSE Chemistry — Videos
  {
    level: "GCSE/IGCSE",
    subject: "Chemistry",
    exam_board: "Edexcel",
    resource_category: "Videos",
    title: "Topic 1 Key Concepts In Chemistry",
    embed_url: "https://share.synthesia.io/embeds/videos/99d5e9d6-8756-4051-9e53-246cc6af911e",
    all_boards: true,
  },
  { level: "GCSE/IGCSE", subject: "Chemistry", exam_board: "Edexcel", resource_category: "Revision Notes", title: "Topic 1 Key Concepts notes", file_name: "jdscience-edexcel-gcse-chemistry-topic-1-key-concepts-notes-pdf.pdf" },
  ...AQA_GCSE_MATHS_RESOURCES,
  ...AQA_ALEVEL_CHEMISTRY_RESOURCES,
  ...AQA_SCIENCE_RESOURCES,
  ...EDEXCEL_SCIENCE_MATHS_RESOURCES,
  ...OCR_SCIENCE_MATHS_RESOURCES,
  ...EDUQAS_WJEC_SCIENCE_MATHS_RESOURCES,
  ...JD_SCIENCE_WORKSHEETS,
  ...NCFE_TLEVEL_RESOURCES,
  ...PEARSON_BTEC_RESOURCES,
];

function slugify(t) {
  return String(t || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function isUnitFolderLabel(label) {
  return /^Unit\s+\d+$/i.test(String(label || ""));
}

function unitFolderNumber(label) {
  const match = String(label || "").match(/^Unit\s+(\d+)$/i);
  return match ? Number(match[1]) : 0;
}

function videoEmbedSrc(url) {
  const raw = String(url || "").trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "share.synthesia.io") {
      const match = parsed.pathname.match(/\/(?:embeds\/)?videos\/([0-9a-f-]+)/i);
      if (match) return `https://share.synthesia.io/embeds/videos/${match[1]}`;
    }
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      const embed = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return `https://www.youtube-nocookie.com/embed/${embed[1]}`;
    }
    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
  } catch {
    return null;
  }
  return null;
}

function ResourceVideoPlayer({ title, src }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,.06)", padding: 16 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: 18, color: "#0f172a", lineHeight: 1.35 }}>{title}</h3>
      <div className="resource-video-embed" style={{ position: "relative", overflow: "hidden", aspectRatio: "1920 / 1080", borderRadius: 10, background: "#000" }}>
        <iframe
          src={src}
          loading="lazy"
          title={title}
          allowFullScreen
          allow="encrypted-media; fullscreen; microphone; screen-wake-lock"
          style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0, border: "none", padding: 0, margin: 0, overflow: "hidden", maxWidth: "none" }}
        />
      </div>
    </div>
  );
}
/* tolerant level matcher for older stored rows */
function levelKey(l) {
  const s = slugify(l);
  if (s.includes("11")) return "11+";
  if (s.includes("gcse") || s.includes("igcse")) return "GCSE/IGCSE";
  if (s.includes("a-level") || s === "alevel") return "A-Level";
  if (s.includes("t-level") || s === "tlevel") return "T-Level";
  if (s.includes("btec")) return "BTEC";
  return l;
}

function useIsMobile(bp = 768) {
  const [m, setM] = useState(typeof window !== "undefined" ? window.innerWidth <= bp : false);
  useEffect(() => {
    const r = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, [bp]);
  return m;
}

function buildPlaceholderResources({ board, level, subject, type }) {
  const labels = PLACEHOLDER_RESOURCE_LINKS[type] || ["Resource Pack"];
  return labels.map((label, idx) => ({
    id: `${slugify(board)}-${slugify(level)}-${slugify(subject)}-${slugify(type)}-${idx}`,
    title: `${board} ${level} ${subject} ${label}`,
    href: "#",
  }));
}

function resourceFolderLevel(level) {
  const key = levelKey(level);
  if (key === "GCSE/IGCSE") return "gcse";
  if (key === "A-Level") return "alevel";
  if (key === "T-Level") return "tlevel";
  if (key === "11+") return "11plus";
  return slugify(key);
}

function staticResourceFileUrl(resource) {
  if (resource.file_url_override) return resource.file_url_override;
  const category = String(resource.resource_category || "");
  if (/^(Past Questions|Mark Schemes|Examiner Reports)$/i.test(category)) {
    return "";
  }
  const board = slugify(resource.exam_board);
  const level = resourceFolderLevel(resource.level);
  const subject = slugify(resource.subject);
  return `/resources/${board}/${level}/${subject}/${slugify(category)}/${encodeURIComponent(resource.file_name)}`;
}

function buildStaticResourceItems() {
  return STATIC_RESOURCE_ITEMS.map((resource, index) => ({
    id: `static-${index}`,
    level: resource.level,
    subject: resource.subject,
    exam_board: resource.exam_board,
    resource_category: resource.resource_category,
    title: resource.title,
    file_name: resource.file_name || resource.title,
    file_url: resource.embed_url || staticResourceFileUrl(resource),
    file_type: resource.embed_url
      ? "video-embed"
      : /\.html$/i.test(resource.file_name || resource.file_url_override || "")
        ? "text/html"
        : (resource.file_url_override || /\.pdf$/i.test(resource.file_name || "")) ? "application/pdf" : "application/octet-stream",
    storage_path: null,
    published: true,
    series_label: resource.series_label || null,
    all_boards: Boolean(resource.all_boards),
  }));
}

function isValidEmailAddress(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function isValidTelephone(value) {
  const raw = String(value || "").trim();
  const digits = raw.replace(/\D/g, "");
  return /^[+()\d\s-]{7,24}$/.test(raw) && digits.length >= 7 && digits.length <= 15;
}

function buildTutorStoragePath(folder, tutorName, fileName) {
  const extension = fileName.includes(".") ? fileName.split(".").pop() : "dat";
  return `applications/${folder}/${Date.now()}-${slugify(tutorName || "tutor")}-${Math.random().toString(36).slice(2, 8)}.${String(extension || "dat").toLowerCase()}`;
}

function formatList(items, fallback = "Not provided") {
  return Array.isArray(items) && items.length > 0 ? items.join(", ") : fallback;
}

function avatarInitials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JD";
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
}

function formatTutorStorageError(error) {
  const message = String(error?.message || error || "");
  if (/bucket not found/i.test(message)) {
    return 'Tutor uploads are not configured yet. Create the private Supabase Storage bucket "tutor-applications" or run the SQL in supabase/tutor_workflow.sql.';
  }
  return message || "Failed to upload file.";
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    if (media.addEventListener) media.addEventListener("change", update);
    else media.addListener(update);
    return () => {
      if (media.removeEventListener) media.removeEventListener("change", update);
      else media.removeListener(update);
    };
  }, []);

  return prefersReducedMotion;
}

function useInView(options = {}) {
  const ref = React.useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options.once !== false) observer.disconnect();
        } else if (options.once === false) {
          setInView(false);
        }
      },
      { threshold: options.threshold ?? 0.15 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options.once, options.threshold]);

  return [ref, inView];
}

function ModalShell({ open, onClose, titleId, descriptionId, triggerRef, maxWidth = 920, children }) {
  const panelRef = React.useRef(null);
  const previousFocusRef = React.useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setEntered(false);
    previousFocusRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => setEntered(true));

    if (panelRef.current) {
      const focusable = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable.length > 0) focusable[0].focus();
      else panelRef.current.focus();
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')).filter(
        (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", onKeyDown);
      const focusTarget = triggerRef?.current || previousFocusRef.current;
      if (focusTarget && typeof focusTarget.focus === "function") focusTarget.focus();
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        display: "grid",
        placeItems: "center",
        padding: "max(8px, env(safe-area-inset-top)) 12px max(8px, env(safe-area-inset-bottom))",
        background: entered ? "rgba(2, 6, 23, .56)" : "rgba(2, 6, 23, 0)",
        backdropFilter: prefersReducedMotion ? "none" : "blur(4px)",
        transition: prefersReducedMotion ? "none" : "background .22s ease",
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="modal-panel"
        style={{
          width: `min(${maxWidth}px, 100%)`,
          maxHeight: "min(90vh, 980px)",
          overflowY: "auto",
          borderRadius: 24,
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid rgba(148, 163, 184, .22)",
          boxShadow: "0 32px 90px rgba(15, 23, 42, .28)",
          transform: entered ? "translateY(0) scale(1)" : "translateY(16px) scale(.97)",
          opacity: entered ? 1 : 0,
          transition: prefersReducedMotion ? "none" : "transform .24s ease, opacity .24s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* --------------------------------- NAVBAR --------------------------------- */
function Navbar({ onHome, onPick, onResource, onScroll, onSearch, onTutor, tutorButtonRef, session, isAdmin, onAuth, onLogout, onAdminDashboard }) {
  const [q, setQ] = useState("");
  const [openIdx, setOpenIdx] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) setMenuOpen(false);
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || !menuOpen) return undefined;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, [isMobile, menuOpen]);

  const menu = [
    { label: "Home", type: "link", action: onHome, href: "/" },
    ...LEVELS.map((lvl) => ({
      label: lvl, type: "dropdown",
      options: SUBJECTS_BY_LEVEL[lvl].map((s) => ({ text: s, action: () => onPick(lvl, s) })),
    })),
    { label: "Resources", type: "dropdown", options: RES_TYPES.map((r) => ({ text: r, action: () => onResource(r) })) },
    { label: "About", type: "link", action: () => { window.location.href = "/about/"; }, href: "/about/" },
    { label: "Advice", type: "link", action: () => onScroll("advice"), href: "/#advice-anchor" },
    { label: "Find a Tutor", type: "link", action: () => onScroll("book"), href: "/#book-anchor" },
    { label: "Become a Tutor", type: "link", action: onTutor, ref: tutorButtonRef },
  ];

  const submit = (e) => { e.preventDefault(); onSearch(q); setMenuOpen(false); };

  const logo = (
    <a href="/" onClick={(e) => { e.preventDefault(); onHome(); setMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 1, minWidth: 0, textDecoration: "none" }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
      <div className="site-logo-text" style={{ fontWeight: 800, color: "#0f172a", fontSize: 15 }}>jdscience.co.uk</div>
    </a>
  );

  const adminBtn = session ? (
    isAdmin ? (
      <div className="nav-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" onClick={() => { onAdminDashboard(); setMenuOpen(false); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #10b981", background: "#10b981", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
          Admin ✓
        </button>
        <button type="button" onClick={() => { onLogout(); setMenuOpen(false); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", color: "#111", cursor: "pointer" }}>
          Logout
        </button>
      </div>
    ) : (
      <div className="nav-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#64748b", maxWidth: isMobile ? "100%" : 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.user?.email}</span>
        <button type="button" onClick={() => { onLogout(); setMenuOpen(false); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", color: "#111", cursor: "pointer" }}>
          Logout
        </button>
      </div>
    )
  ) : (
    <div className="nav-auth" style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button type="button" onClick={() => { onAuth("login"); setMenuOpen(false); }}
        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", color: "#111", cursor: "pointer" }}>
        Login
      </button>
      <button type="button" onClick={() => { onAuth("register"); setMenuOpen(false); }}
        style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: TEAL, color: "#fff", cursor: "pointer", fontWeight: 700 }}>
        Register
      </button>
    </div>
  );

  return (
    <header className="site-header" style={{ position: "sticky", top: 0, zIndex: 1000, background: "#fff", boxShadow: "0 1px 6px rgba(0,0,0,.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isMobile ? "10px 14px" : "10px 16px", gap: 12 }}>
        {logo}
        {!isMobile && (
          <form role="search" onSubmit={submit} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input name="q" aria-label="Search subjects or topics" placeholder="Search subjects or topics..." value={q} onChange={(e) => setQ(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e6e6e6", width: 190 }} />
            <button type="submit" style={{ padding: "8px 12px", borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer" }}>Search</button>
            {adminBtn}
          </form>
        )}
        {isMobile && (
          <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}
            style={{ width: 44, height: 44, flexShrink: 0, fontSize: 26, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, cursor: "pointer", lineHeight: 1 }}>{menuOpen ? "✕" : "☰"}</button>
        )}
      </div>

      {!isMobile && (
        <nav style={{ display: "flex", gap: 2, padding: "0 14px", background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)", justifyContent: "center", flexWrap: "wrap" }}>
          {menu.map((it, i) => (
            <div key={it.label} style={{ position: "relative" }}
              onMouseEnter={() => setOpenIdx(i)} onMouseLeave={() => setOpenIdx(null)}>
              {it.href ? (
                <a ref={it.ref} href={it.href} onClick={(e) => {
                  if (it.href.startsWith("/about") || it.href.startsWith("/resources/") || it.href.startsWith("/tutors/joseph")) return;
                  e.preventDefault();
                  it.action();
                }}
                  style={{ background: "transparent", border: "none", padding: "12px 14px", cursor: "pointer", fontWeight: 700, color: "#0f172a", fontSize: 14, whiteSpace: "nowrap", textDecoration: "none", display: "inline-block" }}>
                  {it.label}
                </a>
              ) : (
                <button ref={it.ref} onClick={() => it.type === "link" && it.action()}
                  style={{ background: openIdx === i && it.type === "dropdown" ? "#d9f6fa" : "transparent", border: "none", padding: "12px 14px", cursor: "pointer", fontWeight: 700, color: "#0f172a", fontSize: 14, whiteSpace: "nowrap" }}>
                  {it.label}{it.type === "dropdown" ? " ▾" : ""}
                </button>
              )}
              {it.type === "dropdown" && openIdx === i && (
                <div style={{ position: "absolute", top: "100%", left: 0, minWidth: 200, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.14)", borderRadius: "0 0 8px 8px", overflow: "hidden", zIndex: 10 }}>
                  {it.options.map((opt) => (
                    <div key={opt.text} onClick={opt.action}
                      style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", fontSize: 14, color: "#0f172a" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#ecfeff")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}>{opt.text}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      )}

      {isMobile && menuOpen && (
        <nav style={{ background: "#ecfeff", borderTop: "1px solid rgba(0,0,0,0.04)", padding: "4px 0 16px", maxHeight: "min(78vh, calc(100dvh - 68px))", overflowY: "auto" }}>
          {menu.map((it, i) => (
            <div key={it.label} style={{ borderBottom: "1px solid rgba(0,150,136,.08)" }}>
              <button type="button" ref={it.ref} onClick={() => {
                if (it.type === "link") { it.action(); setMenuOpen(false); }
                else setOpenIdx(openIdx === i ? null : i);
              }}
                style={{ display: "flex", width: "100%", textAlign: "left", alignItems: "center", justifyContent: "space-between", background: openIdx === i && it.type === "dropdown" ? "#d9f6fa" : "transparent", border: "none", padding: "14px 18px", minHeight: 48, cursor: "pointer", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                <span>{it.label}</span>
                {it.type === "dropdown" && <span aria-hidden="true" style={{ color: TEAL_DARK }}>{openIdx === i ? "▴" : "▾"}</span>}
              </button>
              {it.type === "dropdown" && openIdx === i && it.options.map((opt) => (
                <button type="button" key={opt.text} onClick={() => { opt.action(); setMenuOpen(false); setOpenIdx(null); }}
                  style={{ display: "block", width: "100%", textAlign: "left", background: "#fff", border: "none", padding: "12px 18px 12px 28px", minHeight: 44, cursor: "pointer", color: "#0e7490", fontSize: 15 }}>{opt.text}</button>
              ))}
            </div>
          ))}
          <form onSubmit={submit} style={{ display: "flex", gap: 8, padding: "14px 18px 8px" }}>
            <input placeholder="Search subjects or topics..." value={q} onChange={(e) => setQ(e.target.value)}
              style={{ flex: 1, minWidth: 0, padding: "12px 12px", borderRadius: 8, border: "1px solid #e6e6e6", fontSize: 16 }} />
            <button type="submit" style={{ padding: "12px 16px", minHeight: 44, borderRadius: 8, background: TEAL, color: "#fff", border: "none", fontWeight: 700 }}>Go</button>
          </form>
          <div style={{ padding: "8px 18px 4px" }}>{adminBtn}</div>
        </nav>
      )}
    </header>
  );
}

/* ---------------------------------- HERO ---------------------------------- */
function Hero({ onScroll, onBrowse }) {
  const isMobile = useIsMobile();
  const isTablet = useIsMobile(1024);
  const heroOffset = isMobile ? 0 : isTablet ? -18 : -36;
  const ctaBaseStyle = {
    padding: isMobile ? "14px 18px" : "15px 24px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 800,
    fontSize: isMobile ? 16 : 16,
    boxShadow: "0 10px 24px rgba(15, 23, 42, .16)",
    transition: "transform .2s ease, box-shadow .2s ease, background-color .2s ease, border-color .2s ease",
    outlineOffset: 3,
  };
  return (
    <section style={{ position: "relative", minHeight: isMobile ? "auto" : 480, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#fff", overflow: "hidden" }}>
      <img src={BANNER_IMG} alt="Students learning together"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: isMobile ? "center 28%" : "center 34%", filter: "brightness(1.10) contrast(1.04) saturate(1.04)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,.10) 0%, rgba(0,0,0,.16) 48%, rgba(0,0,0,.28) 100%)" }} />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 760, width: "100%", padding: isMobile ? "48px 18px 36px" : "40px 18px", transform: `translateY(${heroOffset}px)`, textShadow: "0 2px 10px rgba(0,0,0,.34)" }}>
        <div style={{ display: "inline-block", background: "rgba(255,255,255,.16)", padding: isMobile ? "8px 12px" : "7px 15px", borderRadius: 20, marginBottom: 14, fontSize: isMobile ? 13 : 15, fontWeight: 700, maxWidth: "100%", lineHeight: 1.35 }}>🏆 Expert Science &amp; Maths Tutoring for Everyone</div>
        <h1 style={{ fontSize: isMobile ? 28 : 44, margin: "0 0 14px", lineHeight: 1.2, fontWeight: 800 }}>
          Learn Smarter. Revise Better. <span style={{ color: "#fbbf24" }}>Achieve More.</span>
        </h1>
        <p style={{ fontSize: isMobile ? 16 : 18, color: "rgba(255,255,255,.95)", maxWidth: 600, margin: "0 auto", lineHeight: 1.55 }}>
          Past papers, revision notes, videos and expert tutoring for GCSE, A Level, T Level and BTEC.
        </p>
        <div className="hero-ctas" style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="/papers"
            onClick={(e) => { e.preventDefault(); onBrowse(); }}
            style={{ ...ctaBaseStyle, border: "none", background: "#fff", color: TEAL_DARK, textDecoration: "none" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 14px 28px rgba(15, 23, 42, .2)";
              e.currentTarget.style.background = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 24px rgba(15, 23, 42, .16)";
              e.currentTarget.style.background = "#fff";
            }}
          >
            Browse Resources
          </a>
          <a
            href="/#book-anchor"
            onClick={(e) => { e.preventDefault(); onScroll("book"); }}
            style={{ ...ctaBaseStyle, border: "2px solid rgba(255,255,255,.76)", background: "rgba(255,255,255,.08)", color: "#fff", textDecoration: "none" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 14px 28px rgba(15, 23, 42, .22)";
              e.currentTarget.style.background = "rgba(255,255,255,.14)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.92)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 24px rgba(15, 23, 42, .16)";
              e.currentTarget.style.background = "rgba(255,255,255,.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,.76)";
            }}
          >
            Book a Tutor
          </a>
        </div>
      </div>
    </section>
  );
}

function BoardStrip() {
  const isMobile = useIsMobile();
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #eee", padding: isMobile ? "14px 16px" : "16px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap", color: "#475569", fontWeight: 700 }}>
        <span style={{ color: "#94a3b8", fontSize: 13, letterSpacing: ".02em", textTransform: "uppercase" }}>Covering:</span>
        {["AQA", "Edexcel", "OCR", "Eduqas", "WJEC", "Pearson", "NCFE"].map((b) => (
          <span
            key={b}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: isMobile ? "10px 14px" : "8px 13px",
              borderRadius: 999,
              border: "1px solid rgba(0, 150, 136, .18)",
              background: "#ecfeff",
              color: TEAL_DARK,
              fontSize: isMobile ? 14 : 13,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}

function OffersSection() {
  const isMobile = useIsMobile();
  const offers = [
    { title: "Resources", text: "Revision notes, how questions are framed, past questions, mark schemes and examiner reports." },
    { title: "Tutoring", text: "Book support for 11+, GCSE, IGCSE, A-Level, BTEC and T-Level." },
    { title: "Tutor Profiles", text: "Tutor listings appear after a listing review." },
    { title: "Admin Control", text: "Admin can upload resources directly for visitors to download." },
  ];
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ color: "#0f172a", fontSize: isMobile ? 24 : 28, margin: "0 0 22px" }}>What JD Science Offers</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {offers.map((o) => (
            <div key={o.title} style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 4px 14px rgba(0,0,0,.06)" }}>
              <h3 style={{ margin: "0 0 8px", color: "#0f172a", fontSize: 18 }}>{o.title}</h3>
              <p style={{ color: "#64748b", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{o.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LevelGrid({ onLevel }) {
  const isMobile = useIsMobile();
  const blurb = { "11+": "Entrance exam prep & practice", "GCSE/IGCSE": "Years 10–11 · all boards", "A-Level": "Years 12–13 · exam-ready", "T-Level": "Technical qualifications", "BTEC": "Vocational courses" };
  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: "#0f172a", fontSize: isMobile ? 24 : 28, margin: 0 }}>Choose Your Level</h2>
        <p style={{ textAlign: "center", color: "#64748b", marginTop: 4 }}>Pick where you're studying — then choose your subject</p>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 26 }}>
          {LEVELS.map((l) => (
            <div key={l} onClick={() => onLevel(l)}
              style={{ background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, color: "#fff", borderRadius: 14, padding: isMobile ? 22 : 20, cursor: "pointer", boxShadow: "0 4px 14px rgba(0,0,0,.1)", minHeight: isMobile ? 112 : undefined }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{l}</div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,.9)", margin: "8px 0 0" }}>{blurb[l]}</p>
              <div style={{ marginTop: 14, fontWeight: 700, fontSize: 14 }}>Explore →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResourceBrowser({ initialType, onBook }) {
  const isMobile = useIsMobile();
  const [board, setBoard] = useState(RESOURCE_BOARDS[0]);
  const [level, setLevel] = useState(RESOURCE_LEVELS[0]);
  const [subject, setSubject] = useState(RESOURCE_SUBJECTS[0]);
  const [type, setType] = useState(initialType || RES_TYPES[0]);

  useEffect(() => {
    if (initialType && RES_TYPES.includes(initialType)) setType(initialType);
  }, [initialType]);

  const resources = buildPlaceholderResources({ board, level, subject, type });

  return (
    <section style={{ padding: isMobile ? "20px 14px" : "28px 20px", background: "#f8fafc", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ color: "#64748b", fontSize: isMobile ? 12 : 13, marginBottom: 10, lineHeight: 1.5, overflowWrap: "anywhere" }}>Home › Resources › {board} › {level} › {subject} › {type}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,.06)", marginBottom: 22, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: isMobile ? "100%" : 180 }}>
            <div style={{ fontWeight: 800, color: "#0f172a" }}>Resource Browser</div>
            <div style={{ color: "#64748b", fontSize: 14 }}>
              Select your exam board, level, subject and resource type to view available resources.
            </div>
          </div>
          <button onClick={onBook} style={{ padding: "12px 18px", minHeight: 44, borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, width: isMobile ? "100%" : "auto" }}>Book Tutor</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Exam Board</div>
            <select value={board} onChange={(e) => setBoard(e.target.value)} style={inp}>
              {RESOURCE_BOARDS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Level</div>
            <select value={level} onChange={(e) => setLevel(e.target.value)} style={inp}>
              {RESOURCE_LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Subject</div>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inp}>
              {RESOURCE_SUBJECTS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Resource Type</div>
            <select value={type} onChange={(e) => setType(e.target.value)} style={inp}>
              {RES_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,.06)", overflow: "hidden" }}>
          <div style={{ background: TEAL_DARK, color: "#fff", padding: "12px 14px", fontWeight: 800 }}>
            {board} · {level} · {subject} · {type}
          </div>
          <div style={{ padding: 12, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {resources.map((item) => (
              <a key={item.id} href={item.href} className="folder-file"
                style={{ textAlign: "left", padding: isMobile ? "14px 16px" : "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: isMobile ? 16 : 14, color: "#0f172a", textDecoration: "none" }}>
                📄 {item.title}
              </a>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

/* ------------------------- PAST PAPERS (Supabase) ------------------------- */
function PastPapers({ subject, level, resType, board, isAdmin, resources, reload, onBook }) {
  const isMobile = useIsMobile();
  const [activeLevel, setActiveLevel] = useState(level || "GCSE/IGCSE");
  const subjectsForLevel = SUBJECTS_BY_LEVEL[activeLevel] || [];
  const boardsForLevel = BOARDS_BY_LEVEL[activeLevel] || [];

  const [activeSubject, setActiveSubject] = useState(subject || subjectsForLevel[0]);
  const [activeRes, setActiveRes] = useState(resType || "Past Questions");
  const [activeBoard, setActiveBoard] = useState(board || null);
  const [uploadBoard, setUploadBoard] = useState(null); // board name -> opens modal
  const [openUnitByBoard, setOpenUnitByBoard] = useState({});

  useEffect(() => { if (level) setActiveLevel(level); }, [level]);
  useEffect(() => { if (subject) setActiveSubject(subject); }, [subject]);
  useEffect(() => { if (resType) setActiveRes(resType); }, [resType]);
  useEffect(() => { setActiveBoard(board || null); }, [board]);
  useEffect(() => { if (!board) setActiveBoard(null); }, [activeRes, activeLevel, activeSubject]); // eslint-disable-line
  useEffect(() => { setOpenUnitByBoard({}); }, [activeRes, activeLevel, activeSubject, activeBoard]);

  useEffect(() => {
    const list = SUBJECTS_BY_LEVEL[activeLevel] || [];
    if (!list.includes(activeSubject)) setActiveSubject(list[0]);
  }, [activeLevel]); // eslint-disable-line

  const isVideos = slugify(activeRes) === "videos";
  const videoItems = [];
  if (isVideos) {
    const seen = new Set();
    resources.forEach((r) => {
      if (levelKey(r.level) !== activeLevel) return;
      if (slugify(r.subject) !== slugify(activeSubject)) return;
      if (slugify(r.resource_category) !== "videos") return;
      if (activeBoard && !r.all_boards && slugify(r.exam_board) !== slugify(activeBoard)) return;
      const key = r.file_url || r.id;
      if (seen.has(key)) return;
      seen.add(key);
      videoItems.push(r);
    });
  }
  const shownVideoIds = new Set(videoItems.map((r) => r.id));

  const itemsFor = (board) =>
    resources.filter((r) => {
      const titleBlob = `${r.title || ""} ${r.file_name || ""} ${r.storage_path || ""} ${r.file_url || ""}`;
      if (slugify(activeSubject) === "biology" && /physics/i.test(titleBlob) && !/physical chemistry/i.test(titleBlob)) {
        return false;
      }
      return (
        levelKey(r.level) === activeLevel &&
        slugify(r.subject) === slugify(activeSubject) &&
        slugify(r.resource_category) === slugify(activeRes) &&
        (r.all_boards
          ? (!activeBoard ? slugify(r.exam_board) === slugify(board) : true)
          : slugify(r.exam_board) === slugify(board)) &&
        !shownVideoIds.has(r.id)
      );
    });

  async function removeItem(item) {
    if (!window.confirm("Delete this resource?")) return;
    if (item.storage_path) await supabase.storage.from(BUCKET).remove([item.storage_path]);
    const { error } = await supabase.from("resources").delete().eq("id", item.id);
    if (error) alert(error.message); else reload();
  }

  const fileLinkStyle = {
    flex: 1,
    textAlign: "left",
    padding: isMobile ? "14px 16px" : "10px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: isMobile ? 16 : 14,
    color: "#0f172a",
    textDecoration: "none",
  };

  function renderResourceRow(item) {
    return (
      <div key={item.id} style={{ display: "flex", gap: 6, alignItems: "stretch" }}>
        <a href={resourceOpenHref(item)} target="_blank" rel="noreferrer" className="folder-file" style={fileLinkStyle}>
          {activeRes === "Videos" ? "▶️" : "📄"} {item.title}
        </a>
        {isAdmin && (
          <button onClick={() => removeItem(item)} title="Delete"
            style={{ padding: "0 12px", minWidth: 44, borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>✕</button>
        )}
      </div>
    );
  }

  return (
    <section style={{ padding: isMobile ? "20px 14px" : "28px 20px", background: "#f8fafc", minHeight: "60vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ color: "#64748b", fontSize: isMobile ? 12 : 13, marginBottom: 10, lineHeight: 1.5, overflowWrap: "anywhere" }}>Home › {activeRes} › {activeLevel} › {activeSubject}</div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,.06)", marginBottom: 22, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: isMobile ? "100%" : 180 }}>
            <div style={{ fontWeight: 800, color: "#0f172a", fontSize: isMobile ? 17 : 16 }}>Need help with {activeSubject}?</div>
            <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.5 }}>1-to-1 tutoring with an experienced specialist · ✓ Qualified · ⭐ 5.0</div>
          </div>
          <button onClick={onBook} style={{ padding: "12px 18px", minHeight: 44, borderRadius: 8, background: TEAL, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, width: isMobile ? "100%" : "auto" }}>Book Tutor</button>
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Level</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {LEVELS.map((l) => (
            <button key={l} className="filter-chip" onClick={() => setActiveLevel(l)}
              style={{ padding: isMobile ? "12px 16px" : "6px 12px", borderRadius: 8, border: `1px solid ${activeLevel === l ? TEAL : "#cbd5e1"}`, cursor: "pointer", fontWeight: 600, fontSize: isMobile ? 15 : 13, background: activeLevel === l ? "#ecfeff" : "#fff", color: activeLevel === l ? TEAL_DARK : "#475569" }}>{l}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Subject</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {subjectsForLevel.map((s) => (
            <button key={s} className="filter-chip" onClick={() => setActiveSubject(s)}
              style={{ padding: isMobile ? "12px 16px" : "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 700, fontSize: isMobile ? 15 : 13, background: activeSubject === s ? TEAL : "#e2e8f0", color: activeSubject === s ? "#fff" : "#334155" }}>{s}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Resource Type</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {RES_TYPES.map((r) => (
            <button key={r} className="filter-chip" onClick={() => setActiveRes(r)}
              style={{ padding: isMobile ? "12px 16px" : "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: isMobile ? 15 : 13, background: activeRes === r ? TEAL_DARK : "#e2e8f0", color: activeRes === r ? "#fff" : "#334155" }}>{r}</button>
          ))}
        </div>

        <h2 style={{ color: "#0f172a", marginBottom: 16, fontSize: isMobile ? 20 : 24, lineHeight: 1.3 }}>{activeLevel} {activeSubject} — {activeRes} by {activeLevel === "11+" ? "School Type" : "Exam Board"}</h2>

        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>Exam Board</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          <button className="filter-chip" onClick={() => setActiveBoard(null)}
            style={{ padding: isMobile ? "12px 16px" : "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: isMobile ? 15 : 13, background: !activeBoard ? TEAL_DARK : "#e2e8f0", color: !activeBoard ? "#fff" : "#334155" }}>All Boards</button>
          {boardsForLevel.map((b) => (
            <button key={b} className="filter-chip" onClick={() => setActiveBoard(b)}
              style={{ padding: isMobile ? "12px 16px" : "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: isMobile ? 15 : 13, background: activeBoard === b ? TEAL : "#e2e8f0", color: activeBoard === b ? "#fff" : "#334155" }}>{b}</button>
          ))}
        </div>

        {isVideos && videoItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 22 }}>
            {videoItems.map((video) => {
              const embedSrc = videoEmbedSrc(video.file_url);
              if (embedSrc) {
                return <ResourceVideoPlayer key={video.id} title={video.title} src={embedSrc} />;
              }
              return (
                <a key={video.id} href={video.file_url} target="_blank" rel="noreferrer" className="folder-file"
                  style={{ display: "block", textAlign: "left", padding: isMobile ? "14px 16px" : "12px 14px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontSize: isMobile ? 16 : 14, color: "#0f172a", textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,.06)" }}>
                  ▶️ {video.title}
                </a>
              );
            })}
          </div>
        )}

        {(isAdmin || boardsForLevel.some((board) => (!activeBoard || board === activeBoard) && itemsFor(board).length > 0)) && (
        <div className="folder-grid" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))", gap: isMobile ? 16 : 18 }}>
          {boardsForLevel.filter((b) => !activeBoard || b === activeBoard).map((board) => {
            const items = itemsFor(board);
            if (items.length === 0 && !isAdmin) return null;
            const grouped = [];
            const groupMap = new Map();
            items.forEach((p) => {
              const key = p.series_label || "";
              if (!groupMap.has(key)) {
                const group = { key, items: [] };
                groupMap.set(key, group);
                grouped.push(group);
              }
              groupMap.get(key).items.push(p);
            });
            const unitGroups = grouped
              .filter((group) => isUnitFolderLabel(group.key))
              .sort((a, b) => unitFolderNumber(a.key) - unitFolderNumber(b.key));
            const otherGroups = grouped.filter((group) => !isUnitFolderLabel(group.key));
            const openUnit = openUnitByBoard[board] || null;
            const openUnitGroup = unitGroups.find((group) => group.key === openUnit) || null;
            return (
              <div key={board} style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,.06)" }}>
                <div style={{ background: TEAL_DARK, color: "#fff", padding: isMobile ? "16px 18px" : "12px 14px", fontWeight: 800, fontSize: isMobile ? 18 : 16 }}>{board}</div>
                <div style={{ padding: isMobile ? 14 : 12, display: "flex", flexDirection: "column", gap: 8, maxHeight: isMobile ? undefined : 640, overflowY: items.length > 12 ? "auto" : undefined }}>
                  {unitGroups.length > 0 && !openUnitGroup && unitGroups.map((group) => (
                    <button
                      key={group.key}
                      type="button"
                      className="folder-file"
                      onClick={() => setOpenUnitByBoard((prev) => ({ ...prev, [board]: group.key }))}
                      style={{ ...fileLinkStyle, width: "100%", fontWeight: 700, background: "#ecfeff", border: `1px solid ${TEAL}` }}
                    >
                      📁 {group.key}
                    </button>
                  ))}
                  {openUnitGroup && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setOpenUnitByBoard((prev) => ({ ...prev, [board]: null }))}
                        style={{ ...fileLinkStyle, fontWeight: 700, color: TEAL_DARK }}
                      >
                        ← Unit folders
                      </button>
                      <div style={{ fontSize: 12, fontWeight: 800, color: TEAL_DARK }}>📁 {openUnitGroup.key}</div>
                      {openUnitGroup.items.map(renderResourceRow)}
                    </div>
                  )}
                  {otherGroups.map((group) => (
                    <div key={group.key || "ungrouped"} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {group.key ? <div style={{ fontSize: 12, fontWeight: 800, color: TEAL_DARK, marginTop: 4 }}>{group.key}</div> : null}
                      {group.items.map(renderResourceRow)}
                    </div>
                  ))}
                  {isAdmin && (
                    <button onClick={() => setUploadBoard(board)}
                      style={{ padding: "12px 12px", minHeight: 44, borderRadius: 8, border: `1px dashed ${TEAL}`, background: "#fff", color: TEAL, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>+ Add resource</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {uploadBoard && (
        <UploadModal
          level={activeLevel} subject={activeSubject} board={uploadBoard} category={activeRes}
          close={() => setUploadBoard(null)} reload={reload}
        />
      )}
    </section>
  );
}

/* ------------------------------ UPLOAD MODAL (multi-file) ------------------------------ */
function UploadModal({ level, subject, board, category, close, reload }) {
  const [mode, setMode] = useState("file"); // "file" | "link"
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [files, setFiles] = useState([]); // array of { file, name, progress, status, storage_path, url }
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = React.useRef(null);

  const addFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const arr = Array.from(fileList).map((f) => ({
      file: f,
      name: f.name,
      title: f.name.replace(/\.[^.]+$/, ""),
      progress: 0,
      status: "ready", // ready|uploading|done|error
      storage_path: null,
      url: null,
      error: null,
    }));
    setFiles((cur) => [...cur, ...arr]);
    // prefill title if empty
    if (!title && arr.length === 1) setTitle(arr[0].title);
  };

  const pickFiles = (fList) => addFiles(fList);

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    pickFiles(e.dataTransfer.files);
  };

  const removeLocalFile = (idx) => setFiles((f) => f.filter((_, i) => i !== idx));

  async function uploadSingle(fileObj, idx) {
    const f = fileObj.file;
    const clean = `${Date.now()}-${slugify(f.name)}`;
    const storage_path = `${slugify(level)}/${slugify(subject)}/${slugify(board)}/${slugify(category)}/${clean}`;
    try {
      fileObj.status = "uploading";
      setFiles((cur) => {
        const next = [...cur];
        next[idx] = { ...fileObj };
        return next;
      });

      const up = await supabase.storage.from(BUCKET).upload(storage_path, f, { cacheControl: "3600", upsert: true });
      if (up.error) throw up.error;
      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storage_path).data.publicUrl;

      const { error } = await supabase.from("resources").insert({
        level, subject, exam_board: board, resource_category: category,
        title: fileObj.title || fileObj.name, file_name: fileObj.name,
        file_url: publicUrl, file_type: f.type || fileObj.name.split(".").pop(), storage_path, published: true,
      });
      if (error) throw error;

      fileObj.status = "done";
      fileObj.progress = 100;
      fileObj.storage_path = storage_path;
      fileObj.url = publicUrl;
      setFiles((cur) => {
        const next = [...cur];
        next[idx] = { ...fileObj };
        return next;
      });
      return { success: true };
    } catch (err) {
      fileObj.status = "error";
      fileObj.error = err.message || String(err);
      setFiles((cur) => {
        const next = [...cur];
        next[idx] = { ...fileObj };
        return next;
      });
      return { success: false, error: err };
    }
  }

  async function save() {
    if (mode === "link") {
      if (!title.trim()) { alert("Please enter a title."); return; }
      if (!link.trim()) { alert("Please paste a link."); return; }
      setBusy(true);
      try {
        const { error } = await supabase.from("resources").insert({
          level, subject, exam_board: board, resource_category: category,
          title: title.trim(), file_name: title.trim(), file_url: link.trim(), file_type: "link", storage_path: null, published: true,
        });
        if (error) alert(error.message); else { reload(); close(); }
      } finally { setBusy(false); }
      return;
    }

    if (files.length === 0) { alert("Please choose or drop one or more files."); return; }
    setBusy(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fobj = files[i];
        if (fobj.status === "done") continue;
        if (!fobj.title) fobj.title = fobj.name.replace(/\.[^.]+$/, "");
        await uploadSingle(fobj, i);
      }
      reload();
      close();
    } finally {
      setBusy(false);
    }
  }

  const tab = (m, label) => (
    <button onClick={() => setMode(m)}
      style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 800,
        background: mode === m ? TEAL : "#e2e8f0", color: mode === m ? "#fff" : "#334155" }}>{label}</button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 2000, padding: 16 }}>
      <div style={{ background: "#fff", padding: 24, borderRadius: 16, width: "min(640px,98vw)", maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <h2 style={{ margin: 0 }}>Add Resource</h2>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>{level} · {subject} · {board} · {category}</p>
        </div>

        <div style={{ display: "flex", gap: 8 }}>{tab("file", "⬆️ Upload File(s)")} {tab("link", "🔗 Paste Link")}</div>

        {mode === "file" && (
          <>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input style={{ ...inp, flex: 1, minWidth: 0 }} placeholder="Common title (optional - used for single file)" value={title} onChange={(e) => setTitle(e.target.value)} />
              <div className="stack-on-mobile" style={{ display: "flex", gap: 8, flex: 1 }}>
                <button onClick={() => inputRef.current?.click()} style={{ padding: "10px 12px", borderRadius: 8, border: `1px solid ${TEAL}`, background: "#fff", color: TEAL, cursor: "pointer", fontWeight: 700 }}>Browse</button>
                <button onClick={() => { setFiles([]); setTitle(""); }} style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", cursor: "pointer" }}>Clear</button>
              </div>
            </div>

            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              style={{ border: `2px dashed ${drag ? TEAL : "#cbd5e1"}`, background: drag ? "#ecfeff" : "#f8fafc",
                borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer", color: "#475569" }}>
              <div style={{ fontSize: 28 }}>📂</div>
              <div style={{ fontWeight: 700, marginTop: 6 }}>{files.length === 0 ? "Drag & drop files here (or click to browse)" : `${files.length} file(s) selected`}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Supports multiple files — Word, PDF, images, PPT, etc.</div>
            </div>

            <input ref={inputRef} type="file" hidden multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.md,.odt" onChange={(e) => addFiles(e.target.files)} />

            {files.length > 0 && (
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="stack-on-mobile" style={{ display: "flex", gap: 8, alignItems: "center", padding: 8, borderRadius: 8, background: "#fff", border: "1px solid #eef2f7" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{f.name}</div>
                    </div>
                    <div style={{ minWidth: 120, textAlign: "right", fontWeight: 700 }}>
                      {f.status === "ready" && <span style={{ color: "#0f172a" }}>Ready</span>}
                      {f.status === "uploading" && <span style={{ color: TEAL }}>{f.progress || "…"}%</span>}
                      {f.status === "done" && <span style={{ color: "green" }}>Uploaded</span>}
                      {f.status === "error" && <span style={{ color: "#dc2626" }}>Error</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => {
                        const newTitle = prompt("Edit title for this file:", f.title);
                        if (newTitle !== null) {
                          setFiles((cur) => {
                            const next = [...cur];
                            next[i] = { ...next[i], title: newTitle };
                            return next;
                          });
                        }
                      }} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e6e6e6", background: "#fff", cursor: "pointer" }}>Edit</button>
                      <button onClick={() => removeLocalFile(i)} style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#dc2626", cursor: "pointer" }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mode === "link" && (
          <>
            <input style={inp} placeholder="Title (e.g. Paper 1 — June 2023)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input style={inp} placeholder="Paste file / YouTube / Drive link" value={link} onChange={(e) => setLink(e.target.value)} />
          </>
        )}

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={save} disabled={busy}
            style={{ padding: 12, borderRadius: 8, background: busy ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: busy ? "default" : "pointer", fontWeight: 800 }}>
            {busy ? "Uploading…" : "Save Resource(s)"}
          </button>
          <button type="button" onClick={close} style={{ background: "none", border: 0, color: "#64748b", cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- BOOKING --------------------------------- */
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box" };

function Booking() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    level: "GCSE/IGCSE",
    subject: SUBJECTS_BY_LEVEL["GCSE/IGCSE"][0],
    message: "",
    sessionType: "single"
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [services, setServices] = useState([]);

  const set = (k, v) => setForm((f) => {
    const next = { ...f, [k]: v };
    if (k === "level") next.subject = (SUBJECTS_BY_LEVEL[v] || [])[0] || "";
    return next;
  });

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("tutoring_services")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: true });

        if (error) throw error;
        if (data) setServices(data);
      } catch (err) {
        console.error("Could not load services:", err);
      }
    })();
  }, []);

  function priceLabel(level, type) {
    if (type === "trial") return "Free";
    const svc = services.find(s => s.level === level || s.slug === level);
    if (!svc) {
      const premium = level && (level.includes("A-Level") || level.includes("T-Level") || level.includes("BTEC"));
      if (premium) return type === "package" ? "£400" : "£45/hr";
      return type === "package" ? "£300" : "£35/hr";
    }
    return type === "package" ? `£${svc.package_price_10}` : `£${svc.price_per_hour}/hr`;
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    if (!form.name || !form.email) {
      alert("Please enter name and email");
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      alert(TERMS_ACCEPTANCE_ERROR);
      setLoading(false);
      return;
    }

    try {
      // Free trials go through a server API that uses the service role key,
      // so Supabase RLS does not block the insert.
      if (form.sessionType === "trial") {
        const resp = await fetch("/api/create-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            level: form.level,
            subject: form.subject,
            message: form.message,
            sessionType: "trial",
            accept_terms: true,
            terms_version: TERMS_VERSION,
          }),
        });
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.error || "Failed to book free trial");
        setSent(true);
        setLoading(false);
        return;
      }

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        level: form.level,
        subject: form.subject,
        sessionType: form.sessionType === "package" ? "package" : "single",
        message: form.message,
        accept_terms: true,
        terms_version: TERMS_VERSION,
      };

      const resp = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(body?.error || "Failed to create checkout session");
      }

      if (body.url) {
        window.location.href = body.url;
      } else {
        throw new Error("Missing Stripe redirect URL");
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.message || "unknown"));
      setLoading(false);
    }
  }

  const price = priceLabel(form.level, form.sessionType);

  return (
    <section style={{ background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, padding: isMobile ? "32px 16px" : "48px 20px", color: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 28, alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 24 : 28, marginTop: 0 }}>Book a Tutoring Session</h2>
          <p style={{ color: "rgba(255,255,255,.9)", lineHeight: 1.55 }}>Personalised 1-to-1 lessons across science and maths.</p>
          <ul style={{ lineHeight: 1.7, paddingLeft: 18, fontSize: isMobile ? 15 : 16 }}>
            <li>✓ 11+ / GCSE / T-Level / BTEC — <b>£35–£45/hr</b></li>
            <li>✓ Free 30‑minute trial available for first-time students</li>
            <li>✓ Packages available for discount pricing</li>
          </ul>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: isMobile ? 16 : 22, color: "#0f172a" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 40 }}>✅</div>
              <h3>Thanks, {form.name || "there"}!</h3>
              <p style={{ color: "#64748b" }}>We'll be in touch at {form.email || "your email"} soon.</p>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input required placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} style={inp} />
              <input required type="email" placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inp} />
              <input placeholder="Phone (WhatsApp ok)" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inp} />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                <select value={form.level} onChange={(e) => set("level", e.target.value)} style={inp}>
                  {services.length > 0 ? services.map(s => <option key={s.id} value={s.level}>{s.level}</option>)
                    : LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={form.subject} onChange={(e) => set("subject", e.target.value)} style={inp}>
                  {(SUBJECTS_BY_LEVEL[form.level] || []).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="session-options" style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "single", label: "Single session", hint: priceLabel(form.level, "single") },
                  { id: "package", label: "10-session package", hint: priceLabel(form.level, "package") },
                  { id: "trial", label: "Free 30-min trial", hint: "Free" },
                ].map((opt) => {
                  const active = form.sessionType === opt.id;
                  return (
                    <label key={opt.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flex: 1,
                      padding: "12px 14px",
                      borderRadius: 10,
                      border: `2px solid ${active ? TEAL : "#e2e8f0"}`,
                      background: active ? "#ecfeff" : "#fff",
                      cursor: "pointer",
                      minHeight: 48,
                    }}>
                      <input type="radio" name="sessionType" checked={active} value={opt.id} onChange={() => set("sessionType", opt.id)} />
                      <span>
                        <span style={{ fontWeight: 800, display: "block", color: "#0f172a" }}>{opt.label}</span>
                        <span style={{ fontSize: 13, color: "#64748b" }}>{opt.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div style={{ fontWeight: 700, color: TEAL_DARK }}>Price: {price}</div>
              <textarea placeholder="What would you like help with?" value={form.message} onChange={(e) => set("message", e.target.value)} rows={3} style={inp} />
              <TutorChoosingNotice />
              <TermsAgreement id="booking-accept-terms" variant="booking" checked={acceptTerms} onChange={setAcceptTerms} disabled={loading} />
              <button type="submit" disabled={loading || !acceptTerms} style={{ padding: "14px 12px", minHeight: 48, borderRadius: 8, background: loading || !acceptTerms ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: loading || !acceptTerms ? "default" : "pointer", fontWeight: 800 }}>
                {loading ? "Processing…" : "Request / Book"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function TutorAvatar({ tutor, size = 72 }) {
  if (tutor.profile_photo_url) {
    return <img src={tutor.profile_photo_url} alt={`${tutor.tutor_name} profile`} style={{ width: size, height: size, borderRadius: 20, objectFit: "cover", background: "#e2e8f0", boxShadow: "0 12px 30px rgba(15, 23, 42, .16)", filter: "brightness(1.12) contrast(1.04) saturate(1.05)" }} />;
  }
  return <div aria-hidden="true" style={{ width: size, height: size, borderRadius: 20, display: "grid", placeItems: "center", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: "#fff", fontWeight: 800, boxShadow: "0 12px 30px rgba(15, 23, 42, .16)" }}>{avatarInitials(tutor.tutor_name)}</div>;
}

function hasText(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

function listFromTutorField(arrayValue, fallbackText) {
  if (Array.isArray(arrayValue) && arrayValue.length > 0) {
    return arrayValue.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (!hasText(fallbackText)) return [];
  return String(fallbackText).split(",").map((item) => item.trim()).filter(Boolean);
}

function tutorModeLabel(mode) {
  const raw = String(mode || "").trim().toLowerCase();
  if (!raw) return "Not specified";
  if (raw === "online") return "Online";
  if (raw === "face-to-face" || raw === "face to face") return "Face-to-face";
  if (raw === "both") return "Both";
  return mode;
}

function TutorCard({ tutor, onViewProfile, onBook, inView = true, prefersReducedMotion = false, delayMs = 0 }) {
  const isMobile = useIsMobile();
  const subjects = listFromTutorField(tutor.subjects_taught, tutor.subject_specialism);
  const levels = listFromTutorField(tutor.levels_taught, tutor.level_taught);
  const profileText = String(tutor.short_professional_biography || tutor.bio || "").trim();
  const experience = hasText(tutor.years_experience) ? tutor.years_experience : "Experience not provided";
  const mode = tutorModeLabel(tutor.teaching_mode);
  const rate = hasText(tutor.rate_display) ? tutor.rate_display : (tutor.contact_for_quote ? "Contact for quote" : "");
  const qualifications = hasText(tutor.highest_relevant_qualification)
    ? tutor.highest_relevant_qualification
    : (hasText(tutor.qualifications) ? tutor.qualifications : "");
  const memberships = hasText(tutor.professional_memberships) ? tutor.professional_memberships : "";

  return (
    <article
      key={tutor.id || tutor.public_slug}
      className="tutor-card"
      tabIndex={0}
      aria-label={`Tutor profile for ${tutor.tutor_name || "listed tutor"}`}
      onKeyDown={(event) => {
        if (event.key === "Enter" && tutor.public_slug) {
          event.preventDefault();
          onViewProfile(tutor.public_slug);
        }
      }}
      style={{
        background: "#fff",
        borderRadius: 20,
        padding: 16,
        border: "1px solid rgba(148, 163, 184, .16)",
        boxShadow: "0 12px 34px rgba(15, 23, 42, .08)",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(14px)",
        transition: prefersReducedMotion ? "none" : `opacity .38s ease ${delayMs}ms, transform .38s ease ${delayMs}ms, box-shadow .2s ease`,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: isMobile ? 0 : 396,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = "translateY(-3px)";
        event.currentTarget.style.boxShadow = "0 18px 42px rgba(15, 23, 42, .12)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = "translateY(0)";
        event.currentTarget.style.boxShadow = "0 12px 34px rgba(15, 23, 42, .08)";
      }}
    >
      <div style={{ display: "flex", alignItems: "start", gap: 12 }}>
        <TutorAvatar tutor={tutor} size={isMobile ? 72 : 92} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 800 }}>
            <span aria-hidden="true">✓</span>
            <span>Listed tutor</span>
          </div>
            <h3 style={{ margin: "8px 0 6px", color: "#0f172a", fontSize: 22, lineHeight: 1.2 }}>{tutor.tutor_name || "Listed Tutor"}</h3>
          {subjects.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {subjects.slice(0, 3).map((subject) => (
                <span key={subject} style={{ padding: "4px 8px", borderRadius: 999, border: "1px solid rgba(0, 150, 136, .2)", background: "#ecfeff", color: TEAL_DARK, fontSize: 12, fontWeight: 700 }}>
                  {subject}
                </span>
              ))}
              {subjects.length > 3 && (
                <span style={{ padding: "4px 8px", borderRadius: 999, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#475569", fontSize: 12, fontWeight: 700 }}>
                  +{subjects.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8, fontSize: 14, color: "#334155" }}>
        {levels.length > 0 && <div><b>Levels:</b> {levels.join(", ")}</div>}
        <div><b>Experience:</b> {experience}</div>
        <div><b>Mode:</b> {mode}</div>
        {rate && <div><b>Rate:</b> {rate}</div>}
        {qualifications && <div><b>Qualification:</b> {qualifications}</div>}
        {memberships && <div><b>Memberships:</b> {memberships}</div>}
      </div>

      {profileText && (
        <p
          style={{
            margin: 0,
            color: "#64748b",
            lineHeight: 1.6,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 66,
          }}
        >
          {profileText}
        </p>
      )}

      <div className="stack-on-mobile" style={{ marginTop: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={() => onViewProfile(tutor.public_slug)} style={{ padding: "12px 13px", borderRadius: 10, border: "1px solid rgba(0, 150, 136, .22)", background: "#fff", color: TEAL_DARK, cursor: "pointer", fontWeight: 800 }}>
          View Profile
        </button>
        <button type="button" onClick={() => onBook(tutor)} style={{ padding: "12px 13px", borderRadius: 10, border: "none", background: TEAL, color: "#fff", cursor: "pointer", fontWeight: 800 }}>
          Book This Tutor
        </button>
      </div>
    </article>
  );
}

function TutorProfiles({ tutors, loading, error, onViewAll, onViewProfile, onBook }) {
  const isMobile = useIsMobile();
  const isTablet = useIsMobile(1024);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [sectionRef, inView] = useInView({ threshold: 0.15 });
  const rotatableTutors = tutorsForHomepage(tutors);
  const canRotate = rotatableTutors.length > FEATURED_TUTOR_SLOTS;
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const featuredTutors = featuredTutorWindow(rotatableTutors, FEATURED_TUTOR_SLOTS, offset);
  const showViewAll = rotatableTutors.length > featuredTutors.length;
  const gridColumns = isMobile ? "1fr" : (isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))");

  useEffect(() => {
    if (prefersReducedMotion || !canRotate || paused) return undefined;
    const timer = window.setInterval(() => {
      setOffset((current) => current + 1);
    }, FEATURED_ROTATION_MS);
    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, canRotate, paused, rotatableTutors.length]);

  return (
    <section ref={sectionRef} style={{ padding: isMobile ? "40px 16px" : "56px 20px", background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: TEAL_DARK, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 12 }}>Tutors</div>
            <h2 style={{ color: "#0f172a", fontSize: isMobile ? 26 : 34, margin: "8px 0 0" }}>Meet Our Tutors</h2>
            <p style={{ color: "#64748b", marginTop: 10, maxWidth: 680 }}>
              Carefully reviewed tutors across science and maths, ready for 1-to-1 support online or face to face.
              {canRotate ? " Featured profiles rotate so every listed tutor is shown." : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {canRotate && (
              <>
                <button type="button" aria-label="Show previous listed tutors" onClick={() => { setPaused(true); setOffset((current) => current - 1); }} style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(0, 150, 136, .22)", background: "#fff", color: TEAL_DARK, cursor: "pointer", fontWeight: 800 }}>‹</button>
                <button type="button" aria-label="Show next listed tutors" onClick={() => { setPaused(true); setOffset((current) => current + 1); }} style={{ width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(0, 150, 136, .22)", background: "#fff", color: TEAL_DARK, cursor: "pointer", fontWeight: 800 }}>›</button>
              </>
            )}
            {showViewAll && <button type="button" onClick={onViewAll} style={{ padding: "11px 16px", borderRadius: 12, border: "1px solid rgba(0, 150, 136, .22)", background: "#ecfeff", color: TEAL_DARK, cursor: "pointer", fontWeight: 800 }}>View All Tutors</button>}
          </div>
        </div>

        {loading && <div style={{ color: "#64748b", marginTop: 18 }}>Loading tutors…</div>}
        {error && <div style={{ color: "#b91c1c", marginTop: 18 }}>{error}</div>}

        {!loading && !error && featuredTutors.length === 0 && (
          <div style={{ marginTop: 18, borderRadius: 24, padding: isMobile ? 22 : 30, background: "linear-gradient(135deg, #ecfeff, #f8fafc)", border: "1px solid rgba(0, 150, 136, .12)", color: "#475569" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Tutor profiles are coming soon.</div>
            <p style={{ margin: "8px 0 0", lineHeight: 1.6 }}>
              New applications are reviewed before going live. Use the Become a Tutor button above if you would like to apply.
            </p>
          </div>
        )}

        <div
          aria-live="polite"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{ marginTop: 22, display: "grid", gridTemplateColumns: gridColumns, gap: 16 }}
        >
          <article style={{ background: "#fff", borderRadius: 22, padding: isMobile ? 18 : 22, boxShadow: "0 10px 30px rgba(15,23,42,.08)", border: "1px solid rgba(0,150,136,.16)" }}>
            <div style={{ color: TEAL_DARK, fontWeight: 800, fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Founder</div>
            <h3 style={{ margin: "8px 0 6px", color: "#0f172a" }}>Joseph Danso</h3>
            <p style={{ color: "#64748b", margin: 0, lineHeight: 1.55 }}>Science Lecturer, FRSC, QTLS, EdD candidate, examiner and WorldSkills educator. Online Chemistry tutor in London and across the UK.</p>
            <a href="/tutors/joseph-danso/" style={{ display: "inline-block", marginTop: 14, fontWeight: 800, color: TEAL }}>View Joseph&apos;s profile →</a>
          </article>
          {featuredTutors.map((tutor, index) => (
            <TutorCard
              key={tutor.id || tutor.public_slug}
              tutor={tutor}
              onViewProfile={onViewProfile}
              onBook={onBook}
              inView={inView}
              prefersReducedMotion={prefersReducedMotion}
              delayMs={index * 90}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TutorDirectory({ tutors, loading, error, onBack, onViewProfile, onBook }) {
  const isMobile = useIsMobile();
  const isTablet = useIsMobile(1024);
  const gridColumns = isMobile ? "1fr" : (isTablet ? "repeat(2, minmax(0, 1fr))" : "repeat(3, minmax(0, 1fr))");
  return (
    <section style={{ padding: isMobile ? "24px 16px" : "36px 20px", minHeight: "65vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ color: TEAL_DARK, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 12 }}>Tutor Directory</div>
            <h2 style={{ margin: "8px 0 0", color: "#0f172a", fontSize: isMobile ? 28 : 36 }}>All listed tutors</h2>
          </div>
          <button type="button" onClick={onBack} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", cursor: "pointer", fontWeight: 700 }}>← Back Home</button>
        </div>

        {loading && <div style={{ color: "#64748b", marginTop: 20 }}>Loading tutors…</div>}
        {error && <div style={{ color: "#b91c1c", marginTop: 20 }}>{error}</div>}

        <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: gridColumns, gap: 16 }}>
          {(tutors || []).map((tutor, index) => (
            <TutorCard
              key={tutor.id || tutor.public_slug}
              tutor={tutor}
              onViewProfile={onViewProfile}
              onBook={onBook}
              delayMs={index * 50}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TutorProfileModal({ slug, triggerRef, onClose, onBook }) {
  const [loading, setLoading] = useState(false);
  const [tutor, setTutor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setTutor(null);

    (async () => {
      try {
        const resp = await fetch(`/api/tutor-profiles?slug=${encodeURIComponent(slug)}`);
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(data?.error || "Tutor profile not found.");
        if (!cancelled) setTutor(data.tutor || null);
      } catch (err) {
        if (!cancelled) setError(err.message || "Tutor profile not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <ModalShell open={Boolean(slug)} onClose={onClose} titleId="tutor-profile-title" descriptionId="tutor-profile-description" triggerRef={triggerRef} maxWidth={860}>
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
          <div>
            <div id="tutor-profile-description" style={{ color: "#64748b", fontSize: 14 }}>Tutor profile</div>
            <h2 id="tutor-profile-title" style={{ margin: "6px 0 0", color: "#0f172a" }}>Tutor Profile</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close tutor profile" style={{ width: 42, height: 42, borderRadius: 999, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {loading && <div style={{ marginTop: 20, color: "#64748b" }}>Loading profile…</div>}
        {error && <div style={{ marginTop: 20, color: "#b91c1c" }}>{error}</div>}

        {tutor && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", gap: 18, alignItems: "start", flexWrap: "wrap" }}>
              <TutorAvatar tutor={tutor} size={112} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: 999, background: "#ecfeff", color: TEAL_DARK, fontSize: 12, fontWeight: 800 }}>Listed tutor</div>
                {hasText(tutor.tutor_name) && <h3 style={{ margin: "12px 0 6px", fontSize: 26, color: "#0f172a", lineHeight: 1.2 }}>{tutor.tutor_name}</h3>}
                {listFromTutorField(tutor.subjects_taught, tutor.subject_specialism).length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                    {listFromTutorField(tutor.subjects_taught, tutor.subject_specialism).map((subject) => (
                      <span key={subject} style={{ padding: "4px 9px", borderRadius: 999, border: "1px solid rgba(0, 150, 136, .2)", background: "#ecfeff", color: TEAL_DARK, fontSize: 12, fontWeight: 700 }}>{subject}</span>
                    ))}
                  </div>
                )}
                <div style={{ marginTop: 10, color: "#475569", display: "grid", gap: 6 }}>
                  {listFromTutorField(tutor.levels_taught, tutor.level_taught).length > 0 && <div><b>Levels:</b> {listFromTutorField(tutor.levels_taught, tutor.level_taught).join(", ")}</div>}
                  {hasText(tutor.exam_boards_taught) && <div><b>Exam boards:</b> {tutor.exam_boards_taught}</div>}
                  {hasText(tutor.years_experience) && <div><b>Experience:</b> {tutor.years_experience}</div>}
                  {hasText(tutor.current_professional_role) && <div><b>Current role:</b> {tutor.current_professional_role}</div>}
                  <div><b>Teaching mode:</b> {tutorModeLabel(tutor.teaching_mode)}</div>
                  {hasText(tutor.availability_summary) && <div><b>Availability:</b> {tutor.availability_summary}</div>}
                  {(hasText(tutor.rate_display) || tutor.contact_for_quote) && <div><b>Rate:</b> {hasText(tutor.rate_display) ? tutor.rate_display : "Contact for quote"}</div>}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 22, display: "grid", gap: 12 }}>
              {(hasText(tutor.highest_relevant_qualification) || hasText(tutor.qualifications) || hasText(tutor.teaching_qualifications)) && (
                <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14 }}>
                  <div style={{ color: "#0f172a", fontWeight: 800 }}>Qualifications</div>
                  {hasText(tutor.highest_relevant_qualification || tutor.qualifications) && <div style={{ marginTop: 8, color: "#475569", lineHeight: 1.7 }}>{tutor.highest_relevant_qualification || tutor.qualifications}</div>}
                  {hasText(tutor.teaching_qualifications) && <div style={{ marginTop: 8, color: "#475569", lineHeight: 1.7 }}><b>Teaching qualifications:</b> {tutor.teaching_qualifications}</div>}
                  <div style={{ marginTop: 8, color: "#64748b", fontSize: 13, lineHeight: 1.55 }}>This information is supplied by the tutor. Please check that it is suitable for your needs.</div>
                </div>
              )}

              {hasText(tutor.professional_memberships) && (
                <div style={{ background: "#f8fafc", borderRadius: 14, padding: 14 }}>
                  <div style={{ color: "#0f172a", fontWeight: 800 }}>Professional memberships</div>
                  <div style={{ marginTop: 8, color: "#475569", lineHeight: 1.7 }}>{tutor.professional_memberships}</div>
                </div>
              )}

              {hasText(tutor.short_professional_biography || tutor.bio) && (
                <div>
                  <div style={{ marginTop: 4, color: "#0f172a", fontWeight: 800 }}>Professional biography</div>
                  <p style={{ marginTop: 8, color: "#475569", lineHeight: 1.75 }}>{tutor.short_professional_biography || tutor.bio}</p>
                </div>
              )}

              {hasText(tutor.tutoring_approach) && (
                <div>
                  <div style={{ color: "#0f172a", fontWeight: 800 }}>Tutoring approach</div>
                  <p style={{ marginTop: 8, color: "#475569", lineHeight: 1.75 }}>{tutor.tutoring_approach}</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
              <TutorChoosingNotice />
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }} className="stack-on-mobile">
                <button type="button" onClick={() => onBook(tutor)} style={{ padding: "12px 18px", borderRadius: 14, border: "none", background: TEAL, color: "#fff", cursor: "pointer", fontWeight: 800 }}>Book This Tutor</button>
                <button type="button" onClick={onClose} style={{ padding: "12px 18px", borderRadius: 14, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", cursor: "pointer", fontWeight: 700 }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

function TutorApplicationForm({ open, onClose, onSubmitted, triggerRef }) {
  const isMobile = useIsMobile();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ tutor_name: "", email_address: "", telephone_number: "", location: "", subjects_taught: [], subjects_other: "", levels_taught: [], levels_other: "", exam_boards_taught: "", highest_relevant_qualification: "", teaching_qualifications: "", professional_memberships: "", years_experience: "", current_professional_role: "", short_professional_biography: "", tutoring_approach: "", teaching_mode: "online", availability_summary: "", rate_display: "", company: "", confirm_accurate: false, consent_review_store: false, consent_public_profile: false, accept_terms: false });
  const [files, setFiles] = useState({ profile_photo: null, cv: null, qualification_evidence: null });

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleChoice = (key, choice) => setForm((current) => {
    const values = Array.isArray(current[key]) ? current[key] : [];
    return { ...current, [key]: values.includes(choice) ? values.filter((item) => item !== choice) : [...values, choice] };
  });
  const setFile = (key, file) => setFiles((current) => ({ ...current, [key]: file || null }));
  const fieldError = (name) => errors[name] ? <div style={{ color: "#b91c1c", fontSize: 13, marginTop: 6 }}>{errors[name]}</div> : null;

  function validateFile(file, kind) {
    if (!file) return null;
    const extension = `.${String(file.name || "").split(".").pop()?.toLowerCase() || ""}`;
    const allowed = kind === "profile_photo" ? PROFILE_PHOTO_ACCEPT.split(",") : DOCUMENT_ACCEPT.split(",");
    const maxBytes = kind === "profile_photo" ? PROFILE_PHOTO_MAX_BYTES : DOCUMENT_MAX_BYTES;
    if (!allowed.includes(extension)) return "This file type is not allowed.";
    if (file.size > maxBytes) return `File is too large. Maximum ${kind === "profile_photo" ? "5MB" : "8MB"}.`;
    return null;
  }

  function validateForm() {
    const nextErrors = {};
    if (!form.tutor_name.trim()) nextErrors.tutor_name = "Full name is required.";
    if (!form.email_address.trim() || !isValidEmailAddress(form.email_address)) nextErrors.email_address = "Enter a valid email address.";
    if (!form.telephone_number.trim() || !isValidTelephone(form.telephone_number)) nextErrors.telephone_number = "Enter a valid telephone number.";
    if (!form.location.trim()) nextErrors.location = "Location is required.";
    if (form.subjects_taught.length === 0) nextErrors.subjects_taught = "Choose at least one subject.";
    if (form.subjects_taught.includes("Other") && !form.subjects_other.trim()) nextErrors.subjects_other = "Please specify the other subject.";
    if (form.levels_taught.length === 0) nextErrors.levels_taught = "Choose at least one level.";
    if (form.levels_taught.includes("Other") && !form.levels_other.trim()) nextErrors.levels_other = "Please specify the other level.";
    if (!form.exam_boards_taught.trim()) nextErrors.exam_boards_taught = "Exam boards taught is required.";
    if (!form.highest_relevant_qualification.trim()) nextErrors.highest_relevant_qualification = "Highest relevant qualification is required.";
    if (!form.years_experience.trim()) nextErrors.years_experience = "Years of experience is required.";
    if (!form.current_professional_role.trim()) nextErrors.current_professional_role = "Current professional role is required.";
    if (!form.short_professional_biography.trim()) nextErrors.short_professional_biography = "A short professional biography is required.";
    if (!form.tutoring_approach.trim()) nextErrors.tutoring_approach = "Please describe your tutoring approach.";
    if (!form.availability_summary.trim()) nextErrors.availability_summary = "Availability is required.";
    if (!form.rate_display.trim()) nextErrors.rate_display = "Please provide an hourly rate or rate range.";
    if (!files.profile_photo) nextErrors.profile_photo = "A profile photograph is required.";
    const profilePhotoError = validateFile(files.profile_photo, "profile_photo");
    if (profilePhotoError) nextErrors.profile_photo = profilePhotoError;
    const cvError = validateFile(files.cv, "cv");
    if (cvError) nextErrors.cv = cvError;
    const evidenceError = validateFile(files.qualification_evidence, "qualification_evidence");
    if (evidenceError) nextErrors.qualification_evidence = evidenceError;
    if (!form.confirm_accurate) nextErrors.confirm_accurate = "You must confirm the information supplied is accurate.";
    if (!form.consent_review_store) nextErrors.consent_review_store = "You must consent to JDScience reviewing and storing the application.";
    if (!form.consent_public_profile) nextErrors.consent_public_profile = "You must agree that an approved profile may be displayed publicly.";
    if (!form.accept_terms) nextErrors.accept_terms = TERMS_ACCEPTANCE_ERROR;
    return nextErrors;
  }

  async function uploadFile(file, folder) {
    if (!file) return null;
    const path = buildTutorStoragePath(folder, form.tutor_name, file.name);
    const { error } = await supabase.storage.from(TUTOR_STORAGE_BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw new Error(formatTutorStorageError(error));
    return path;
  }

  function resetForm() {
    setForm({ tutor_name: "", email_address: "", telephone_number: "", location: "", subjects_taught: [], subjects_other: "", levels_taught: [], levels_other: "", exam_boards_taught: "", highest_relevant_qualification: "", teaching_qualifications: "", professional_memberships: "", years_experience: "", current_professional_role: "", short_professional_biography: "", tutoring_approach: "", teaching_mode: "online", availability_summary: "", rate_display: "", company: "", confirm_accurate: false, consent_review_store: false, consent_public_profile: false, accept_terms: false });
    setFiles({ profile_photo: null, cv: null, qualification_evidence: null });
    setErrors({});
    setSubmitError("");
  }

  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    const validation = validateForm();
    setErrors(validation);
    setSubmitError("");
    setSuccess("");
    if (Object.keys(validation).length > 0) return;

    setSaving(true);
    try {
      const [profilePhotoPath, cvPath, evidencePath] = await Promise.all([
        uploadFile(files.profile_photo, "profile-photo"),
        uploadFile(files.cv, "cv"),
        uploadFile(files.qualification_evidence, "qualification-evidence"),
      ]);

      const resp = await fetch("/api/create-tutor-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, profile_photo_path: profilePhotoPath, cv_path: cvPath, qualification_evidence_path: evidencePath, terms_version: TERMS_VERSION }),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(body?.error || "Failed to submit tutor application.");

      setSuccess("Application submitted successfully. JDScience will review your application before any profile is published.");
      if (onSubmitted) onSubmitted();
      resetForm();
    } catch (err) {
      setSubmitError(err.message || "Failed to submit tutor application.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} titleId="become-tutor-title" descriptionId="become-tutor-description" triggerRef={triggerRef} maxWidth={980}>
      <div style={{ padding: isMobile ? 18 : 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
          <div>
            <div id="become-tutor-description" style={{ color: TEAL_DARK, fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" }}>JDScience Tutor Applications</div>
            <h2 id="become-tutor-title" style={{ margin: "8px 0 0", color: "#0f172a", fontSize: isMobile ? 28 : 36 }}>Become a Tutor</h2>
            <p style={{ color: "#64748b", marginTop: 10, maxWidth: 720, lineHeight: 1.7 }}>
              Submit your application below. Every application is reviewed by JDScience before a public tutor profile can be approved and published.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close tutor application form" style={{ width: 44, height: 44, borderRadius: 999, border: "1px solid #dbe3ef", background: "#fff", color: "#0f172a", cursor: "pointer", fontSize: 24, lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={submit} style={{ marginTop: 20, display: "grid", gap: 20 }}>
          <div style={{ borderRadius: 20, background: "#fff", border: "1px solid rgba(148, 163, 184, .18)", padding: isMobile ? 16 : 20 }}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>Personal details</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginTop: 16 }}>
              <div><input required placeholder="Full name" value={form.tutor_name} onChange={(e) => set("tutor_name", e.target.value)} style={inp} />{fieldError("tutor_name")}</div>
              <div><input required type="email" placeholder="Email address" value={form.email_address} onChange={(e) => set("email_address", e.target.value)} style={inp} />{fieldError("email_address")}</div>
              <div><input required placeholder="Telephone number" value={form.telephone_number} onChange={(e) => set("telephone_number", e.target.value)} style={inp} />{fieldError("telephone_number")}</div>
              <div><input required placeholder="Town or city" value={form.location} onChange={(e) => set("location", e.target.value)} style={inp} />{fieldError("location")}</div>
              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: "#334155" }}>Profile photograph</label>
                <input type="file" accept={PROFILE_PHOTO_ACCEPT} onChange={(e) => setFile("profile_photo", e.target.files?.[0] || null)} style={inp} />
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>{files.profile_photo ? files.profile_photo.name : "JPG, PNG or WebP up to 5MB."}</div>
                {fieldError("profile_photo")}
              </div>
            </div>
          </div>

          <div style={{ borderRadius: 20, background: "#fff", border: "1px solid rgba(148, 163, 184, .18)", padding: isMobile ? 16 : 20 }}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>Teaching information</h3>
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8 }}>Subjects taught</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TUTOR_SUBJECT_OPTIONS.map((item) => (
                  <label key={item} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 999, border: "1px solid #dbe3ef", background: form.subjects_taught.includes(item) ? "#ecfeff" : "#fff", color: form.subjects_taught.includes(item) ? TEAL_DARK : "#334155", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                    <input type="checkbox" checked={form.subjects_taught.includes(item)} onChange={() => toggleChoice("subjects_taught", item)} />
                    {item}
                  </label>
                ))}
              </div>
              {fieldError("subjects_taught")}
              {form.subjects_taught.includes("Other") && <div style={{ marginTop: 10 }}><input placeholder="Other subject" value={form.subjects_other} onChange={(e) => set("subjects_other", e.target.value)} style={inp} />{fieldError("subjects_other")}</div>}
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8 }}>Levels taught</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TUTOR_LEVEL_OPTIONS.map((item) => (
                  <label key={item} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 999, border: "1px solid #dbe3ef", background: form.levels_taught.includes(item) ? "#ecfeff" : "#fff", color: form.levels_taught.includes(item) ? TEAL_DARK : "#334155", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                    <input type="checkbox" checked={form.levels_taught.includes(item)} onChange={() => toggleChoice("levels_taught", item)} />
                    {item}
                  </label>
                ))}
              </div>
              {fieldError("levels_taught")}
              {form.levels_taught.includes("Other") && <div style={{ marginTop: 10 }}><input placeholder="Other level" value={form.levels_other} onChange={(e) => set("levels_other", e.target.value)} style={inp} />{fieldError("levels_other")}</div>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginTop: 16 }}>
              <div><input placeholder="Exam boards taught" value={form.exam_boards_taught} onChange={(e) => set("exam_boards_taught", e.target.value)} style={inp} />{fieldError("exam_boards_taught")}</div>
              <div><input placeholder="Highest relevant qualification" value={form.highest_relevant_qualification} onChange={(e) => set("highest_relevant_qualification", e.target.value)} style={inp} />{fieldError("highest_relevant_qualification")}</div>
              <div><input placeholder="Teaching qualifications" value={form.teaching_qualifications} onChange={(e) => set("teaching_qualifications", e.target.value)} style={inp} /></div>
              <div><input placeholder="Professional memberships" value={form.professional_memberships} onChange={(e) => set("professional_memberships", e.target.value)} style={inp} /></div>
              <div><input placeholder="Years of teaching or tutoring experience" value={form.years_experience} onChange={(e) => set("years_experience", e.target.value)} style={inp} />{fieldError("years_experience")}</div>
              <div><input placeholder="Current professional role" value={form.current_professional_role} onChange={(e) => set("current_professional_role", e.target.value)} style={inp} />{fieldError("current_professional_role")}</div>
              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}><textarea rows={4} placeholder="Short professional biography" value={form.short_professional_biography} onChange={(e) => set("short_professional_biography", e.target.value)} style={inp} />{fieldError("short_professional_biography")}</div>
              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}><textarea rows={4} placeholder="Tutoring approach" value={form.tutoring_approach} onChange={(e) => set("tutoring_approach", e.target.value)} style={inp} />{fieldError("tutoring_approach")}</div>
              <div>
                <select value={form.teaching_mode} onChange={(e) => set("teaching_mode", e.target.value)} style={inp}>
                  <option value="online">Online</option>
                  <option value="face-to-face">Face-to-face</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div><input placeholder="Availability" value={form.availability_summary} onChange={(e) => set("availability_summary", e.target.value)} style={inp} />{fieldError("availability_summary")}</div>
              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}><input placeholder="Hourly rate or rate range" value={form.rate_display} onChange={(e) => set("rate_display", e.target.value)} style={inp} />{fieldError("rate_display")}</div>
            </div>
          </div>

          <div style={{ borderRadius: 20, background: "#fff", border: "1px solid rgba(148, 163, 184, .18)", padding: isMobile ? 16 : 20 }}>
            <h3 style={{ margin: 0, color: "#0f172a" }}>Evidence and consent</h3>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginTop: 16 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: "#334155" }}>Optional CV upload</label>
                <input type="file" accept={DOCUMENT_ACCEPT} onChange={(e) => setFile("cv", e.target.files?.[0] || null)} style={inp} />
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>{files.cv ? files.cv.name : "PDF, DOC, DOCX or image up to 8MB."}</div>
                {fieldError("cv")}
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 700, marginBottom: 8, color: "#334155" }}>Optional qualification evidence upload</label>
                <input type="file" accept={DOCUMENT_ACCEPT} onChange={(e) => setFile("qualification_evidence", e.target.files?.[0] || null)} style={inp} />
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>{files.qualification_evidence ? files.qualification_evidence.name : "Certificates or evidence up to 8MB."}</div>
                {fieldError("qualification_evidence")}
              </div>
            </div>

            <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
              <label>
                Company
                <input tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => set("company", e.target.value)} />
              </label>
            </div>

            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "start", gap: 10, color: "#334155" }}><input type="checkbox" checked={form.confirm_accurate} onChange={(e) => set("confirm_accurate", e.target.checked)} /><span>I confirm that the information supplied is accurate.</span></label>
              {fieldError("confirm_accurate")}
              <label style={{ display: "flex", alignItems: "start", gap: 10, color: "#334155" }}><input type="checkbox" checked={form.consent_review_store} onChange={(e) => set("consent_review_store", e.target.checked)} /><span>I consent to JDScience reviewing and storing this application.</span></label>
              {fieldError("consent_review_store")}
              <label style={{ display: "flex", alignItems: "start", gap: 10, color: "#334155" }}><input type="checkbox" checked={form.consent_public_profile} onChange={(e) => set("consent_public_profile", e.target.checked)} /><span>I agree that an approved profile may be displayed publicly.</span></label>
              {fieldError("consent_public_profile")}
              <TermsAgreement id="tutor-accept-terms" variant="tutor" checked={form.accept_terms} onChange={(value) => set("accept_terms", value)} disabled={saving} />
              {fieldError("accept_terms")}
              <div style={{ color: "#64748b", fontSize: 14 }}>
                Read our <a href="#tutor-privacy-policy" onClick={(e) => { e.preventDefault(); setPrivacyExpanded((current) => !current); }} style={{ color: TEAL, fontWeight: 700 }}>privacy policy</a> before submitting.
              </div>
              {privacyExpanded && <div id="tutor-privacy-policy" style={{ borderRadius: 14, background: "#f8fafc", padding: 14, color: "#475569", lineHeight: 1.65, fontSize: 14 }}>JDScience stores tutor application information so applications can be reviewed, approved, rejected or suspended by administrators. Private information such as your email address, phone number, CV, uploaded evidence and internal admin notes is kept out of the public tutor directory.</div>}
            </div>
          </div>

          {submitError && <div style={{ color: "#b91c1c", fontWeight: 700 }}>{submitError}</div>}
          {success && <div style={{ color: "#166534", fontWeight: 700 }}>{success}</div>}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "#64748b", fontSize: 13 }}>Applications are saved as pending until approved by JDScience.</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={onClose} style={{ padding: "12px 16px", borderRadius: 14, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", cursor: "pointer", fontWeight: 700 }}>Close</button>
              <button type="submit" disabled={saving || !form.accept_terms} style={{ padding: "12px 18px", borderRadius: 14, border: "none", background: saving || !form.accept_terms ? "#94a3b8" : TEAL, color: "#fff", cursor: saving || !form.accept_terms ? "default" : "pointer", fontWeight: 800 }}>{saving ? "Submitting…" : "Submit Application"}</button>
            </div>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}

/* --------------------------- VIDEO / CONTACT / FOOTER --------------------------- */
function VideoSection() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: "#071025", color: "#fff", padding: isMobile ? "40px 16px" : "56px 20px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: isMobile ? 24 : 38, margin: 0 }}>How JD Science Works</h2>
        <p style={{ color: "#cbd5e1", fontSize: isMobile ? 15 : 18, lineHeight: 1.6, maxWidth: 760, margin: "12px auto 26px" }}>
          Watch this short introduction to see how learners use resources, past papers and tutoring support.
        </p>
        <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,.18)", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
          <video
            title="How JD Science Works"
            src={INTRO_VIDEO_SRC}
            controls
            muted
            playsInline
            preload="metadata"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", background: "#111827", filter: "brightness(1.22) contrast(1.04) saturate(1.06)" }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const isMobile = useIsMobile();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "",
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    if (sending) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (!name || !email || !subject || !message) {
      setError("Please complete name, email, subject and message.");
      setSuccess("");
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const resp = await fetch("/api/send-contact-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          company: form.company,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to send message.");
      }

      setSuccess("Thanks. Your message has been sent and we will reply soon.");
      setForm({ name: "", email: "", subject: "", message: "", company: "" });
    } catch (err) {
      setError(err.message || "Something went wrong while sending your message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section style={{ padding: isMobile ? "32px 16px" : "48px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ color: "#0f172a", fontSize: isMobile ? 24 : 28 }}>Get in Touch</h2>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 16, marginTop: 20, alignItems: "start" }}>
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
          <form onSubmit={submit} style={{ position: "relative", gridColumn: isMobile ? "auto" : "1 / -1", background: "#f8fafc", borderRadius: 12, padding: isMobile ? 16 : 20, textAlign: "left", boxShadow: "0 4px 14px rgba(0,0,0,.04)" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 6 }}>Name</label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" style={inp} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 6 }}>Email address</label>
                <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" style={inp} />
              </div>
              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 6 }}>Subject</label>
                <input required value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="How can we help?" style={inp} />
              </div>
              <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
                <label style={{ display: "block", fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 6 }}>Message</label>
                <textarea required rows={5} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Write your message here..." style={inp} />
              </div>
            </div>

            <div style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
              <label>
                Company
                <input tabIndex={-1} autoComplete="off" value={form.company} onChange={(e) => set("company", e.target.value)} />
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
              <button type="submit" disabled={sending} style={{ padding: "12px 18px", minHeight: 48, borderRadius: 8, background: sending ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: sending ? "default" : "pointer", fontWeight: 800, width: isMobile ? "100%" : "auto" }}>
                {sending ? "Sending…" : "Send Message"}
              </button>
              {success && <span style={{ color: "#166534", fontSize: 14 }}>{success}</span>}
              {error && <span style={{ color: "#b91c1c", fontSize: 14 }}>{error}</span>}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer({ onContact, onTutor, onAdvice, onPapers, onWorksheets, onTutors, onHome }) {
  const isMobile = useIsMobile();
  const footerLink = { fontSize: 14, marginTop: 8, color: "#cbd5e1", textDecoration: "none", display: "block" };
  return (
    <footer className="site-footer" style={{ background: "#0f172a", color: "#cbd5e1", padding: isMobile ? "28px 16px 32px" : "32px 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px,1fr))", gap: isMobile ? 28 : 24 }}>
        <div>
          <a href="/" onClick={(e) => { e.preventDefault(); onHome?.(); }} style={{ fontWeight: 800, color: "#fff", fontSize: 18, textDecoration: "none" }}>jdscience.co.uk</a>
          <p style={{ fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>Free science &amp; maths resources and expert tutoring for 11+, GCSE/IGCSE, A-Level, T-Level and BTEC.</p>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#fff" }}>Resources</div>
          <a href="/about/" style={footerLink}>About JD Science</a>
          <a href="/terms/" style={footerLink}>Terms and Conditions</a>
          <a href="/tutors/joseph-danso/" style={footerLink}>Joseph Danso</a>
          <a href="/resources/" style={footerLink}>Resource pages</a>
          <a href="/resources/gcse/chemistry/" style={footerLink}>GCSE Chemistry</a>
          <a href="/papers" onClick={(e) => { e.preventDefault(); onPapers?.(); }} style={footerLink}>Past papers</a>
          <a href="/papers" onClick={(e) => { e.preventDefault(); onWorksheets ? onWorksheets() : onPapers?.(); }} style={footerLink}>Topic worksheets</a>
          <a href="/tutors" onClick={(e) => { e.preventDefault(); onTutors?.(); }} style={footerLink}>Find a tutor</a>
          {RES_TYPES.map((r) => (
            <a key={r} href="/papers" onClick={(e) => { e.preventDefault(); onPapers?.(); }} style={footerLink}>{r}</a>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#fff" }}>Contact</div>
          <div style={{ fontSize: 14, marginTop: 8 }}><a href="mailto:info@jdscience.co.uk" style={{ color: "#cbd5e1", textDecoration: "none" }}>📧 info@jdscience.co.uk</a></div>
          <div style={{ fontSize: 14, marginTop: 8 }}><a href="tel:07466142805" style={{ color: "#cbd5e1", textDecoration: "none" }}>📞 07466 142805</a></div>
          <div className="stack-on-mobile" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <button type="button" onClick={onContact} style={{ padding: "12px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.18)", background: "transparent", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Contact Form</button>
            {onAdvice && <button type="button" onClick={onAdvice} style={{ padding: "12px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Advice &amp; News</button>}
            <button type="button" onClick={onTutor} style={{ padding: "12px 12px", borderRadius: 10, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.06)", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Become a Tutor</button>
          </div>
        </div>
      </div>
      <div style={{ textAlign: "center", color: "#64748b", marginTop: 24, fontSize: 13 }}>© {new Date().getFullYear()} jdscience.co.uk — All rights reserved. <a href="/terms/" style={{ color: "#94a3b8" }}>Terms and Conditions</a></div>
    </footer>
  );
}

/* ------------------------------ AUTH MODAL -------------------------------- */
function AdminLoginForm({ onCancel }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (res.error) {
        setError(res.error.message);
        return;
      }
      const signedInEmail = res.data?.session?.user?.email;
      if (!ADMIN_EMAILS.includes(signedInEmail)) {
        await supabase.auth.signOut();
        setError("This account is not authorised for the admin dashboard.");
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, padding: 16 }}>
      <form onSubmit={submit} style={{ background: "#fff", borderRadius: 16, padding: 28, width: "min(400px,92vw)", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 20px 50px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Admin login</h2>
            <div style={{ color: "#64748b", fontSize: 13 }}>Sign in to open the bookings dashboard</div>
          </div>
        </div>
        <input autoFocus style={inp} type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={inp} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>}
        <button type="submit" disabled={busy} style={{ padding: 12, borderRadius: 8, background: busy ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: busy ? "default" : "pointer", fontWeight: 800 }}>
          {busy ? "Signing in…" : "Open dashboard"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ textAlign: "center", color: TEAL, background: "none", border: 0, cursor: "pointer", fontSize: 14 }}>
            ← Return to website
          </button>
        )}
      </form>
    </div>
  );
}

function readAdminRoute() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("admin") === "1" || window.location.hash === "#admin";
  } catch {
    return false;
  }
}

function writeAdminRoute(enabled) {
  try {
    const url = new URL(window.location.href);
    if (enabled) url.searchParams.set("admin", "1");
    else url.searchParams.delete("admin");
    if (url.hash === "#admin") url.hash = "";
    const next = `${url.pathname}${url.search}${url.hash}` || "/";
    window.history.pushState({}, "", next);
  } catch {
    /* ignore */
  }
}

/* ------------------------------ ADMIN DASHBOARD --------------------------- */
function applicationToEditForm(t) {
  const subjects = Array.isArray(t.subjects_taught) && t.subjects_taught.length
    ? t.subjects_taught.map((item) => String(item || "").trim()).filter(Boolean)
    : (t.subject_specialism ? [t.subject_specialism] : []);
  const levels = Array.isArray(t.levels_taught) && t.levels_taught.length
    ? t.levels_taught.map((item) => String(item || "").trim()).filter(Boolean)
    : String(t.level_taught || "").split(/,|\n/).map((item) => item.trim()).filter(Boolean);
  const mode = String(t.teaching_mode || "").toLowerCase();
  return {
    tutor_name: t.tutor_name || "",
    email_address: t.email_address || "",
    telephone_number: t.telephone_number || "",
    location: t.location || "",
    subjects_taught: subjects,
    subjects_other: t.subjects_other || "",
    levels_taught: levels,
    levels_other: t.levels_other || "",
    exam_boards_taught: t.exam_boards_taught || "",
    highest_relevant_qualification: t.highest_relevant_qualification || t.qualifications || "",
    teaching_qualifications: t.teaching_qualifications || "",
    professional_memberships: t.professional_memberships || "",
    years_experience: t.years_experience || "",
    current_professional_role: t.current_professional_role || "",
    short_professional_biography: t.short_professional_biography || t.bio || "",
    tutoring_approach: t.tutoring_approach || "",
    teaching_mode: ["online", "face-to-face", "both"].includes(mode) ? mode : "online",
    availability_summary: t.availability_summary || "",
    rate_display: t.rate_display || (t.hourly_rate != null ? String(t.hourly_rate) : ""),
  };
}

function AdminDashboard({ onClose, onSiteLogout }) {
  const [password, setPassword] = useState(() => {
    try { return sessionStorage.getItem("jd_admin_pw") || ""; } catch { return ""; }
  });
  const [authed, setAuthed] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusSavingId, setStatusSavingId] = useState(null);
  const [error, setError] = useState("");
  const [tutorApplications, setTutorApplications] = useState([]);
  const [tutorSavingId, setTutorSavingId] = useState(null);
  const [tutorNotes, setTutorNotes] = useState({});
  const [expandedTutorId, setExpandedTutorId] = useState(null);
  const [editingTutorId, setEditingTutorId] = useState(null);
  const [tutorEdits, setTutorEdits] = useState(null);
  const [tutorSaveMessage, setTutorSaveMessage] = useState("");

  async function load(pw) {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/admin-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(
          data?.error || (resp.status === 401 ? "Incorrect password." : "Failed to load bookings.")
        );
      }
      setBookings(data.bookings || []);
      setAuthed(true);
      try { sessionStorage.setItem("jd_admin_pw", pw); } catch { /* ignore */ }

      const tutorResp = await fetch("/api/admin-tutor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const tutorData = await tutorResp.json().catch(() => ({}));
      if (!tutorResp.ok) {
        throw new Error(tutorData?.error || "Failed to load tutor applications.");
      }
      setTutorApplications(tutorData.applications || []);
      setTutorNotes(Object.fromEntries((tutorData.applications || []).map((item) => [String(item.id), item.admin_note || ""])));
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load if a password was remembered for this browser session.
  useEffect(() => {
    let saved = null;
    try { saved = sessionStorage.getItem("jd_admin_pw"); } catch { /* ignore */ }
    if (saved) load(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function submit(e) {
    e.preventDefault();
    if (!password) { setError("Please enter the admin password."); return; }
    load(password);
  }

  function logout() {
    try { sessionStorage.removeItem("jd_admin_pw"); } catch { /* ignore */ }
    setAuthed(false);
    setBookings([]);
    setTutorApplications([]);
    setPassword("");
    setEditingTutorId(null);
    setTutorEdits(null);
    setTutorSaveMessage("");
  }

  async function updateTutorStatus(application, nextStatus) {
    if (!application?.id) {
      setError("This tutor application cannot be updated because it has no ID.");
      return;
    }

    const applicationId = String(application.id);
    const previousStatus = application.profile_status || "pending";
    const noteForApplication = tutorNotes[applicationId] || "";
    setError("");
    setTutorSavingId(applicationId);

    setTutorApplications((rows) => rows.map((row) => (
      String(row.id) === applicationId ? { ...row, profile_status: nextStatus } : row
    )));

    try {
      const resp = await fetch("/api/update-tutor-profile-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id: application.id,
          profile_status: nextStatus,
          is_published: nextStatus === "approved",
          admin_note: noteForApplication,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to update tutor profile status.");
      }

      if (data?.application) {
        setTutorApplications((rows) => rows.map((row) => (
          String(row.id) === applicationId ? { ...row, ...data.application } : row
        )));
        setTutorNotes((current) => ({ ...current, [applicationId]: data.application.admin_note || noteForApplication }));
      }
    } catch (err) {
      setTutorApplications((rows) => rows.map((row) => (
        String(row.id) === applicationId ? { ...row, profile_status: previousStatus } : row
      )));
      setError(err.message || "Failed to update tutor profile status.");
    } finally {
      setTutorSavingId(null);
    }
  }

  function startEditTutor(application) {
    if (!application?.id) return;
    const applicationId = String(application.id);
    setExpandedTutorId(applicationId);
    setEditingTutorId(applicationId);
    setTutorEdits(applicationToEditForm(application));
    setTutorSaveMessage("");
    setError("");
  }

  function cancelEditTutor() {
    setEditingTutorId(null);
    setTutorEdits(null);
    setTutorSaveMessage("");
  }

  function setTutorEdit(key, value) {
    setTutorEdits((current) => ({ ...(current || {}), [key]: value }));
  }

  function toggleTutorEditChoice(key, item) {
    setTutorEdits((current) => {
      const list = Array.isArray(current?.[key]) ? current[key] : [];
      return {
        ...(current || {}),
        [key]: list.includes(item) ? list.filter((value) => value !== item) : [...list, item],
      };
    });
  }

  async function saveTutorProfile(application, { publish = false } = {}) {
    if (!application?.id || !tutorEdits) {
      setError("Open Edit on this tutor profile before saving.");
      return;
    }

    const applicationId = String(application.id);
    setError("");
    setTutorSaveMessage("");
    setTutorSavingId(applicationId);

    try {
      const resp = await fetch("/api/update-tutor-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id: application.id,
          publish,
          admin_note: tutorNotes[applicationId] || "",
          ...tutorEdits,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to update tutor profile.");
      }

      if (data?.application) {
        setTutorApplications((rows) => rows.map((row) => (
          String(row.id) === applicationId ? { ...row, ...data.application } : row
        )));
        setTutorNotes((current) => ({ ...current, [applicationId]: data.application.admin_note || tutorNotes[applicationId] || "" }));
        setTutorEdits(applicationToEditForm(data.application));
      }

      setTutorSaveMessage(publish ? "Profile saved and published." : "Profile saved.");
      if (publish) setEditingTutorId(null);
    } catch (err) {
      setError(err.message || "Failed to update tutor profile.");
    } finally {
      setTutorSavingId(null);
    }
  }

  async function updateBookingStatus(booking, nextStatus) {
    if (!booking?.id) {
      setError("This booking cannot be updated because it has no ID.");
      return;
    }

    const bookingId = String(booking.id);
    const previousStatus = booking.status || "pending";
    setError("");
    setStatusSavingId(bookingId);

    // Optimistic UI update so the badge changes immediately.
    setBookings((rows) => rows.map((row) => (
      String(row.id) === bookingId ? { ...row, status: nextStatus } : row
    )));

    try {
      const resp = await fetch("/api/update-booking-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id: booking.id,
          status: nextStatus,
        }),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || "Failed to update booking status.");
      }

      if (data?.booking) {
        setBookings((rows) => rows.map((row) => (
          String(row.id) === bookingId ? { ...row, ...data.booking } : row
        )));
      }
    } catch (err) {
      // Revert optimistic status on error.
      setBookings((rows) => rows.map((row) => (
        String(row.id) === bookingId ? { ...row, status: previousStatus } : row
      )));
      setError(err.message || "Failed to update booking status.");
    } finally {
      setStatusSavingId(null);
    }
  }

  const total = bookings.length;
  const trials = bookings.filter((b) => String(b.session_type || "").toLowerCase() === "trial").length;
  const paid = total - trials;
  const pendingTutors = tutorApplications.filter((t) => (t.profile_status || "pending") === "pending").length;
  const approvedTutors = tutorApplications.filter((t) => (t.profile_status || "pending") === "approved").length;
  const publishedTutors = tutorApplications.filter((t) => Boolean(t.is_published) && (t.profile_status || "pending") === "approved").length;

  const fmtDate = (d) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString("en-GB", { timeZone: "Europe/London" }); } catch { return d; }
  };
  const fmtAmount = (a) => (typeof a === "number" && a > 0 ? `£${a.toFixed(2)}` : "Free");

  const th = { textAlign: "left", padding: "10px 12px", fontSize: 12, textTransform: "uppercase", letterSpacing: ".03em", color: "#64748b", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" };
  const td = { padding: "10px 12px", fontSize: 14, color: "#0f172a", borderBottom: "1px solid #eef2f7", verticalAlign: "top" };

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`, padding: 16 }}>
        <form onSubmit={submit} style={{ background: "#fff", borderRadius: 16, padding: 28, width: "min(400px,92vw)", display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 20px 50px rgba(0,0,0,.25)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>Admin — Bookings</h2>
              <div style={{ color: "#64748b", fontSize: 13 }}>Enter your password to continue</div>
            </div>
          </div>
          <input autoFocus type="password" placeholder="Admin password" value={password} onChange={(e) => setPassword(e.target.value)} style={inp} />
          {error && <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding: 12, borderRadius: 8, background: loading ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: loading ? "default" : "pointer", fontWeight: 800 }}>
            {loading ? "Checking…" : "View bookings"}
          </button>
          {onClose ? (
            <button type="button" onClick={onClose} style={{ textAlign: "center", color: TEAL, background: "none", border: 0, cursor: "pointer", fontSize: 14 }}>
              ← Return to website
            </button>
          ) : (
            <a href="/" style={{ textAlign: "center", color: TEAL, textDecoration: "none", fontSize: 14 }}>← Back to website</a>
          )}
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `linear-gradient(135deg,${TEAL},${TEAL_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>JD</div>
          <div style={{ fontWeight: 800 }}>Bookings Dashboard</div>
        </div>
        <div className="stack-on-mobile" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => load(password)} disabled={loading} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700 }}>{loading ? "Refreshing…" : "↻ Refresh"}</button>
          {onClose ? (
            <button onClick={onClose} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", cursor: "pointer", fontWeight: 700 }}>
              Close Admin Dashboard
            </button>
          ) : (
            <a href="/" style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a", textDecoration: "none", fontWeight: 700 }}>View site</a>
          )}
          {onSiteLogout && (
            <button onClick={onSiteLogout} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #dbeafe", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer", fontWeight: 700 }}>
              Logout Website Session
            </button>
          )}
          <button onClick={logout} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>Log out</button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px" }}>
        {error && (
          <div style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", fontSize: 14 }}>
            {error}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
          {[["Total bookings", total], ["Paid bookings", paid], ["Free trials", trials], ["Pending tutor apps", pendingTutors], ["Approved tutors", approvedTutors], ["Published tutors", publishedTutors]].map(([label, value]) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 4px 14px rgba(0,0,0,.05)" }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>{label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: TEAL_DARK }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,.05)", overflow: "auto" }}>
          {bookings.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>No bookings yet.</div>
          ) : (
            <table className="admin-bookings-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
  <thead>
    <tr>
      <th style={th}>Date</th>
      <th style={th}>Name</th>
      <th style={th}>Email</th>
      <th style={th}>Phone</th>
      <th style={th}>Level</th>
      <th style={th}>Subject</th>
      <th style={th}>Type</th>
      <th style={th}>Payment</th>
      <th style={th}>Amount</th>
      <th style={th}>Status</th>
      <th style={th}>Actions</th>
    </tr>
  </thead>

  <tbody>
    {bookings.map((b, i) => (
      <tr key={b.id || i}>
        <td data-label="Date" style={td}>{fmtDate(b.created_at)}</td>

        <td data-label="Name" style={{ ...td, fontWeight: 700 }}>
          {b.student_name || "-"}
        </td>

        <td data-label="Email" style={td}>
          {b.student_email ? (
            <a href={`mailto:${b.student_email}`} style={{ color: TEAL }}>
              {b.student_email}
            </a>
          ) : (
            "-"
          )}
        </td>

        <td data-label="Phone" style={td}>{b.phone || "-"}</td>
        <td data-label="Level" style={td}>{b.level || "-"}</td>
        <td data-label="Subject" style={td}>{b.subject || "-"}</td>
        <td data-label="Type" style={td}>{b.session_type || "-"}</td>
        <td data-label="Payment" style={td}>{b.payment_status || b.stripe_payment_status || (typeof b.amount === "number" && b.amount > 0 ? "paid" : "free")}</td>
        <td data-label="Amount" style={td}>{fmtAmount(b.amount)}</td>

        <td data-label="Status" style={td}>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              background:
                b.status === "confirmed"
                  ? "#dcfce7"
                  : b.status === "rescheduled"
                  ? "#fff7ed"
                  : b.status === "rejected"
                  ? "#fee2e2"
                  : b.status === "completed"
                  ? "#e0f2fe"
                  : "#fef3c7",
              color:
                b.status === "confirmed"
                  ? "#166534"
                  : b.status === "rescheduled"
                  ? "#9a3412"
                  : b.status === "rejected"
                  ? "#991b1b"
                  : b.status === "completed"
                  ? "#075985"
                  : "#92400e",
            }}
          >
            {b.status || "pending"}
          </span>
        </td>

        <td data-label="Actions" style={td}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => updateBookingStatus(b, "confirmed")}
              disabled={loading || statusSavingId === String(b.id) || !b.id}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "1px solid #bbf7d0",
                background: "#dcfce7",
                color: "#166534",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Confirm
            </button>
            <a
              href={`mailto:${b.student_email}?subject=JD Science Booking Confirmed&body=Dear ${b.student_name || "Student"},%0D%0A%0D%0AThank you for your booking enquiry.%0D%0A%0D%0AI am pleased to confirm your ${b.subject || ""} session.%0D%0A%0D%0APlease let me know if there are any specific topics you would like covered.%0D%0A%0D%0AKind regards,%0D%0AJoseph%0D%0AJD Science`}
              style={{ color: TEAL, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
            >
              Email
            </a>

            <button
              type="button"
              onClick={() => updateBookingStatus(b, "rescheduled")}
              disabled={loading || statusSavingId === String(b.id) || !b.id}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "1px solid #fde68a",
                background: "#fef3c7",
                color: "#92400e",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Change
            </button>
            <a
              href={`mailto:${b.student_email}?subject=JD Science Booking - Alternative Time&body=Dear ${b.student_name || "Student"},%0D%0A%0D%0AThank you for your booking enquiry.%0D%0A%0D%0AThe requested time is not currently available. I can offer an alternative time. Please let me know your availability.%0D%0A%0D%0AKind regards,%0D%0AJoseph%0D%0AJD Science`}
              style={{ color: TEAL, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
            >
              Email
            </a>

            <button
              type="button"
              onClick={() => updateBookingStatus(b, "rejected")}
              disabled={loading || statusSavingId === String(b.id) || !b.id}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "1px solid #fecaca",
                background: "#fee2e2",
                color: "#991b1b",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Reject
            </button>
            <a
              href={`mailto:${b.student_email}?subject=JD Science Booking Update&body=Dear ${b.student_name || "Student"},%0D%0A%0D%0AThank you for your booking enquiry.%0D%0A%0D%0AUnfortunately, I am unable to accept the requested booking at this time.%0D%0A%0D%0AKind regards,%0D%0AJoseph%0D%0AJD Science`}
              style={{ color: TEAL, fontSize: 12, fontWeight: 700, textDecoration: "none" }}
            >
              Email
            </a>

            <button
              type="button"
              onClick={() => updateBookingStatus(b, "completed")}
              disabled={loading || statusSavingId === String(b.id) || !b.id}
              style={{
                padding: "5px 8px",
                borderRadius: 6,
                border: "1px solid #bae6fd",
                background: "#e0f2fe",
                color: "#075985",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Completed
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
          )}
        </div>

        <div style={{ marginTop: 20, background: "#fff", borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,.05)", overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid #e2e8f0", fontWeight: 800, color: "#0f172a" }}>Tutor Applications Review</div>
          {tutorApplications.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "#64748b" }}>No tutor applications yet.</div>
          ) : (
            <div style={{ padding: 16, display: "grid", gap: 14 }}>
              {tutorApplications.map((t, i) => {
                const applicationId = String(t.id || i);
                const expanded = expandedTutorId === applicationId;
                const statusColor = t.profile_status === "approved" ? ["#dcfce7", "#166534"] : t.profile_status === "rejected" ? ["#fee2e2", "#991b1b"] : t.profile_status === "suspended" ? ["#e0f2fe", "#075985"] : ["#fef3c7", "#92400e"];
                return (
                  <article key={applicationId} style={{ borderRadius: 16, border: "1px solid #e2e8f0", background: "#fff", padding: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "start", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", gap: 14, alignItems: "start", flex: 1, minWidth: 0 }}>
                        {t.profile_photo_url ? <img src={t.profile_photo_url} alt={`${t.tutor_name || "Tutor"} application`} style={{ width: 74, height: 74, borderRadius: 18, objectFit: "cover", background: "#e2e8f0" }} /> : <div style={{ width: 74, height: 74, borderRadius: 18, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800 }}>{avatarInitials(t.tutor_name)}</div>}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <h3 style={{ margin: 0, color: "#0f172a" }}>{t.tutor_name || "Unnamed tutor"}</h3>
                            <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800, background: statusColor[0], color: statusColor[1] }}>{t.profile_status || "pending"}</span>
                            {t.is_published && <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 12, fontWeight: 800, background: "#dcfce7", color: "#166534" }}>published</span>}
                          </div>
                          <div style={{ marginTop: 6, color: TEAL_DARK, fontWeight: 700 }}>{formatList(t.subjects_taught || [], t.subject_specialism || "-")}</div>
                          <div style={{ marginTop: 6, color: "#475569", fontSize: 14 }}>{formatList(t.levels_taught || [], t.level_taught || "-")} · {t.teaching_mode || "-"} · {t.location || "-"}</div>
                          <div style={{ marginTop: 6, color: "#475569", fontSize: 14 }}>{t.rate_display || (t.contact_for_quote ? "Contact for quote" : "Rate not supplied")}</div>
                          <div style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>Submitted {fmtDate(t.created_at)}</div>
                        </div>
                      </div>
                      <div className="stack-on-mobile" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => {
                          if (expanded) {
                            setExpandedTutorId(null);
                            if (editingTutorId === applicationId) cancelEditTutor();
                          } else {
                            setExpandedTutorId(applicationId);
                          }
                        }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700 }}>{expanded ? "Hide details" : "Inspect"}</button>
                        <button type="button" onClick={() => (editingTutorId === applicationId ? cancelEditTutor() : startEditTutor(t))} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #99f6e4", background: editingTutorId === applicationId ? "#ccfbf1" : "#f0fdfa", color: TEAL_DARK, cursor: "pointer", fontWeight: 700 }}>{editingTutorId === applicationId ? "Cancel edit" : "Edit"}</button>
                        <button type="button" onClick={() => updateTutorStatus(t, "approved")} disabled={loading || tutorSavingId === applicationId || !t.id} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #bbf7d0", background: "#dcfce7", color: "#166534", cursor: "pointer", fontWeight: 700 }}>Approve</button>
                        <button type="button" onClick={() => updateTutorStatus({ ...t, is_published: true }, "approved")} disabled={loading || tutorSavingId === applicationId || !t.id || (t.profile_status === "approved" && t.is_published)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #86efac", background: "#f0fdf4", color: "#166534", cursor: "pointer", fontWeight: 700 }}>Publish</button>
                        <button type="button" onClick={() => updateTutorStatus(t, "suspended")} disabled={loading || tutorSavingId === applicationId || !t.id || !t.is_published} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#1d4ed8", cursor: "pointer", fontWeight: 700 }}>Unpublish</button>
                        <button type="button" onClick={() => updateTutorStatus(t, "rejected")} disabled={loading || tutorSavingId === applicationId || !t.id} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #fecaca", background: "#fee2e2", color: "#991b1b", cursor: "pointer", fontWeight: 700 }}>Reject</button>
                        <button type="button" onClick={() => updateTutorStatus(t, "suspended")} disabled={loading || tutorSavingId === applicationId || !t.id} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #bae6fd", background: "#e0f2fe", color: "#075985", cursor: "pointer", fontWeight: 700 }}>Suspend</button>
                      </div>
                    </div>

                    {expanded && (
                      <div style={{ marginTop: 16, borderTop: "1px solid #eef2f7", paddingTop: 16, display: "grid", gap: 14 }}>
                        {editingTutorId === applicationId && tutorEdits ? (
                          <form onSubmit={(e) => { e.preventDefault(); saveTutorProfile(t, { publish: false }); }} style={{ display: "grid", gap: 14 }}>
                            <div style={{ fontWeight: 800, color: "#0f172a" }}>Edit public profile</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Name</span><input value={tutorEdits.tutor_name} onChange={(e) => setTutorEdit("tutor_name", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Email</span><input type="email" value={tutorEdits.email_address} onChange={(e) => setTutorEdit("email_address", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Phone</span><input value={tutorEdits.telephone_number} onChange={(e) => setTutorEdit("telephone_number", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Location</span><input value={tutorEdits.location} onChange={(e) => setTutorEdit("location", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Hourly rate</span><input value={tutorEdits.rate_display} onChange={(e) => setTutorEdit("rate_display", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Teaching mode</span>
                                <select value={tutorEdits.teaching_mode} onChange={(e) => setTutorEdit("teaching_mode", e.target.value)} style={inp}>
                                  <option value="online">Online</option>
                                  <option value="face-to-face">Face-to-face</option>
                                  <option value="both">Both</option>
                                </select>
                              </label>
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8 }}>Subjects taught</div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {[...new Set([...TUTOR_SUBJECT_OPTIONS, ...(tutorEdits.subjects_taught || [])])].map((item) => (
                                  <label key={item} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, border: "1px solid #dbe3ef", background: (tutorEdits.subjects_taught || []).includes(item) ? "#ecfeff" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                                    <input type="checkbox" checked={(tutorEdits.subjects_taught || []).includes(item)} onChange={() => toggleTutorEditChoice("subjects_taught", item)} />
                                    {item}
                                  </label>
                                ))}
                              </div>
                              {(tutorEdits.subjects_taught || []).includes("Other") && <div style={{ marginTop: 10 }}><input placeholder="Other subject" value={tutorEdits.subjects_other} onChange={(e) => setTutorEdit("subjects_other", e.target.value)} style={inp} /></div>}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#334155", marginBottom: 8 }}>Levels taught</div>
                              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                {[...new Set([...TUTOR_LEVEL_OPTIONS, ...(tutorEdits.levels_taught || [])])].map((item) => (
                                  <label key={item} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, border: "1px solid #dbe3ef", background: (tutorEdits.levels_taught || []).includes(item) ? "#ecfeff" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                                    <input type="checkbox" checked={(tutorEdits.levels_taught || []).includes(item)} onChange={() => toggleTutorEditChoice("levels_taught", item)} />
                                    {item}
                                  </label>
                                ))}
                              </div>
                              {(tutorEdits.levels_taught || []).includes("Other") && <div style={{ marginTop: 10 }}><input placeholder="Other level" value={tutorEdits.levels_other} onChange={(e) => setTutorEdit("levels_other", e.target.value)} style={inp} /></div>}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Exam boards</span><input value={tutorEdits.exam_boards_taught} onChange={(e) => setTutorEdit("exam_boards_taught", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Years of experience</span><input value={tutorEdits.years_experience} onChange={(e) => setTutorEdit("years_experience", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Current role</span><input value={tutorEdits.current_professional_role} onChange={(e) => setTutorEdit("current_professional_role", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Availability</span><input value={tutorEdits.availability_summary} onChange={(e) => setTutorEdit("availability_summary", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Highest qualification</span><input value={tutorEdits.highest_relevant_qualification} onChange={(e) => setTutorEdit("highest_relevant_qualification", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6 }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Teaching qualifications</span><input value={tutorEdits.teaching_qualifications} onChange={(e) => setTutorEdit("teaching_qualifications", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Professional memberships</span><input value={tutorEdits.professional_memberships} onChange={(e) => setTutorEdit("professional_memberships", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Biography</span><textarea rows={4} value={tutorEdits.short_professional_biography} onChange={(e) => setTutorEdit("short_professional_biography", e.target.value)} style={inp} /></label>
                              <label style={{ display: "grid", gap: 6, gridColumn: "1 / -1" }}><span style={{ fontWeight: 700, color: "#334155", fontSize: 13 }}>Tutoring approach</span><textarea rows={4} value={tutorEdits.tutoring_approach} onChange={(e) => setTutorEdit("tutoring_approach", e.target.value)} style={inp} /></label>
                            </div>
                            {tutorSaveMessage && <div style={{ color: "#166534", fontWeight: 700 }}>{tutorSaveMessage}</div>}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button type="submit" disabled={loading || tutorSavingId === applicationId || !t.id} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 800 }}>{tutorSavingId === applicationId ? "Saving…" : "Save changes"}</button>
                              <button type="button" onClick={() => saveTutorProfile(t, { publish: true })} disabled={loading || tutorSavingId === applicationId || !t.id} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: TEAL, color: "#fff", cursor: "pointer", fontWeight: 800 }}>{tutorSavingId === applicationId ? "Publishing…" : "Save & publish"}</button>
                              <button type="button" onClick={cancelEditTutor} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}><b>Email:</b><div style={{ marginTop: 8 }}><a href={`mailto:${t.email_address || ""}`} style={{ color: TEAL }}>{t.email_address || "Not supplied"}</a></div></div>
                          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}><b>Phone:</b><div style={{ marginTop: 8, color: "#475569" }}>{t.telephone_number || "Not supplied"}</div></div>
                          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}><b>Exam boards:</b><div style={{ marginTop: 8, color: "#475569" }}>{t.exam_boards_taught || "Not supplied"}</div></div>
                          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}><b>Experience:</b><div style={{ marginTop: 8, color: "#475569" }}>{t.years_experience || "Not supplied"}</div></div>
                          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}><b>Current role:</b><div style={{ marginTop: 8, color: "#475569" }}>{t.current_professional_role || "Not supplied"}</div></div>
                          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 14 }}><b>Availability:</b><div style={{ marginTop: 8, color: "#475569" }}>{t.availability_summary || "Not supplied"}</div></div>
                        </div>

                        <div style={{ display: "grid", gap: 12 }}>
                          <div><b>Highest qualification:</b><div style={{ marginTop: 6, color: "#475569", lineHeight: 1.65 }}>{t.highest_relevant_qualification || t.qualifications || "Not supplied"}</div></div>
                          <div><b>Teaching qualifications:</b><div style={{ marginTop: 6, color: "#475569", lineHeight: 1.65 }}>{t.teaching_qualifications || "Not supplied"}</div></div>
                          <div><b>Professional memberships:</b><div style={{ marginTop: 6, color: "#475569", lineHeight: 1.65 }}>{t.professional_memberships || "Not supplied"}</div></div>
                          <div><b>Biography:</b><div style={{ marginTop: 6, color: "#475569", lineHeight: 1.7 }}>{t.short_professional_biography || t.bio || "Not supplied"}</div></div>
                          <div><b>Tutoring approach:</b><div style={{ marginTop: 6, color: "#475569", lineHeight: 1.7 }}>{t.tutoring_approach || "Not supplied"}</div></div>
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                          {t.cv_url && <a href={t.cv_url} target="_blank" rel="noreferrer" style={{ padding: "9px 12px", borderRadius: 10, background: "#ecfeff", color: TEAL_DARK, textDecoration: "none", fontWeight: 700 }}>View CV</a>}
                          {t.qualification_evidence_url && <a href={t.qualification_evidence_url} target="_blank" rel="noreferrer" style={{ padding: "9px 12px", borderRadius: 10, background: "#ecfeff", color: TEAL_DARK, textDecoration: "none", fontWeight: 700 }}>View Qualification Evidence</a>}
                        </div>
                          </>
                        )}

                        <div>
                          <label style={{ display: "block", fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Internal administrative note</label>
                          <textarea rows={3} value={tutorNotes[applicationId] || ""} onChange={(e) => setTutorNotes((current) => ({ ...current, [applicationId]: e.target.value }))} style={inp} />
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                            <button type="button" onClick={() => updateTutorStatus(t, t.profile_status || "pending")} disabled={loading || tutorSavingId === applicationId || !t.id} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 700 }}>Save Note</button>
                            <button type="button" onClick={() => updateTutorStatus(t, "pending")} disabled={loading || tutorSavingId === applicationId || !t.id} style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #fde68a", background: "#fef3c7", color: "#92400e", cursor: "pointer", fontWeight: 700 }}>Mark Pending</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
        <AdminAdviceEditor password={password} />
      </div>
    </div>
  );
}

/* ---------------------------------- APP ----------------------------------- */
function resolvePapersFilters(query) {
  const level = query.level || null;
  const subjectOptions = level ? (SUBJECTS_BY_LEVEL[level] || []) : Object.values(SUBJECTS_BY_LEVEL).flat();
  const boardOptions = level ? (BOARDS_BY_LEVEL[level] || []) : Object.values(BOARDS_BY_LEVEL).flat();
  const subject = query.subject
    ? (subjectOptions.find((item) => item.toLowerCase() === query.subject.toLowerCase()) || query.subject)
    : null;
  const board = query.board
    ? (boardOptions.find((item) => item.toLowerCase() === query.board.toLowerCase()) || query.board)
    : null;
  return { level, subject, res: query.res || null, board };
}

function App() {
  const initialPapers = typeof window === "undefined" ? {} : resolvePapersFilters(parsePapersQuery(window.location.search));
  const [page, setPage] = useState(() => (typeof window === "undefined" ? "home" : pageFromPathname(window.location.pathname)));
  const [pickedSubject, setPickedSubject] = useState(initialPapers.subject || null);
  const [pickedLevel, setPickedLevel] = useState(initialPapers.level || null);
  const [pickedRes, setPickedRes] = useState(initialPapers.res || null);
  const [pickedBoard, setPickedBoard] = useState(initialPapers.board || null);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [resources, setResources] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authReason, setAuthReason] = useState("");
  const [resourceAuthPrompted, setResourceAuthPrompted] = useState(false);
  const [banner, setBanner] = useState(null); // { type: 'success'|'canceled', text }
  const [approvedTutors, setApprovedTutors] = useState([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [tutorsError, setTutorsError] = useState("");
  const [tutorApplicationOpen, setTutorApplicationOpen] = useState(false);
  const [selectedTutorSlug, setSelectedTutorSlug] = useState(null);
  const [adminRoute, setAdminRoute] = useState(readAdminRoute);
  const tutorTriggerRef = React.useRef(null);

  const isAdmin = ADMIN_EMAILS.includes(session?.user?.email);

  useEffect(() => {
    applyDocumentMeta(page, { noIndex: adminRoute });
  }, [page, adminRoute]);

  const goAdmin = () => {
    writeAdminRoute(true);
    setAdminRoute(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const leaveAdmin = () => {
    writeAdminRoute(false);
    setAdminRoute(false);
  };

  const openAuth = (mode = "login", reason = "") => {
    setAuthMode(mode === "register" ? "register" : "login");
    setAuthReason(reason || "");
    setAuthOpen(true);
  };

  useEffect(() => {
    loadResources();
    loadApprovedTutors();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    const onPopState = () => {
      setAdminRoute(readAdminRoute());
      setPage(pageFromPathname(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  // Show a confirmation banner after Stripe Checkout redirects back.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "true") {
        setBanner({
          type: "success",
          text: "Payment successful — thank you! Your booking is confirmed. We'll email you shortly to arrange the session.",
        });
        setPage("home");
        window.history.replaceState({}, "", "/");
        setTimeout(() => document.getElementById("book-anchor")?.scrollIntoView({ behavior: "smooth" }), 200);
      } else if (params.get("canceled") === "true") {
        setBanner({
          type: "canceled",
          text: "Payment was cancelled. No charge was made — you can try booking again whenever you're ready.",
        });
        setPage("home");
        window.history.replaceState({}, "", "/");
        setTimeout(() => document.getElementById("book-anchor")?.scrollIntoView({ behavior: "smooth" }), 200);
      } else if (params.get("verified") === "1") {
        setBanner({
          type: "success",
          text: "Your email is verified. You can now log in.",
        });
        params.delete("verified");
        const query = params.toString();
        window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash || ""}`);
        setAuthMode("login");
        setAuthReason("");
        setAuthOpen(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (session) setAuthOpen(false);
  }, [session]);

  useEffect(() => {
    syncSignedInCookie(Boolean(session));
  }, [session]);

  useEffect(() => {
    if (!RESOURCE_LOGIN_REQUIRED) {
      setResourceAuthPrompted(false);
      return;
    }
    if (!isResourceLibraryPage(page)) {
      setResourceAuthPrompted(false);
      return;
    }
    if (!authReady || session || authOpen || resourceAuthPrompted) return;
    setResourceAuthPrompted(true);
    openAuth(preferredVisitorAuthMode(), "resources");
  }, [authReady, session, page, authOpen, resourceAuthPrompted]);

  async function loadResources() {
    const staticItems = buildStaticResourceItems();
    const { data, error } = await supabase
      .from("resources").select("*").eq("published", true)
      .order("topic_order", { ascending: true }).order("title", { ascending: true });
    if (error) {
      setResources(mergeResourceCatalog([], staticItems));
      return;
    }
    setResources(mergeResourceCatalog(data || [], staticItems));
  }

  async function loadApprovedTutors() {
    setTutorsLoading(true);
    setTutorsError("");
    try {
      const resp = await fetch("/api/tutor-profiles");
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || "Failed to load tutor profiles.");
      setApprovedTutors(data.tutors || []);
    } catch (err) {
      setTutorsError(err.message || "Failed to load tutor profiles.");
      setApprovedTutors([]);
    } finally {
      setTutorsLoading(false);
    }
  }

  const navigate = (nextPage, { replace = false } = {}) => {
    setPage(nextPage);
    const nextPath = pathForPage(nextPage);
    if (typeof window !== "undefined" && window.location.pathname !== nextPath) {
      const nextUrl = `${nextPath}${window.location.search}${window.location.hash}`;
      if (replace) window.history.replaceState({ page: nextPage }, "", nextUrl);
      else window.history.pushState({ page: nextPage }, "", nextUrl);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goPapers = () => navigate("papers");
  const goResources = () => navigate("resources");
  const goTutors = () => navigate("tutors");
  const goHome = () => { leaveAdmin(); navigate("home"); };
  const handlePick = (lvl, subj) => { if (lvl) setPickedLevel(lvl); if (subj) setPickedSubject(subj); setPickedBoard(null); goPapers(); };
  const handleLevel = (lvl) => { setPickedLevel(lvl); setPickedSubject(null); setPickedBoard(null); goPapers(); };
  const handleResource = (res) => { setPickedRes(res); goPapers(); };
  const awaitingVisitorAuth = RESOURCE_LOGIN_REQUIRED && isResourceLibraryPage(page) && !authReady;
  const resourceLibraryLocked = RESOURCE_LOGIN_REQUIRED && isResourceLibraryPage(page) && authReady && !session;
  const openTutorApplication = () => setTutorApplicationOpen(true);
  const closeTutorApplication = () => setTutorApplicationOpen(false);
  const openTutorProfile = (slug) => setSelectedTutorSlug(slug);
  const closeTutorProfile = () => setSelectedTutorSlug(null);
  const handleBookTutor = () => {
    if (page !== "home") {
      navigate("home");
      setTimeout(() => document.getElementById("book-anchor")?.scrollIntoView({ behavior: "smooth" }), 120);
      return;
    }
    document.getElementById("book-anchor")?.scrollIntoView({ behavior: "smooth" });
  };
  const handleScroll = (target) => {
    const id = target === "contact" ? "contact-anchor" : target === "advice" ? "advice-anchor" : "book-anchor";
    if (page !== "home") { navigate("home"); setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 120); }
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    leaveAdmin();
  };

  if (adminRoute) {
    if (!authReady) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc", color: "#64748b", fontWeight: 700 }}>
          Opening admin dashboard…
        </div>
      );
    }
    if (session && isAdmin) {
      return <AdminDashboard onClose={goHome} onSiteLogout={logout} />;
    }
    if (session && !isAdmin) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#f8fafc" }}>
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: 24, width: "min(560px, 96vw)", textAlign: "center" }}>
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>Admin Access Required</h2>
            <p style={{ color: "#64748b", lineHeight: 1.65 }}>This account is signed in, but it is not authorised to open the admin dashboard.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
              <button type="button" onClick={async () => { await supabase.auth.signOut(); setSession(null); }} style={{ padding: "10px 14px", borderRadius: 10, border: "none", background: TEAL, color: "#fff", cursor: "pointer", fontWeight: 800 }}>
                Sign in with admin account
              </button>
              <button type="button" onClick={goHome} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", cursor: "pointer", fontWeight: 700 }}>
                Return to Website
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <AdminLoginForm onCancel={goHome} />;
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#0f172a", background: "#f8fafc", overflowX: "hidden", maxWidth: "100%" }}>
      <Navbar onHome={goHome} onPick={handlePick} onResource={handleResource} onScroll={handleScroll} onTutor={openTutorApplication} tutorButtonRef={tutorTriggerRef}
        onSearch={(q) => q && goPapers()} session={session} isAdmin={isAdmin}
        onAuth={openAuth} onLogout={logout} onAdminDashboard={goAdmin} />

      {banner && (
        <div
          role="status"
          style={{
            background: banner.type === "success" ? "#ecfdf5" : "#fff7ed",
            color: banner.type === "success" ? "#065f46" : "#9a3412",
            borderBottom: `1px solid ${banner.type === "success" ? "#a7f3d0" : "#fed7aa"}`,
            padding: "14px 16px",
            display: "flex",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontWeight: 600,
            flexWrap: "wrap",
          }}
        >
          <span>{banner.type === "success" ? "✅" : "ℹ️"} {banner.text}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            aria-label="Dismiss"
            style={{ background: "transparent", border: 0, cursor: "pointer", fontWeight: 800, color: "inherit", fontSize: 16 }}
          >
            ✕
          </button>
        </div>
      )}

      {page === "home" && (
        <main>
          <Hero onScroll={handleScroll} onBrowse={goPapers} />
          <BoardStrip />
          <OffersSection />
          <AdviceNewsSection />
          <LevelGrid onLevel={handleLevel} />
          <TutorProfiles tutors={approvedTutors} loading={tutorsLoading} error={tutorsError} onViewAll={goTutors} onViewProfile={openTutorProfile} onBook={handleBookTutor} />
          <div id="book-anchor"><Booking /></div>
          <div id="contact-anchor"><Contact /></div>
          <VideoSection />
        </main>
      )}

      {page === "papers" && (
        <main>
          {awaitingVisitorAuth ? (
            <section style={{ padding: "64px 16px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Checking your account…</section>
          ) : resourceLibraryLocked ? (
            <ResourceAccessGate
              returningVisitor={preferredVisitorAuthMode() === "login"}
              onRegister={() => openAuth("register", "resources")}
              onLogin={() => openAuth("login", "resources")}
              onHome={goHome}
            />
          ) : (
            <PastPapers subject={pickedSubject} level={pickedLevel} resType={pickedRes} board={pickedBoard}
              isAdmin={isAdmin} resources={resources} reload={loadResources} onBook={() => handleScroll("book")} />
          )}
        </main>
      )}

      {page === "resources" && (
        <main>
          {awaitingVisitorAuth ? (
            <section style={{ padding: "64px 16px", textAlign: "center", color: "#64748b", fontWeight: 700 }}>Checking your account…</section>
          ) : resourceLibraryLocked ? (
            <ResourceAccessGate
              returningVisitor={preferredVisitorAuthMode() === "login"}
              onRegister={() => openAuth("register", "resources")}
              onLogin={() => openAuth("login", "resources")}
              onHome={goHome}
            />
          ) : (
            <ResourceBrowser initialType={pickedRes} onBook={() => handleScroll("book")} />
          )}
        </main>
      )}

      {page === "tutors" && (
        <main>
          <TutorDirectory tutors={approvedTutors} loading={tutorsLoading} error={tutorsError} onBack={goHome} onViewProfile={openTutorProfile} onBook={handleBookTutor} />
        </main>
      )}

      {authOpen && <AuthModal key={`${authMode}-${authReason}`} initialMode={authMode} reason={authReason} close={() => setAuthOpen(false)} />}
      <TutorApplicationForm open={tutorApplicationOpen} onClose={closeTutorApplication} onSubmitted={loadApprovedTutors} triggerRef={tutorTriggerRef} />
      <TutorProfileModal slug={selectedTutorSlug} onClose={closeTutorProfile} onBook={handleBookTutor} triggerRef={tutorTriggerRef} />
      <Footer onContact={() => handleScroll("contact")} onTutor={openTutorApplication} onAdvice={() => handleScroll("advice")} onPapers={goPapers} onWorksheets={() => handleResource("Worksheets")} onTutors={goTutors} onHome={goHome} />
    </div>
  );
}

export default App;
