import { createClient } from '@supabase/supabase-js';
import {
  PROFILE_PHOTO_EXTENSIONS,
  PUBLIC_TUTOR_SELECT,
  TUTOR_STORAGE_BUCKET,
  attachTutorAssetUrls,
  attachTutorAssetUrlsToMany,
  mimeTypeForTutorPath,
  normalizeTutorStoragePath,
  toPublicTutor,
} from './_lib/tutors.js';

function noStore(res) {
  res.setHeader('Cache-Control', 'no-store');
}

function getFileExtension(path) {
  const parts = String(path || '').toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

async function serveTutorPhoto(req, res, supabase, slug) {
  if (!slug) {
    noStore(res);
    return res.status(400).json({ error: 'Missing tutor slug.' });
  }

  const { data, error } = await supabase
    .from('tutor_profiles')
    .select('public_slug, profile_photo_path, profile_status, is_published')
    .eq('profile_status', 'approved')
    .eq('is_published', true)
    .eq('public_slug', slug)
    .maybeSingle();

  if (error) {
    noStore(res);
    return res.status(500).json({ error: error.message || 'Failed to load tutor photo.' });
  }

  const photoPath = normalizeTutorStoragePath(data?.profile_photo_path);
  if (!data || !photoPath || !photoPath.startsWith('applications/profile-photo/')) {
    noStore(res);
    return res.status(404).json({ error: 'Tutor photo not found.' });
  }

  const extension = getFileExtension(photoPath);
  if (!PROFILE_PHOTO_EXTENSIONS.has(extension)) {
    noStore(res);
    return res.status(404).json({ error: 'Tutor photo not found.' });
  }

  const etag = `"${photoPath.split('/').pop()}"`;
  if (req.headers['if-none-match'] === etag) {
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    return res.status(304).end();
  }

  const { data: file, error: downloadError } = await supabase.storage
    .from(TUTOR_STORAGE_BUCKET)
    .download(photoPath);

  if (downloadError || !file) {
    noStore(res);
    return res.status(404).json({ error: 'Tutor photo not found.' });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  res.setHeader('Content-Type', mimeTypeForTutorPath(photoPath));
  res.setHeader('Content-Length', String(buffer.length));
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  return res.status(200).send(buffer);
}

export default async function handler(req, res) {
  const wantsPhoto = String(req.query?.asset || req.query?.kind || '').trim().toLowerCase() === 'photo';

  if (req.method !== 'GET' && !(wantsPhoto && req.method === 'HEAD')) {
    res.setHeader('Allow', wantsPhoto ? 'GET, HEAD' : 'GET');
    noStore(res);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    noStore(res);
    return res.status(500).json({ error: 'Server not configured for tutor profiles.' });
  }

  try {
    const slug = String(req.query?.slug || '').trim();
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    if (wantsPhoto) {
      return serveTutorPhoto(req, res, supabase, slug);
    }

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
      // Photo URLs are stable same-origin paths; allow short public caching.
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
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

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.status(200).json({ ok: true, tutors: tutorsWithAssets.map(toPublicTutor) });
  } catch (err) {
    noStore(res);
    return res.status(500).json({ error: err?.message || 'Failed to load tutor profiles' });
  }
}
