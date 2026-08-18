import { createClient } from '@supabase/supabase-js';
import {
  attachTutorAssetUrls,
  normalizeTutorProfileFields,
  parseBoolean,
  parseRequestBody,
} from './_lib/tutors.js';

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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for database access.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase
      .from('tutor_profiles')
      .update(update)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to update tutor profile' });
    }

    const application = await attachTutorAssetUrls(supabase, data, true);
    return res.status(200).json({ ok: true, application });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to update tutor profile' });
  }
}
