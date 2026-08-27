import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";
import { authEmailRedirectTo, describeAuthCallbackError } from "./authRedirect";
import { markHasAccount } from "./visitorAuth";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const RESEND_COOLDOWN_MS = 30000;

const cardStyle = {
  width: "min(520px, 100%)",
  background: "#fff",
  borderRadius: 20,
  border: "1px solid #e2e8f0",
  boxShadow: "0 16px 40px rgba(15, 23, 42, .1)",
  padding: "28px 22px",
  textAlign: "center",
};

const buttonPrimary = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  minHeight: 48,
  padding: "12px 18px",
  borderRadius: 12,
  border: "none",
  background: TEAL,
  color: "#fff",
  fontWeight: 800,
  fontSize: 16,
  cursor: "pointer",
  textDecoration: "none",
  boxSizing: "border-box",
};

const buttonSecondary = {
  ...buttonPrimary,
  background: "#fff",
  color: TEAL_DARK,
  border: "1px solid #cbd5e1",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontSize: 16,
  minHeight: 48,
};

function cleanCallbackUrl() {
  if (typeof window === "undefined") return;
  window.history.replaceState({}, "", "/auth/callback");
}

export default function AuthCallbackPage({ onGoHome, onOpenLogin }) {
  const started = useRef(false);
  const [status, setStatus] = useState("working"); // working | success | error
  const [message, setMessage] = useState("Confirming your email address…");
  const [email, setEmail] = useState("");
  const [resendInfo, setResendInfo] = useState("");
  const [resendError, setResendError] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [lastResendAt, setLastResendAt] = useState(0);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function complete() {
      try {
        const url = new URL(window.location.href);
        const queryError = describeAuthCallbackError(url.searchParams);
        if (queryError) {
          setStatus("error");
          setMessage(queryError);
          cleanCallbackUrl();
          return;
        }

        const code = url.searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setStatus("error");
            setMessage(
              /expired|invalid|otp/i.test(error.message || "")
                ? "This verification link has expired or is no longer valid. Request a new confirmation email below, then try again."
                : (error.message || "We could not complete email verification.")
            );
            cleanCallbackUrl();
            return;
          }
          markHasAccount();
          setStatus("success");
          setMessage("Your email address has been verified. You can now log in.");
          cleanCallbackUrl();
          return;
        }

        // Implicit / hash-based redirects (legacy links).
        if (url.hash && /access_token|refresh_token|error/.test(url.hash)) {
          const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
          const hashError = describeAuthCallbackError(hashParams);
          if (hashError) {
            setStatus("error");
            setMessage(hashError);
            cleanCallbackUrl();
            return;
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setStatus("error");
          setMessage(error.message || "We could not complete email verification.");
          cleanCallbackUrl();
          return;
        }

        if (data?.session) {
          markHasAccount();
          setStatus("success");
          setMessage("Your email address has been verified. You can now log in.");
          cleanCallbackUrl();
          return;
        }

        setStatus("error");
        setMessage("This verification link is incomplete or has already been used. Request a new confirmation email below, or try logging in.");
        cleanCallbackUrl();
      } catch (err) {
        setStatus("error");
        setMessage(err?.message || "We could not complete email verification.");
        cleanCallbackUrl();
      }
    }

    complete();
  }, []);

  async function resendVerification() {
    const trimmed = email.trim();
    if (!trimmed) {
      setResendError("Enter the email address you registered with.");
      setResendInfo("");
      return;
    }
    const now = Date.now();
    if (now - lastResendAt < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - (now - lastResendAt)) / 1000);
      setResendError(`Please wait ${wait}s before requesting another email.`);
      setResendInfo("");
      return;
    }
    if (resendBusy) return;
    setResendBusy(true);
    setResendError("");
    setResendInfo("");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: trimmed,
        options: { emailRedirectTo: authEmailRedirectTo() },
      });
      if (error) {
        setResendError(error.message || "Could not resend the verification email.");
        return;
      }
      setLastResendAt(Date.now());
      setResendInfo("A new verification email has been sent. Check your inbox and spam folder.");
    } catch (err) {
      setResendError(err?.message || "Could not resend the verification email.");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <section style={{ padding: "clamp(28px, 6vw, 56px) 16px", minHeight: "70vh", background: "linear-gradient(180deg, #f8fafc 0%, #eef7f6 100%)", display: "grid", placeItems: "center" }}>
      <div style={cardStyle}>
        <div style={{ color: TEAL_DARK, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 12 }}>
          Email verification
        </div>
        <h1 style={{ margin: "12px 0 0", color: "#0f172a", fontSize: "clamp(24px, 5vw, 32px)", lineHeight: 1.25 }}>
          {status === "working" ? "Confirming your email" : status === "success" ? "Email verified" : "Verification needed"}
        </h1>
        <p style={{ color: "#64748b", lineHeight: 1.65, marginTop: 12, fontSize: 16 }}>{message}</p>

        {status === "success" && (
          <div style={{ display: "grid", gap: 10, marginTop: 22 }}>
            <button type="button" onClick={onOpenLogin} style={buttonPrimary}>
              Log in to JD Science
            </button>
            <button type="button" onClick={onGoHome} style={buttonSecondary}>
              Back to home
            </button>
          </div>
        )}

        {status === "error" && (
          <div style={{ display: "grid", gap: 12, marginTop: 22, textAlign: "left" }}>
            <label style={{ display: "grid", gap: 8, color: "#334155", fontWeight: 700, fontSize: 14 }}>
              Email used to register
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </label>
            {resendError && <div style={{ color: "#b91c1c", fontSize: 14, lineHeight: 1.5 }}>{resendError}</div>}
            {resendInfo && <div style={{ color: "#166534", fontSize: 14, lineHeight: 1.5 }}>{resendInfo}</div>}
            <button type="button" onClick={resendVerification} disabled={resendBusy} style={{ ...buttonPrimary, background: resendBusy ? "#94a3b8" : TEAL, cursor: resendBusy ? "default" : "pointer" }}>
              {resendBusy ? "Sending…" : "Resend verification email"}
            </button>
            <button type="button" onClick={onOpenLogin} style={buttonSecondary}>
              Go to login
            </button>
            <button type="button" onClick={onGoHome} style={{ ...buttonSecondary, border: "none", color: "#64748b" }}>
              Back to home
            </button>
          </div>
        )}

        {status === "working" && (
          <div style={{ marginTop: 18, color: "#94a3b8", fontSize: 14 }}>Please wait a moment…</div>
        )}
      </div>
    </section>
  );
}
