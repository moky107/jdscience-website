import { PRODUCTION_SITE_ORIGIN } from "./authRedirect.js";

/**
 * Password-recovery cold-start helpers.
 *
 * Recovery can arrive as:
 *   A) First-party email link:
 *      https://www.jdscience.co.uk/?recovery=1&type=recovery&token_hash=…
 *   B) GoTrue verify redirect (Site URL allow-list OK):
 *      https://www.jdscience.co.uk/?recovery=1#access_token=…&type=recovery
 *   C) PKCE: ?code=…&recovery=1
 *
 * Supabase may emit PASSWORD_RECOVERY during client initialize() via setTimeout(0)
 * BEFORE React mounts. Capture that event at module load, and on App startup
 * explicitly establish/inspect the session — do not rely solely on the React
 * listener seeing PASSWORD_RECOVERY.
 *
 * Never logs tokens / hashes / codes.
 */

let earlyPasswordRecovery = false;
let earlySubscribers = new Set();
let earlyListenerAttached = false;

/**
 * Attach as soon as the Supabase client exists (before React). Safe to call once.
 */
export function attachEarlyPasswordRecoveryListener(supabase) {
  if (earlyListenerAttached || !supabase?.auth?.onAuthStateChange) return;
  earlyListenerAttached = true;
  supabase.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      earlyPasswordRecovery = true;
      earlySubscribers.forEach((fn) => {
        try {
          fn();
        } catch {
          /* ignore */
        }
      });
    }
  });
}

export function consumeEarlyPasswordRecoveryFlag() {
  const hit = earlyPasswordRecovery;
  earlyPasswordRecovery = false;
  return hit;
}

export function peekEarlyPasswordRecoveryFlag() {
  return earlyPasswordRecovery;
}

export function onEarlyPasswordRecovery(fn) {
  earlySubscribers.add(fn);
  if (earlyPasswordRecovery) {
    try {
      fn();
    } catch {
      /* ignore */
    }
  }
  return () => earlySubscribers.delete(fn);
}

