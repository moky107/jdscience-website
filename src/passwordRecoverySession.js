import { PRODUCTION_SITE_ORIGIN } from "./authRedirect.js";

/**
 * Consume a first-party password-recovery URL:
 *   https://www.jdscience.co.uk/?recovery=1&type=recovery&token_hash=...
 *
 * Calls supabase.auth.verifyOtp so onAuthStateChange emits PASSWORD_RECOVERY.
 * Strips token_hash from the address bar. Never logs the token.
 *
 * Returns { handled, ok, errorMessage } — handled=false when this is not a
 * token_hash recovery link (e.g. legacy hash-fragment sessions).
 */
export async function consumePasswordRecoveryFromUrl(supabase, href = typeof window !== "undefined" ? window.location.href : "") {
  let url;
  try {
    url = new URL(href);
  } catch {
    return { handled: false };
  }

  if (url.searchParams.get("recovery") !== "1") {
    return { handled: false };
  }

  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  // Legacy GoTrue redirects may land with only ?recovery=1 and tokens in the hash.
  // detectSessionInUrl handles those; we only clear the flag.
  if (!tokenHash || type !== "recovery") {
    stripRecoveryParams(url);
    return { handled: false, awaitingHashSession: true };
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "recovery",
  });

  stripRecoveryParams(url);

  if (error) {
    return {
      handled: true,
      ok: false,
      errorMessage: error.message || "This reset link is invalid or has expired. Request a new Forgot password email.",
    };
  }

  return { handled: true, ok: true };
}

function stripRecoveryParams(url) {
  if (typeof window === "undefined") return;
  url.searchParams.delete("token_hash");
  url.searchParams.delete("type");
  url.searchParams.delete("recovery");
  const query = url.searchParams.toString();
  const next = `${url.pathname}${query ? `?${query}` : ""}${url.hash || ""}`;
  window.history.replaceState({}, "", next || "/");
}

/** Expected production host for recovery emails (tests / diagnostics). */
export function expectedRecoveryLinkOrigin() {
  return PRODUCTION_SITE_ORIGIN;
}
