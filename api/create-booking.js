import { createClient } from '@supabase/supabase-js';

/**
 * Vercel serverless function: create a free-trial (or unpaid) booking.
 * Uses the Supabase service role key so inserts are not blocked by RLS.
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({
      error: 'Booking is not configured yet. Please contact info@jdscience.co.uk.',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }
  body = body || {};

  const { name, email, phone, level, subject, message, sessionType } = body;

  if (!name || !email || !level || !subject) {
    return res
      .status(400)
      .json({ error: 'Missing required fields (name, email, level, subject).' });
  }

  // This endpoint is only for free trials. Paid bookings go through Stripe.
  if (sessionType && sessionType !== 'trial') {
    return res.status(400).json({
      error: 'Paid sessions must use the checkout endpoint.',
    });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Keep the row aligned with the existing bookings table schema.
    // (Do not send columns that may not exist, e.g. amount_total.)
    const insertRow = {
      student_name: String(name).trim(),
      student_email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : null,
      level: String(level).trim(),
      subject: String(subject).trim(),
      session_type: 'trial',
      status: 'confirmed',
      meta: message ? { message: String(message).slice(0, 2000) } : null,
    };

    let { data, error } = await supabase
      .from('bookings')
      .insert([insertRow])
      .select()
      .single();

    // If `meta` column is missing, retry without it.
    if (error && /meta/i.test(error.message || '')) {
      const { meta, ...withoutMeta } = insertRow;
      ({ data, error } = await supabase
        .from('bookings')
        .insert([withoutMeta])
        .select()
        .single());
    }

    if (error) {
      console.error('Supabase insert error (trial booking):', error);
      return res.status(500).json({ error: error.message || 'Failed to save booking' });
    }

    return res.status(200).json({ ok: true, booking: data });
  } catch (err) {
    console.error('create-booking failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to create booking' });
  }
}