/** Inspect URL for recovery intent without reading/logging secret values. */
export function inspectRecoveryUrl(href = typeof window !== "undefined" ? window.location.href : "") {
  let url;
  try {
    url = new URL(href);
  } catch {
    return {
      hasRecoveryFlag: false,
      hasTokenHash: false,
      hasPkceCode: false,
      hashType: null,
      hasHashAccessToken: false,
      hasHashError: false,
      hashErrorCode: null,
      hashErrorDescription: null,
    };
  }

  const hashParams = new URLSearchParams(url.hash ? url.hash.replace(/^#/, "") : "");
  const typeParam = url.searchParams.get("type") || hashParams.get("type");
  const hasTokenHash = Boolean(url.searchParams.get("token_hash"));
  const hasPkceCode = Boolean(url.searchParams.get("code"));
  const hasRecoveryFlag = url.searchParams.get("recovery") === "1" || typeParam === "recovery";
  const hashError = hashParams.get("error");
  const hashErrorCode = hashParams.get("error_code");
  const hashErrorDescription = hashParams.get("error_description");

  return {
    hasRecoveryFlag,
    hasTokenHash,
    hasPkceCode,
    hashType: typeParam,
    hasHashAccessToken: hashParams.has("access_token"),
    hasHashError: Boolean(hashError),
    hashErrorCode,
    hashErrorDescription: hashErrorDescription ? decodeURIComponent(hashErrorDescription.replace(/\+/g, " ")) : null,
  };
}

export function stripRecoveryParamsFromUrl(href = typeof window !== "undefined" ? window.location.href : "") {
  if (typeof window === "undefined") return;
  let url;
  try {
    url = new URL(href);
  } catch {
    return;
  }
  url.searchParams.delete("token_hash");
  url.searchParams.delete("type");
  url.searchParams.delete("recovery");
  url.searchParams.delete("code");
  // Clear auth hash fragments (tokens / errors) without logging them.
  const next = `${url.pathname}${url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""}`;
  window.history.replaceState({}, "", next || "/");
}

/**
 * Establish a recovery session from the current URL and decide whether to show
 * the Choose a new password UI.
 *
 * Always returns whether the modal should open — never relies only on a
 * PASSWORD_RECOVERY event that may already have fired.
 */
export async function bootstrapPasswordRecovery(supabase, href = typeof window !== "undefined" ? window.location.href : "") {
  const info = inspectRecoveryUrl(href);
  const earlyFlag = peekEarlyPasswordRecoveryFlag();

  if (info.hasHashError) {
    stripRecoveryParamsFromUrl(href);
    return {
      showModal: false,
      errorMessage:
        info.hashErrorDescription
        || "This reset link is invalid or has expired. Request a new Forgot password email.",
      reason: info.hashErrorCode || "hash_error",
    };
  }

  const recoveryIntent =
    info.hasRecoveryFlag
    || info.hasTokenHash
    || (info.hasHashAccessToken && info.hashType === "recovery")
    || earlyFlag;

  if (!recoveryIntent) {
    return { showModal: false, reason: "no_recovery_intent" };
  }

  // A) Explicit token_hash from our Resend email
  if (info.hasTokenHash && info.hashType === "recovery") {
    let url;
    try {
      url = new URL(href);
    } catch {
      return { showModal: false, errorMessage: "Invalid recovery link.", reason: "bad_url" };
    }
    const tokenHash = url.searchParams.get("token_hash");
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "recovery",
    });
    stripRecoveryParamsFromUrl(href);
    consumeEarlyPasswordRecoveryFlag();
    if (error || !data?.session) {
      return {
        showModal: false,
        errorMessage:
          error?.message
          || "This reset link is invalid or has expired. Request a new Forgot password email.",
        reason: "verify_otp_failed",
      };
    }
    return { showModal: true, reason: "verify_otp", sessionEstablished: true };
  }

  // B) PKCE code exchange
  if (info.hasPkceCode) {
    let url;
    try {
      url = new URL(href);
    } catch {
      return { showModal: false, errorMessage: "Invalid recovery link.", reason: "bad_url" };
    }
    const code = url.searchParams.get("code");
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    stripRecoveryParamsFromUrl(href);
    consumeEarlyPasswordRecoveryFlag();
    if (error || !data?.session) {
      return {
        showModal: false,
        errorMessage:
          error?.message
          || "This reset link is invalid or has expired. Request a new Forgot password email.",
        reason: "pkce_failed",
      };
    }
    return { showModal: true, reason: "pkce", sessionEstablished: true };
  }

  // C) Implicit hash tokens — wait for detectSessionInUrl / initialize to finish
  try {
    if (typeof supabase.auth.initialize === "function") {
      await supabase.auth.initialize();
    }
  } catch {
    /* initialize may already be in flight */
  }

  // Give the setTimeout(0) PASSWORD_RECOVERY notify a tick to run.
  await new Promise((resolve) => setTimeout(resolve, 0));

  const { data: sessionData } = await supabase.auth.getSession();
  const hasSession = Boolean(sessionData?.session);
  const sawRecoveryEvent = earlyFlag || peekEarlyPasswordRecoveryFlag() || consumeEarlyPasswordRecoveryFlag();

  stripRecoveryParamsFromUrl(href);

  if (hasSession && (sawRecoveryEvent || info.hasRecoveryFlag || info.hashType === "recovery")) {
    return { showModal: true, reason: "existing_recovery_session", sessionEstablished: true };
  }

  if (!hasSession) {
    return {
      showModal: false,
      errorMessage: "This reset link is invalid or has expired. Request a new Forgot password email.",
      reason: "no_session",
    };
  }

  // Session exists (e.g. already logged in) with ?recovery=1 — still show the form
  // so the user can set a new password via updateUser.
  if (info.hasRecoveryFlag) {
    return { showModal: true, reason: "recovery_flag_with_session", sessionEstablished: true };
  }

  return { showModal: false, reason: "unhandled" };
}

/** @deprecated use bootstrapPasswordRecovery */
export async function consumePasswordRecoveryFromUrl(supabase, href) {
  return bootstrapPasswordRecovery(supabase, href);
}

export function expectedRecoveryLinkOrigin() {
  return PRODUCTION_SITE_ORIGIN;
}
