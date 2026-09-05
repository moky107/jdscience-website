import { createClient } from '@supabase/supabase-js';
import { parseRequestBody, safeTrim } from './_lib/tutors.js';
import { recordServerAnalyticsEvent } from './_lib/analytics.js';

const BOOKING_ALLOWED_STATUSES = new Set(['pending', 'confirmed', 'rescheduled', 'rejected', 'completed']);

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
    return res.status(500).json({ error: 'Admin dashboard is not configured yet.' });
  }

  const body = parseRequestBody(req.body) || {};
  const provided = req.headers['x-admin-password'] || body.password;
  if (!provided || !safeEqual(provided, adminPassword)) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  const id = body.id;
  const status = safeTrim(body.status, 40).toLowerCase();
  if (!id) return res.status(400).json({ error: 'Missing booking id.' });
  if (!BOOKING_ALLOWED_STATUSES.has(status)) {
    return res.status(400).json({
      error: 'Invalid status. Allowed: pending, confirmed, rescheduled, rejected, completed.',
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for database access.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to update booking status' });
    }

    if (status === 'confirmed' && data) {
      await recordServerAnalyticsEvent(supabase, {
        event_name: 'tutor_booking_confirmed',
        session_id: `admin_${data.id}`,
        anonymous_visitor_id: `booking_${data.id}`,
        page_path: '/admin',
        is_admin: true,
        metadata: {
          level: data.level || null,
          subject: data.subject || null,
          source: 'admin_status_update',
        },
      });
    }

    return res.status(200).json({ ok: true, booking: data });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to update booking status' });
  }
}
