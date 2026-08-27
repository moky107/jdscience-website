/** Canonical production site origin for docs and absolute links. */
export const PRODUCTION_SITE_ORIGIN = "https://www.jdscience.co.uk";

export const AUTH_CALLBACK_PATH = "/auth/callback";

/**
 * Redirect target embedded in Supabase confirmation / resend emails.
 * Always derived from the current browser origin so production sign-ups
 * never bake in localhost or a preview host from a previous session.
 */
export function authEmailRedirectTo(origin = typeof window !== "undefined" ? window.location.origin : "") {
  const base = String(origin || "").replace(/\/$/, "");
  if (!base) return `${PRODUCTION_SITE_ORIGIN}${AUTH_CALLBACK_PATH}`;
  return `${base}${AUTH_CALLBACK_PATH}`;
}

export function isAuthCallbackPath(pathname = "") {
  const path = String(pathname || "").replace(/\/$/, "") || "/";
  return path === AUTH_CALLBACK_PATH;
}

export function describeAuthCallbackError(searchParams) {
  const error = searchParams?.get?.("error") || searchParams?.get?.("error_code") || "";
  const description = searchParams?.get?.("error_description") || searchParams?.get?.("error_message") || "";
  const combined = `${error} ${description}`.toLowerCase();
  if (!error && !description) return null;
  if (/otp_expired|expired|access_denied/.test(combined)) {
    return "This verification link has expired or is no longer valid. Request a new confirmation email below, then try again.";
  }
  if (/invalid|otp|token|code/.test(combined)) {
    return "This verification link is invalid. Request a new confirmation email below, then try again.";
  }
  return description.replace(/\+/g, " ") || "We could not verify your email with this link. Request a new confirmation email below.";
}
