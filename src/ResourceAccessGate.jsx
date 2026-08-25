import React from "react";
import { TERMS_PATH } from "./termsAndConditions";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

export default function ResourceAccessGate({ onRegister, onLogin, onHome, returningVisitor }) {
  return (
    <section style={{ padding: "48px 16px 72px", minHeight: "60vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", boxShadow: "0 12px 34px rgba(15,23,42,.08)", padding: "28px 22px", textAlign: "center" }}>
        <div style={{ color: TEAL_DARK, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 12 }}>Resource library</div>
        <h2 style={{ margin: "10px 0 0", color: "#0f172a", fontSize: 28, lineHeight: 1.25 }}>
          {returningVisitor ? "Log in to open resources" : "Register to open resources"}
        </h2>
        <p style={{ color: "#64748b", lineHeight: 1.65, marginTop: 12 }}>
          First-time visitors need a free account before they can open past papers, worksheets, revision notes or videos.
          After you register, log in whenever you visit to use the library.
          Booking a tutor and browsing tutor profiles stay available without an account.
        </p>
        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
          Registration includes agreeing to our{" "}
          <a href={TERMS_PATH} target="_blank" rel="noopener noreferrer" style={{ color: TEAL, fontWeight: 800 }}>Terms and Conditions</a>.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button type="button" onClick={onRegister} style={{ padding: "12px 18px", minHeight: 48, borderRadius: 12, border: "none", background: TEAL, color: "#fff", cursor: "pointer", fontWeight: 800 }}>
            Create an account
          </button>
          <button type="button" onClick={onLogin} style={{ padding: "12px 18px", minHeight: 48, borderRadius: 12, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", cursor: "pointer", fontWeight: 800 }}>
            Log in
          </button>
          <button type="button" onClick={onHome} style={{ padding: "12px 18px", minHeight: 48, borderRadius: 12, border: "none", background: "transparent", color: "#64748b", cursor: "pointer", fontWeight: 700 }}>
            Back to home
          </button>
        </div>
      </div>
    </section>
  );
}
