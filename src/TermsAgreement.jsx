import React from "react";
import { TERMS_PATH } from "./termsAndConditions";

const COPY = {
  register:
    "I have read and agree to the Terms and Conditions. I understand that JD Science provides a platform for discovering tutors and resources, and that listed tutors may operate independently.",
  tutor:
    "I have read and agree to the Terms and Conditions. I confirm I am an independent tutor listing my own services, I am not employed by JD Science unless it has expressly agreed otherwise, and I am responsible for the accuracy of the information I supply, including qualifications.",
  booking:
    "I have read and agree to the Terms and Conditions. I understand that listed tutors may operate independently and that I should carry out my own checks before engaging a tutor. JD Science provides a platform for discovery and connection.",
};

export default function TermsAgreement({
  id,
  variant = "register",
  checked,
  onChange,
  disabled = false,
  textColor = "#334155",
}) {
  const body = COPY[variant] || COPY.register;
  const [before, after] = body.split("Terms and Conditions");

  return (
    <label htmlFor={id} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: textColor, fontSize: 14, lineHeight: 1.55, cursor: disabled ? "default" : "pointer" }}>
      <input
        id={id}
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        required
        onChange={(event) => onChange(event.target.checked)}
        style={{ marginTop: 3, flexShrink: 0 }}
      />
      <span>
        {before}
        <a href={TERMS_PATH} target="_blank" rel="noopener noreferrer" style={{ color: "#0f766e", fontWeight: 800 }}>
          Terms and Conditions
        </a>
        {after}
      </span>
    </label>
  );
}
