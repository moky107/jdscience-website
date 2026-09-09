import { TUTOR_ALLOWED_STATUSES, attachTutorAssetUrls, parseRequestBody, parseBoolean, safeTrim } from './_lib/tutors.js';
import { requireAdminPassword } from './_lib/adminAuth.js';
import { createServiceRoleClient, formatSupabaseAdminError } from './_lib/supabaseAdmin.js';

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
  const profile_status = safeTrim(body.profile_status, 40).toLowerCase();
  const admin_note = safeTrim(body.admin_note, 2000) || null;
  const is_published = parseBoolean(body.is_published);

  if (!id) return res.status(400).json({ error: 'Missing tutor application id.' });
  if (!TUTOR_ALLOWED_STATUSES.has(profile_status)) {
    return res.status(400).json({ error: 'Invalid status. Allowed: pending, approved, rejected, suspended.' });
  }

  try {
    const supabase = createServiceRoleClient();
    const nextPublished = profile_status === 'approved' ? true : is_published && profile_status === 'approved';
    const { data, error } = await supabase
      .from('tutor_profiles')
      .update({ profile_status, admin_note, is_published: nextPublished })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      const formatted = formatSupabaseAdminError(error, 'Failed to update tutor profile status');
      return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
    }

    const application = await attachTutorAssetUrls(supabase, data, true);

    return res.status(200).json({ ok: true, application });
  } catch (err) {
    const formatted = formatSupabaseAdminError(err, 'Failed to update tutor profile status');
    return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
  }
}
