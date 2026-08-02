import { createClient } from '@supabase/supabase-js';
import { TUTOR_ALLOWED_STATUSES, attachTutorAssetUrls, parseRequestBody, parseBoolean, safeTrim } from './_lib/tutors.js';

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
  const profile_status = safeTrim(body.profile_status, 40).toLowerCase();
  const admin_note = safeTrim(body.admin_note, 2000) || null;
  const is_published = parseBoolean(body.is_published);

  if (!id) return res.status(400).json({ error: 'Missing tutor application id.' });
  if (!TUTOR_ALLOWED_STATUSES.has(profile_status)) {
    return res.status(400).json({ error: 'Invalid status. Allowed: pending, approved, rejected, suspended.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for database access.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const nextPublished = profile_status === 'approved' ? true : is_published && profile_status === 'approved';
    const { data, error } = await supabase
      .from('tutor_profiles')
      .update({ profile_status, admin_note, is_published: nextPublished })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to update tutor profile status' });
    }

    const application = await attachTutorAssetUrls(supabase, data, true);

    return res.status(200).json({ ok: true, application });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to update tutor profile status' });
  }
}
