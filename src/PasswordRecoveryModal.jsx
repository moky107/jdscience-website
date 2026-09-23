import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { stripRecoveryParamsFromUrl } from "./passwordRecoverySession";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box" };

/**
 * Shown after a valid password-recovery session is established.
 * Submits via supabase.auth.updateUser({ password }), then signs out and
 * sends the user to /admin to log in with the new password.
 */
export default function PasswordRecoveryModal({ onComplete, onRequestNewLink }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setInfo("");
    if (password.length < 8) {
      setError("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setError("This reset link is missing a valid session. Request a new Forgot password email and open the latest link.");
        return;
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || "Could not update password.");
        return;
      }
      setInfo("Your password has been updated. Redirecting to admin login…");
      stripRecoveryParamsFromUrl();
      try {
        await supabase.auth.signOut();
      } catch {
        /* ignore */
      }
      setTimeout(() => {
        onComplete?.();
        if (typeof window !== "undefined") {
          window.location.assign("/admin");
        }
      }, 700);
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", zIndex: 2100, padding: 12 }}>
      <form onSubmit={submit} style={{ background: "#fff", padding: 22, borderRadius: 16, width: "min(420px,100%)", display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 20px 50px rgba(0,0,0,.25)" }}>
        <div>
          <h2 style={{ margin: 0 }}>Choose a new password</h2>
          <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 14, lineHeight: 1.55 }}>
            Enter a new password for your JD Science account. After saving you will sign in again at /admin.
          </p>
        </div>
        <input style={inp} type="password" autoComplete="new-password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input style={inp} type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {error && (
          <div style={{ color: "#dc2626", fontSize: 14, lineHeight: 1.5 }}>
            {error}
            {onRequestNewLink && (
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  onClick={onRequestNewLink}
                  style={{ background: "none", border: 0, color: TEAL_DARK, cursor: "pointer", fontWeight: 700, padding: 0, textDecoration: "underline" }}
                >
                  Request another reset email
                </button>
              </div>
            )}
          </div>
        )}
        {info && <div style={{ color: "#166534", fontSize: 14 }}>{info}</div>}
        <button type="submit" disabled={busy} style={{ padding: 14, minHeight: 48, borderRadius: 8, background: busy ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: busy ? "default" : "pointer", fontWeight: 800 }}>
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
