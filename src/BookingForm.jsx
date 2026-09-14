import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import TermsAgreement from "./TermsAgreement";
import TutorChoosingNotice from "./TutorChoosingNotice";
import { TERMS_ACCEPTANCE_ERROR, TERMS_VERSION } from "./termsAndConditions";
import {
  ANALYTICS_EVENTS,
  track,
} from "./analytics";
import {
  BOOKING_LEVEL_OPTIONS,
  BOOKING_SUBJECT_PLACEHOLDER,
  BOOKING_SUBJECT_REQUIRED_MESSAGE,
  BOOKING_UNKNOWN_LEVEL_MESSAGE,
  findTutoringServiceForLevel,
  isPremiumBookingLevel,
  resolveSubjectsForBookingLevel,
  validateBookingSelection,
} from "./bookingOptions";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

const inp = {
  padding: "11px 12px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  fontSize: 16,
  width: "100%",
  boxSizing: "border-box",
};

const bookingSelectStyle = {
  ...inp,
  minHeight: 48,
  appearance: "auto",
  WebkitAppearance: "menulist",
  MozAppearance: "menulist",
  position: "relative",
  zIndex: 2,
  backgroundColor: "#fff",
};

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setMobile(mq.matches);
    onChange();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    mq.addListener(onChange);
    return () => mq.removeListener(onChange);
  }, [breakpoint]);

  return mobile;
}

/**
 * Live homepage / #book-anchor booking form.
 * Level options come only from bookingOptions.js — never from tutoring_services labels.
 */
