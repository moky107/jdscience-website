/**
 * Safety rails for scripts that talk to Supabase Auth.
 *
 * Production user passwords and auth records must NEVER be mutated by automated
 * tests, publish helpers, or agent e2e scripts. Use mocked auth, local Vite
 * ADMIN_PASSWORD (API gate only), or a dedicated disposable test account that is
 * not in PROTECTED_PRODUCTION_AUTH_EMAILS.
 */

export const PROTECTED_PRODUCTION_AUTH_EMAILS = Object.freeze([
  "jd943791@gmail.com",
]);

export function normalizeAuthEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isProtectedProductionAuthEmail(email) {
  return PROTECTED_PRODUCTION_AUTH_EMAILS.includes(normalizeAuthEmail(email));
}

/**
 * Throw if a script is about to create/update/delete Auth credentials for a
 * real production account. Call this before any auth.admin.* mutation.
 */
export function assertAllowedAuthMutation(email, { action = "mutate" } = {}) {
  const normalized = normalizeAuthEmail(email);
  if (!normalized) {
    throw new Error(`Refusing to ${action} Auth credentials: email is required.`);
  }
  if (isProtectedProductionAuthEmail(normalized)) {
    throw new Error(
      `Refusing to ${action} Auth credentials for protected production account (${normalized}). `
      + "Use Forgot password on the live site, or a dedicated disposable test user — never updateUserById/createUser/deleteUser against production admin emails from scripts.",
    );
  }
}

/** Patterns that must not appear in automated scripts (static audit). */
export const FORBIDDEN_SCRIPT_AUTH_PATTERNS = [
  /auth\.admin\.updateUserById\s*\(/,
  /auth\.admin\.createUser\s*\(/,
  /auth\.admin\.deleteUser\s*\(/,
  /auth\.admin\.generateLink\s*\(/,
];
