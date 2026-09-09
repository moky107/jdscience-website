import { attachTutorAssetUrlsToMany, parseRequestBody } from './_lib/tutors.js';
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

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('tutor_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase select error (admin tutor applications):', error);
      const formatted = formatSupabaseAdminError(error, 'Failed to load tutor applications');
      return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
    }

    const applications = await attachTutorAssetUrlsToMany(supabase, data || [], true);

    return res.status(200).json({ ok: true, applications });
  } catch (err) {
    console.error('admin-tutor-applications failed:', err?.message || err);
    const formatted = formatSupabaseAdminError(err, 'Failed to load tutor applications');
    return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
  }
}