export default function BookingForm({
  loadServices,
  initialMobile,
} = {}) {
  const detectedMobile = useIsMobile();
  const isMobile = typeof initialMobile === "boolean" ? initialMobile : detectedMobile;
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    level: "GCSE/IGCSE",
    subject: "",
    message: "",
    sessionType: "single",
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [services, setServices] = useState([]);
  const [formError, setFormError] = useState("");

  const resolvedSubjects = resolveSubjectsForBookingLevel(form.level);
  const subjectOptions = resolvedSubjects.ok ? resolvedSubjects.subjects : [];
  const levelIssue = resolvedSubjects.ok ? "" : resolvedSubjects.error;

  const set = (k, v) => setForm((f) => {
    const next = { ...f, [k]: v };
    if (k === "level") {
      // Always reset subject when level changes so stale options cannot submit.
      next.subject = "";
    }
    return next;
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let data;
        if (typeof loadServices === "function") {
          data = await loadServices();
        } else {
          const result = await supabase
            .from("tutoring_services")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: true });
          if (result.error) throw result.error;
          data = result.data;
        }
        // Pricing only — never use tutoring_services.level labels for the
        // level/subject dropdowns (legacy rows use "A-Level/T-Level/BTEC").
        if (!cancelled && data) setServices(data);
      } catch (err) {
        console.error("Could not load services:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadServices]);

  function priceLabel(level, type) {
    if (type === "trial") return "Free";
    const svc = findTutoringServiceForLevel(services, level);
    if (!svc) {
      if (isPremiumBookingLevel(level)) return type === "package" ? "£400" : "£45/hr";
      return type === "package" ? "£300" : "£35/hr";
    }
    return type === "package" ? `£${svc.package_price_10}` : `£${svc.price_per_hour}/hr`;
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setFormError("");

    if (!form.name || !form.email) {
      alert("Please enter name and email");
      setLoading(false);
      return;
    }

    const selection = validateBookingSelection({ level: form.level, subject: form.subject });
    if (!selection.ok) {
      setFormError(selection.error || BOOKING_SUBJECT_REQUIRED_MESSAGE);
      setLoading(false);
      return;
    }

    if (!acceptTerms) {
      alert(TERMS_ACCEPTANCE_ERROR);
      setLoading(false);
      return;
    }

    try {
      if (form.sessionType === "trial") {
        const resp = await fetch("/api/create-booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            level: selection.level,
            subject: selection.subject,
            message: form.message,
            sessionType: "trial",
            accept_terms: true,
            terms_version: TERMS_VERSION,
          }),
        });
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(body?.error || "Failed to book free trial");
        track(ANALYTICS_EVENTS.TUTOR_BOOKING_SUBMITTED, {
          metadata: { session_type: "trial", level: selection.level, subject: selection.subject },
        });
        setSent(true);
        setLoading(false);
        return;
      }

      track(ANALYTICS_EVENTS.TUTOR_ENQUIRY_STARTED, {
        metadata: { session_type: form.sessionType, level: selection.level, subject: selection.subject },
      });

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        level: selection.level,
        subject: selection.subject,
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
  const visibleError = formError || levelIssue;

  return (
    <section
      data-testid="booking-form"
      style={{
        background: `linear-gradient(135deg,${TEAL_DARK},${TEAL})`,
        padding: isMobile ? "32px 16px" : "48px 20px",
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 28,
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ fontSize: isMobile ? 24 : 28, marginTop: 0 }}>Book a Tutoring Session</h2>
          <p style={{ color: "rgba(255,255,255,.9)", lineHeight: 1.55 }}>
            Personalised 1-to-1 science lessons for GCSE, A-Level, BTEC and T-Level.
          </p>
          <ul style={{ lineHeight: 1.7, paddingLeft: 18, fontSize: isMobile ? 15 : 16 }}>
            <li>✓ GCSE / A-Level / T-Level / BTEC — <b>£35–£45/hr</b></li>
            <li>✓ Free 30‑minute trial available for first-time students</li>
            <li>✓ Packages available for discount pricing</li>
          </ul>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: isMobile ? 16 : 22,
            color: "#0f172a",
            overflow: "visible",
          }}
        >
          {sent ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 40 }}>✅</div>
              <h3>Thanks, {form.name || "there"}!</h3>
              <p style={{ color: "#64748b" }}>We'll be in touch at {form.email || "your email"} soon.</p>
            </div>
          ) : (
            <form
              onSubmit={submit}
              style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "visible" }}
            >
              <input
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                style={inp}
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                style={inp}
              />
              <input
                placeholder="Phone (WhatsApp ok)"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                style={inp}
              />
              <div
                className="booking-level-subject-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: 12,
                  overflow: "visible",
                }}
              >
                <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Level</span>
                  <select
                    className="booking-select"
                    aria-label="Level"
                    data-testid="booking-level"
                    value={form.level}
                    onChange={(e) => {
                      set("level", e.target.value);
                      setFormError("");
                    }}
                    style={bookingSelectStyle}
                    required
                  >
                    {BOOKING_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>Subject</span>
                  <select
                    className="booking-select"
                    aria-label="Subject"
                    data-testid="booking-subject"
                    value={form.subject}
                    onChange={(e) => {
                      set("subject", e.target.value);
                      setFormError("");
                    }}
                    style={{
                      ...bookingSelectStyle,
                      borderColor: visibleError ? "#dc2626" : "#e2e8f0",
                    }}
                    required
                  >
                    <option value="">{BOOKING_SUBJECT_PLACEHOLDER}</option>
                    {subjectOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {visibleError ? (
                <div
                  role="alert"
                  data-testid="booking-form-error"
                  style={{ color: "#b91c1c", fontSize: 13, fontWeight: 700, marginTop: -4 }}
                >
                  {visibleError || BOOKING_UNKNOWN_LEVEL_MESSAGE}
                </div>
              ) : null}

              <div className="session-options" style={{ display: "flex", gap: 8 }}>
                {[
                  { id: "single", label: "Single session", hint: priceLabel(form.level, "single") },
                  { id: "package", label: "10-session package", hint: priceLabel(form.level, "package") },
                  { id: "trial", label: "Free 30-min trial", hint: "Free" },
                ].map((opt) => {
                  const active = form.sessionType === opt.id;
                  return (
                    <label
                      key={opt.id}
                      style={{
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
                      }}
                    >
                      <input
                        type="radio"
                        name="sessionType"
                        checked={active}
                        value={opt.id}
                        onChange={() => set("sessionType", opt.id)}
                      />
                      <span>
                        <span style={{ fontWeight: 800, display: "block", color: "#0f172a" }}>{opt.label}</span>
                        <span style={{ fontSize: 13, color: "#64748b" }}>{opt.hint}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div style={{ fontWeight: 700, color: TEAL_DARK }}>Price: {price}</div>
              <textarea
                placeholder="What would you like help with?"
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
                rows={3}
                style={inp}
              />
              <TutorChoosingNotice />
              <TermsAgreement
                id="booking-accept-terms"
                variant="booking"
                checked={acceptTerms}
                onChange={setAcceptTerms}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !acceptTerms}
                style={{
                  padding: "14px 12px",
                  minHeight: 48,
                  borderRadius: 8,
                  background: loading || !acceptTerms ? "#94a3b8" : TEAL,
                  color: "#fff",
                  border: "none",
                  cursor: loading || !acceptTerms ? "default" : "pointer",
                  fontWeight: 800,
                }}
              >
                {loading ? "Processing…" : "Request / Book"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
