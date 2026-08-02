import { createClient } from '@supabase/supabase-js';
import { PUBLIC_TUTOR_SELECT, attachTutorAssetUrls, attachTutorAssetUrlsToMany, toPublicTutor } from './_lib/tutors.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for tutor profiles.' });
  }

  try {
    const slug = String(req.query?.slug || '').trim();
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (slug) {
      const { data, error } = await supabase
        .from('tutor_profiles')
        .select(PUBLIC_TUTOR_SELECT)
        .eq('profile_status', 'approved')
        .eq('is_published', true)
        .eq('public_slug', slug)
        .maybeSingle();

      if (error) {
        return res.status(500).json({ error: error.message || 'Failed to load tutor profile' });
      }

      if (!data) {
        return res.status(404).json({ error: 'Tutor profile not found.' });
      }

      const withAssets = await attachTutorAssetUrls(supabase, data, false);
      return res.status(200).json({ ok: true, tutor: toPublicTutor(withAssets) });
    }

    const { data, error } = await supabase
      .from('tutor_profiles')
      .select(PUBLIC_TUTOR_SELECT)
      .eq('profile_status', 'approved')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to load tutor profiles' });
    }

    const tutorsWithAssets = await attachTutorAssetUrlsToMany(supabase, data || [], false);

    return res.status(200).json({ ok: true, tutors: tutorsWithAssets.map(toPublicTutor) });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to load tutor profiles' });
  }
}
