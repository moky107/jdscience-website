/**
 * Shared client helper: request a password-recovery email via the JDScience API
 * (Resend-backed). Does not call Supabase's built-in mailer from the browser.
 */
export async function requestPasswordRecoveryEmail(email) {
  const trimmed = String(email || "").trim();
  if (!trimmed) {
    return { ok: false, error: "Enter your email address first, then click Forgot password." };
  }
  try {
    const resp = await fetch("/api/password-recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: trimmed }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return {
        ok: false,
        error: data?.error || "Could not send password reset email.",
        code: data?.code || null,
        status: resp.status,
      };
    }
    return {
      ok: true,
      message: data?.message
        || "If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.",
      delivery: data?.delivery || null,
    };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not send password reset email." };
  }
}
