import React from "react";
import { TERMS_PATH } from "./termsAndConditions";

const COPY = {
  register:
    "I have read and agree to the Terms and Conditions. I understand that JD Science provides a platform for independent tutors to advertise their services and, to the fullest extent permitted by law, is not liable for tutoring arrangements, teaching quality or academic outcomes.",
  tutor:
    "I have read and agree to the Terms and Conditions. I confirm I am an independent tutor advertising my own services, I am not employed by JD Science, and JD Science is not responsible for my conduct, qualifications, safeguarding checks, fees, or any contract I enter into with students.",
  booking:
    "I have read and agree to the Terms and Conditions. I understand JD Science only provides the opportunity for private tutors to advertise, is not a party to arrangements with independent listed tutors, and to the fullest extent permitted by law bears no liability for their services, cancellations, safeguarding or exam results.",
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
