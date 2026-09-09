import { parseRequestBody } from './_lib/tutors.js';
import { requireAdminPassword } from './_lib/adminAuth.js';
import { createServiceRoleClient, formatSupabaseAdminError } from './_lib/supabaseAdmin.js';

/**
 * Vercel serverless function: return all bookings for the admin dashboard.
 *
 * Authenticated with the existing shared ADMIN_PASSWORD (JSON `{ password }` or
 * `x-admin-password`). Uses the service role key server-side so it can read every
 * row regardless of RLS. The service role key is never exposed to the browser.
 *
 * Required env: ADMIN_PASSWORD, SUPABASE_SERVICE_ROLE_KEY
 * Optional env: NEXT_PUBLIC_SUPABASE_URL / VITE_SUPABASE_URL (falls back to known project URL)
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseRequestBody(req.body) || {};
  const auth = requireAdminPassword(req, body);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error, code: auth.code });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase select error (admin bookings):', error);
      const formatted = formatSupabaseAdminError(error, 'Failed to load bookings');
      return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
    }

    return res.status(200).json({ ok: true, bookings: data || [] });
  } catch (err) {
    console.error('admin-bookings failed:', err?.message || err);
    const formatted = formatSupabaseAdminError(err, 'Failed to load bookings');
    return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
  }
}
