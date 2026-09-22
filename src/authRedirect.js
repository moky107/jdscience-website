/** Canonical production site origin for docs and absolute links. */
export const PRODUCTION_SITE_ORIGIN = "https://www.jdscience.co.uk";

/**
 * Redirect target embedded in Supabase confirmation / recovery emails.
 * Recovery links always target the live site so preview/localhost sessions
 * never bake a non-production host into the owner's inbox.
 * Verification links use the current origin when available.
 */
export function authEmailRedirectTo(origin = typeof window !== "undefined" ? window.location.origin : "", { recovery = false } = {}) {
  if (recovery) {
    return `${PRODUCTION_SITE_ORIGIN}/?recovery=1`;
  }
  const base = String(origin || "").replace(/\/$/, "") || PRODUCTION_SITE_ORIGIN;
  return `${base}/?verified=1`;
}
