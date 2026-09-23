/** Canonical production site origin for docs and absolute links. */
export const PRODUCTION_SITE_ORIGIN = "https://www.jdscience.co.uk";

/** Dedicated password-reset route (not homepage / admin login). */
export const PASSWORD_RESET_PATH = "/reset-password";

export const PASSWORD_RESET_URL = `${PRODUCTION_SITE_ORIGIN}${PASSWORD_RESET_PATH}`;

/**
 * Redirect target embedded in Supabase confirmation / recovery emails.
 * Recovery always targets the dedicated /reset-password page on production.
 * Verification links use the current origin when available.
 */
export function authEmailRedirectTo(origin = typeof window !== "undefined" ? window.location.origin : "", { recovery = false } = {}) {
  if (recovery) {
    return PASSWORD_RESET_URL;
  }
  const base = String(origin || "").replace(/\/$/, "") || PRODUCTION_SITE_ORIGIN;
  return `${base}/?verified=1`;
}

export function isPasswordResetPath(pathname = typeof window !== "undefined" ? window.location.pathname : "") {
  const path = String(pathname || "").replace(/\/$/, "") || "/";
  return path === PASSWORD_RESET_PATH;
}
