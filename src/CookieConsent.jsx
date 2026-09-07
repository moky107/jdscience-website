import React, { useEffect, useState } from "react";
import {
  getGaMeasurementId,
  needsAnalyticsConsentPrompt,
  setAnalyticsConsent,
} from "./analytics";

const TEAL = "#009688";
const TEAL_DARK = "#004d40";

/**
 * Minimal analytics cookie banner shown only when a GA4 measurement ID is
 * configured and the visitor has not yet chosen. Essential site cookies /
 * first-party anonymous analytics are unaffected.
 */
export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getGaMeasurementId()) {
      setVisible(false);
      return undefined;
    }
    setVisible(needsAnalyticsConsentPrompt());
    const onConsent = () => setVisible(needsAnalyticsConsentPrompt());
    window.addEventListener("jd-analytics-consent", onConsent);
    return () => window.removeEventListener("jd-analytics-consent", onConsent);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Analytics cookie preferences"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10050,
        padding: "14px 16px calc(14px + env(safe-area-inset-bottom, 0px))",
        background: "rgba(15, 23, 42, 0.96)",
        color: "#f8fafc",
        borderTop: "1px solid rgba(148, 163, 184, 0.25)",
        boxShadow: "0 -8px 28px rgba(15, 23, 42, 0.28)",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#fff", marginBottom: 4 }}>
            Analytics cookies
          </div>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#cbd5e1" }}>
            We use Google Analytics only if you allow it, so we can see which pages help students
            most. We never send names, emails, phone numbers or payment details. You can change this
            later by clearing site data for jdscience.co.uk.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, flex: "0 0 auto" }}>
          <button
            type="button"
            onClick={() => {
              setAnalyticsConsent("denied");
              setVisible(false);
            }}
            style={{
              minHeight: 44,
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid rgba(148, 163, 184, 0.45)",
              background: "transparent",
              color: "#e2e8f0",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reject analytics
          </button>
          <button
            type="button"
            onClick={() => {
              setAnalyticsConsent("granted");
              setVisible(false);
            }}
            style={{
              minHeight: 44,
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}
