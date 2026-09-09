import { parseRequestBody, safeTrim } from './_lib/tutors.js';
import { recordServerAnalyticsEvent } from './_lib/analytics.js';
import { requireAdminPassword } from './_lib/adminAuth.js';
import { createServiceRoleClient, formatSupabaseAdminError } from './_lib/supabaseAdmin.js';

const BOOKING_ALLOWED_STATUSES = new Set(['pending', 'confirmed', 'rescheduled', 'rejected', 'completed']);

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

  const id = body.id;
  const status = safeTrim(body.status, 40).toLowerCase();
  if (!id) return res.status(400).json({ error: 'Missing booking id.' });
  if (!BOOKING_ALLOWED_STATUSES.has(status)) {
    return res.status(400).json({
      error: 'Invalid status. Allowed: pending, confirmed, rescheduled, rejected, completed.',
    });
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      const formatted = formatSupabaseAdminError(error, 'Failed to update booking status');
      return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
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
    const formatted = formatSupabaseAdminError(err, 'Failed to update booking status');
    return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
  }
}
