import React from "react";
import { TERMS_PATH, TUTOR_CHOOSING_NOTICE, TUTOR_CHOOSING_NOTICE_TITLE } from "./termsAndConditions";

export default function TutorChoosingNotice({ linkToTerms = true }) {
  return (
    <p role="note" style={{ margin: 0, color: "#475569", fontSize: 13, lineHeight: 1.55, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 12px" }}>
      <strong style={{ color: "#0f172a" }}>{TUTOR_CHOOSING_NOTICE_TITLE}:</strong>{" "}
      {TUTOR_CHOOSING_NOTICE}
      {linkToTerms && (
        <>
          {" "}
          <a href={TERMS_PATH} target="_blank" rel="noopener noreferrer" style={{ color: "#0f766e", fontWeight: 700 }}>
            Read the Terms
          </a>
        </>
      )}
    </p>
  );
}
