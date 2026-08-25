import { TERMS_ACCEPTANCE_ERROR, TERMS_VERSION } from "../../src/termsAndConditions.js";

export { TERMS_ACCEPTANCE_ERROR, TERMS_VERSION };

export function hasAcceptedTerms(body) {
  const value = body?.accept_terms;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return ["true", "1", "yes", "on"].includes(value.toLowerCase());
  if (typeof value === "number") return value === 1;
  return false;
}

export function termsAcceptancePayload(body = {}) {
  return {
    terms_accepted: true,
    terms_version: String(body.terms_version || TERMS_VERSION).slice(0, 20),
    terms_accepted_at: new Date().toISOString(),
  };
}
