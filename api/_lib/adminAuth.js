/** Same allow-list used by resource upload / App.jsx ADMIN_EMAILS. */
export const ADMIN_EMAILS = ['jd943791@gmail.com'];

export function safeEqual(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  if (sa.length !== sb.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i++) diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return diff === 0;
}

/**
 * Existing JDScience admin gate for bookings/tutor admin APIs:
 * shared ADMIN_PASSWORD via JSON `{ password }` or `x-admin-password`.
 */
export function requireAdminPassword(req, body = {}) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return {
      ok: false,
      status: 500,
      error: 'Admin dashboard is not configured yet. (Server missing ADMIN_PASSWORD.)',
      code: 'MISSING_ADMIN_PASSWORD',
    };
  }

  const provided = req.headers?.['x-admin-password'] || body.password;
  if (!provided || !safeEqual(provided, adminPassword)) {
    return { ok: false, status: 401, error: 'Incorrect password.', code: 'UNAUTHORIZED' };
  }

  return { ok: true, via: 'password' };
}
