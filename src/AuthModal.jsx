import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import TermsAgreement from "./TermsAgreement";
import { TERMS_ACCEPTANCE_ERROR, TERMS_VERSION } from "./termsAndConditions";
import { markHasAccount } from "./visitorAuth";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box" };

function authRedirectUrl() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/?verified=1`;
}

export default function AuthModal({ close, initialMode = "login", reason = "" }) {
  const [mode, setMode] = useState(initialMode === "register" ? "register" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function resendVerification() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Enter the email address you registered with first.");
      return;
    }
    setBusy(true);
    setError("");
    setInfo("");
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: trimmed,
      options: { emailRedirectTo: authRedirectUrl() },
    });
    setBusy(false);
    if (resendError) setError(resendError.message);
    else setInfo("A new verification email has been sent. Check your inbox and spam folder.");
  }

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setInfo("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setBusy(false);
      setError("Enter your email and password.");
      return;
    }

    try {
      if (mode === "register") {
        if (password.length < 8) {
          setError("Choose a password with at least 8 characters.");
          return;
        }
        if (password !== confirmPassword) {
          setError("The passwords do not match.");
          return;
        }
        if (!termsAccepted) {
          setError(TERMS_ACCEPTANCE_ERROR);
          return;
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: authRedirectUrl(),
            data: {
              terms_accepted: true,
              terms_version: TERMS_VERSION,
              terms_accepted_at: new Date().toISOString(),
            },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (data.session) {
          markHasAccount();
          setInfo("Your account is ready. You are now signed in.");
          setTimeout(() => close(), 800);
          return;
        }
        markHasAccount();
        setInfo("Account created. Check your email and click the verification link, then log in.");
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (signInError) {
        const message = signInError.message || "Login failed.";
        if (/confirm|not confirmed|verification/i.test(message)) {
          setError("Please verify your email first. Check your inbox, then try again.");
        } else {
          setError(message);
        }
        return;
      }
      markHasAccount();
      close();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 2000, padding: 12 }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: 22, borderRadius: 16, width: "min(420px,100%)", maxHeight: "min(92dvh, 920px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 20px 50px rgba(0,0,0,.25)" }}>
        <div>
          <h2 style={{ margin: 0 }}>{mode === "login" ? "Login" : "Create an account"}</h2>
          <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 14, lineHeight: 1.55 }}>
            {mode === "login"
              ? "Sign in to your JD Science account."
              : "Register with your email. We will send a verification link before you can log in."}
          </p>
        </div>
        <input style={inp} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={inp} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {mode === "register" && (
          <input style={inp} type="password" autoComplete="new-password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        )}
        {mode === "register" && (
          <TermsAgreement id="register-accept-terms" variant="register" checked={termsAccepted} onChange={setTermsAccepted} disabled={busy} />
        )}
        {error && <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>}
        {info && <div style={{ color: "#166534", fontSize: 14 }}>{info}</div>}
        <button type="submit" disabled={busy || (mode === "register" && !termsAccepted)} style={{ padding: 14, minHeight: 48, borderRadius: 8, background: busy || (mode === "register" && !termsAccepted) ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: busy || (mode === "register" && !termsAccepted) ? "default" : "pointer", fontWeight: 800 }}>
          {busy ? "Please wait…" : (mode === "login" ? "Login" : "Register")}
        </button>
        {(mode === "register" || /verify your email/i.test(error)) && (
          <button type="button" onClick={resendVerification} disabled={busy} style={{ background: "none", border: 0, color: TEAL_DARK, cursor: "pointer", fontWeight: 700, minHeight: 44 }}>
            Resend verification email
          </button>
        )}
        <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setInfo(""); }} style={{ background: "none", border: 0, color: TEAL, cursor: "pointer", fontWeight: 700, minHeight: 44 }}>
          {mode === "login" ? "Create an account" : "Already have an account?"}
        </button>
        <button type="button" onClick={close} style={{ background: "none", border: 0, color: "#64748b", cursor: "pointer", minHeight: 44 }}>Close</button>
      </form>
    </div>
  );
}
