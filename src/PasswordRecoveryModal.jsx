import React, { useState } from "react";
import { supabase } from "./supabaseClient";

const TEAL = "#009688";
const inp = { padding: "11px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 16, width: "100%", boxSizing: "border-box" };

/**
 * Shown after the user opens a Supabase password-recovery link.
 * Session is already established; they only need to choose a new password.
 */
export default function PasswordRecoveryModal({ onComplete }) {
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
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message || "Could not update password.");
        return;
      }
      setInfo("Your password has been updated. You are signed in.");
      setTimeout(() => onComplete?.(), 900);
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
            Enter a new password for your JD Science account. You will stay signed in after saving.
          </p>
        </div>
        <input style={inp} type="password" autoComplete="new-password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input style={inp} type="password" autoComplete="new-password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {error && <div style={{ color: "#dc2626", fontSize: 14 }}>{error}</div>}
        {info && <div style={{ color: "#166534", fontSize: 14 }}>{info}</div>}
        <button type="submit" disabled={busy} style={{ padding: 14, minHeight: 48, borderRadius: 8, background: busy ? "#94a3b8" : TEAL, color: "#fff", border: "none", cursor: busy ? "default" : "pointer", fontWeight: 800 }}>
          {busy ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}
