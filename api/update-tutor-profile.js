import {
  attachTutorAssetUrls,
  normalizeTutorProfileFields,
  parseBoolean,
  parseRequestBody,
} from './_lib/tutors.js';
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
  if (!id) return res.status(400).json({ error: 'Missing tutor application id.' });

  const parsed = normalizeTutorProfileFields(body);
  if (!parsed.ok) {
    return res.status(400).json({ error: parsed.error });
  }

  const publish = parseBoolean(body.publish);
  const update = { ...parsed.fields };
  if (publish) {
    update.profile_status = 'approved';
    update.is_published = true;
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('tutor_profiles')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      const formatted = formatSupabaseAdminError(error, 'Failed to update tutor profile');
      return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
    }

    const application = await attachTutorAssetUrls(supabase, data, true);
    return res.status(200).json({ ok: true, application });
  } catch (err) {
    const formatted = formatSupabaseAdminError(err, 'Failed to update tutor profile');
    return res.status(formatted.status).json({ error: formatted.error, code: formatted.code });
  }
}
