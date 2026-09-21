/** Canonical production site origin for docs and absolute links. */
export const PRODUCTION_SITE_ORIGIN = "https://www.jdscience.co.uk";

/**
 * Redirect target embedded in Supabase confirmation / recovery emails.
 * Always derived from the current browser origin so production mail
 * never bakes in localhost or a preview host from a previous session.
 */
export function authEmailRedirectTo(origin = typeof window !== "undefined" ? window.location.origin : "", { recovery = false } = {}) {
  const base = String(origin || "").replace(/\/$/, "") || PRODUCTION_SITE_ORIGIN;
  if (recovery) return `${base}/?recovery=1`;
  return `${base}/?verified=1`;
}
