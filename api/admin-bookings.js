import { createClient } from '@supabase/supabase-js';

/**
 * Vercel serverless function: return all bookings for the admin dashboard.
 *
 * Authenticated with a simple shared password (ADMIN_PASSWORD env var), sent
 * either as JSON `{ password }` or an `x-admin-password` header. Uses the
 * Supabase service role key server-side so it can read every row regardless of
 * RLS. The service role key is never exposed to the browser.
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_PASSWORD
 */

// Length-aware constant-time-ish comparison to avoid trivial timing leaks.
function safeEqual(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  if (sa.length !== sb.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i++) diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return diff === 0;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD is not set in the environment.');
    return res.status(500).json({
      error: 'Admin dashboard is not configured yet. (Server missing ADMIN_PASSWORD.)',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const provided = req.headers['x-admin-password'] || body.password;
  if (!provided || !safeEqual(provided, adminPassword)) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: 'Server not configured for database access.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase select error (admin bookings):', error);
      return res.status(500).json({ error: error.message || 'Failed to load bookings' });
    }

    return res.status(200).json({ ok: true, bookings: data || [] });
  } catch (err) {
    console.error('admin-bookings failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to load bookings' });
  }
}
