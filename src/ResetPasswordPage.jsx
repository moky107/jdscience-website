import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { bootstrapPasswordRecovery, stripRecoveryParamsFromUrl } from "./passwordRecoverySession";
import { PASSWORD_RESET_PATH } from "./authRedirect";

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

/**
 * Dedicated /reset-password page.
 * Does not render homepage or admin login. Only recovery UI.
 */
export default function ResetPasswordPage() {
  const [phase, setPhase] = useState("loading"); // loading | form | error | success
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await bootstrapPasswordRecovery(supabase, window.location.href);
        if (cancelled) return;
        if (result.showModal) {
          setPhase("form");
          return;
        }
        setPhase("error");
        setErrorMessage(
          result.errorMessage
          || "This reset link is invalid or has expired. Request a new Forgot password email from /admin.",
        );
      } catch (err) {
        if (cancelled) return;
        setPhase("error");
        setErrorMessage(err?.message || "Could not open the password reset page.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setFormError("");
    if (password.length < 8) {
      setFormError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setPhase("error");
        setErrorMessage("This reset link is missing a valid session. Request a new Forgot password email from /admin.");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setFormError(updateError.message || "Could not update password.");
        return;
      }
      setPhase("success");
      stripRecoveryParamsFromUrl();
      try {
        await supabase.auth.signOut();
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        window.location.assign("/admin");
      }, 900);
    } catch (err) {
      setFormError(err?.message || "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "grid", placeItems: "center", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", color: "#0f172a" }}>
      <div style={{ width: "min(440px, 100%)", background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 20px 50px rgba(15,23,42,.12)", padding: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 800, color: TEAL_DARK, letterSpacing: 0.2 }}>JD Science</div>
          <h1 style={{ margin: "8px 0 0", fontSize: 22 }}>Choose a new password</h1>
        </div>

        {phase === "loading" && (
          <p style={{ color: "#64748b", lineHeight: 1.55, margin: 0 }}>Checking your reset link…</p>
        )}

        {phase === "error" && (
          <div>
            <p style={{ color: "#b91c1c", lineHeight: 1.55, margin: "0 0 14px" }}>{errorMessage}</p>
            <a
              href="/admin"
              style={{ display: "inline-block", padding: "12px 16px", borderRadius: 10, background: TEAL, color: "#fff", textDecoration: "none", fontWeight: 800 }}
            >
              Back to admin login
            </a>
          </div>
        )}

        {phase === "success" && (
          <p style={{ color: "#166534", lineHeight: 1.55, margin: 0 }}>
            Your password has been updated. Redirecting to admin login…
          </p>
        )}

        {phase === "form" && (
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: 14, lineHeight: 1.55 }}>
              Enter a new password for your JD Science account. After saving you will sign in again at /admin.
            </p>
            <input
              style={inp}
              type="password"
              autoComplete="new-password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              style={inp}
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {formError && <div style={{ color: "#dc2626", fontSize: 14, lineHeight: 1.5 }}>{formError}</div>}
            <button
              type="submit"
              disabled={busy}
              style={{ padding: 14, minHeight: 48, borderRadius: 8, background: busy ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: busy ? "default" : "pointer", fontWeight: 800 }}
            >
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        )}

        <p style={{ margin: "18px 0 0", fontSize: 12, color: "#94a3b8" }}>
          Secure reset page ({PASSWORD_RESET_PATH}). This is not the login form.
        </p>
      </div>
    </div>
  );
}
