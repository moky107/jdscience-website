import { randomUUID } from 'node:crypto';
import {
  FEATURED_THUMBNAIL_BUCKET,
  FEATURED_THUMBNAIL_MAX_BYTES,
  FEATURED_THUMBNAIL_MIME_TYPES,
  FEATURED_VIDEO_BUCKET,
  FEATURED_VIDEO_DEFAULT_MAX_BYTES,
  checkYouTubePublicEmbed,
  featuredVideoMaxBytesFromEnv,
  formatBytes,
  isAbsoluteHttpUrl,
  isAllowedFeaturedThumbnailFile,
  isAllowedFeaturedVideoFile,
  parseYouTubeId,
  thumbnailContentType,
  validateFeaturedVideoInput,
  youTubeThumbnailUrl,
} from '../../src/featuredVideo.js';
import { ADMIN_RESOURCE_EMAILS, readBearerToken } from './resourceUpload.js';

/*
 * "Video of the Day" data layer.
 *
 * Records live in public.featured_videos (supabase/migrations/20261102_featured_videos.sql).
 * Until that migration has been run, the same records are kept as JSON in
 * public.site_settings (key = 'featured_videos') so the feature works straight
 * away. Once the table exists, any records in site_settings are copied across
 * on the next request and the temporary entry is removed.
 */

const TABLE = 'featured_videos';
const SETTINGS_KEY = 'featured_videos';
const ADMIN_ACTIONS = new Set([
  'fv-list',
  'fv-prepare-upload',
  'fv-check-youtube',
  'fv-save',
  'fv-publish',
  'fv-unpublish',
  'fv-delete',
  'fv-discard-uploads',
]);
const UPLOAD_PREFIX = { video: 'videos/', thumbnail: 'thumbnails/' };

function featuredVideoAdminEmails() {
  const extra = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...ADMIN_RESOURCE_EMAILS.map((email) => email.toLowerCase()), ...extra])];
}

function configuredVideoMaxBytes() {
  return featuredVideoMaxBytesFromEnv(process.env);
}

function trim(value, max = 5000) {
  return String(value ?? '').trim().slice(0, max);
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

function isMissingTableError(error) {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return code === 'PGRST205' || code === '42P01'
    || (/featured_videos/i.test(message) && /schema cache|does not exist|not find/i.test(message));
}

function sortNewestFirst(rows) {
  return [...rows].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
}

/* ---------------------------------- storage backends ---------------------------------- */

async function readSettingsRows(supabase) {
  const { data, error } = await supabase.from('site_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
  if (error) throw new Error(error.message || 'Could not read featured videos.');
  if (!data?.value) return [];
  try {
    const parsed = JSON.parse(data.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeSettingsRows(supabase, rows) {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key: SETTINGS_KEY, value: JSON.stringify(sortNewestFirst(rows)) }, { onConflict: 'key' });
  if (error) throw new Error(error.message || 'Could not save featured videos.');
}

async function migrateSettingsIntoTable(supabase) {
  let rows;
  try {
    rows = await readSettingsRows(supabase);
  } catch {
    return;
  }
  if (!rows.length) return;
  const published = rows.find((row) => row.is_published);
  const prepared = rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    video_type: row.video_type,
    video_url: row.video_url,
    thumbnail_url: row.thumbnail_url ?? null,
    resource_link: row.resource_link ?? null,
    is_published: false,
    created_at: row.created_at,
    updated_at: row.updated_at || row.created_at,
  }));
  const { error } = await supabase.from(TABLE).upsert(prepared, { onConflict: 'id' });
  if (error) {
    console.error('featured video migration failed:', error.message);
    return;
  }
  if (published) {
    await supabase.from(TABLE).update({ is_published: false }).eq('is_published', true).neq('id', published.id);
    await supabase.from(TABLE).update({ is_published: true }).eq('id', published.id);
  }
  await supabase.from('site_settings').delete().eq('key', SETTINGS_KEY);
}

export async function createFeaturedVideoStore(supabase) {
  const probe = await supabase.from(TABLE).select('id').limit(1);
  const backend = probe.error ? (isMissingTableError(probe.error) ? 'settings' : null) : 'table';
  if (!backend) throw new Error(probe.error.message || 'Could not load featured videos.');

  if (backend === 'table') {
    await migrateSettingsIntoTable(supabase);
    const single = async (query, fallback) => {
      const { data, error } = await query;
      if (error) throw new Error(error.message || fallback);
      return data;
    };
    return {
      backend,
      list: () => single(supabase.from(TABLE).select('*').order('created_at', { ascending: false }), 'Could not load featured videos.'),
      get: (id) => single(supabase.from(TABLE).select('*').eq('id', id).maybeSingle(), 'Could not load featured video.'),
      published: () => single(
        supabase.from(TABLE).select('*').eq('is_published', true).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        'Could not load featured video.',
      ),
      insert: (fields) => single(supabase.from(TABLE).insert([{ ...fields, is_published: false }]).select('*').single(), 'Could not save featured video.'),
      update: (id, fields) => single(
        supabase.from(TABLE).update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id).select('*').single(),
        'Could not update featured video.',
      ),
      async publishOnly(id) {
        const rpc = await supabase.rpc('publish_featured_video', { target_id: id });
        if (!rpc.error && rpc.data) {
          return Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
        }
        // Fallback when the publish_featured_video() migration function is not yet installed.
        await single(supabase.from(TABLE).update({ is_published: false }).eq('is_published', true).neq('id', id).select('id'), 'Could not unpublish the previous video.');
        return single(
          supabase.from(TABLE).update({
            is_published: true,
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('id', id).select('*').single(),
          'Could not publish featured video.',
        );
      },
      async remove(id) {
        await single(supabase.from(TABLE).delete().eq('id', id).select('id'), 'Could not delete featured video.');
      },
    };
  }

  const mutate = async (fn) => {
    const rows = await readSettingsRows(supabase);
    const result = fn(rows);
    await writeSettingsRows(supabase, result.rows);
    return result.value;
  };
  const now = () => new Date().toISOString();
  const requireRow = (rows, id) => {
    const row = rows.find((item) => item.id === id);
    if (!row) throw new Error('Featured video not found.');
    return row;
  };
  return {
    backend,
    list: async () => sortNewestFirst(await readSettingsRows(supabase)),
    get: async (id) => (await readSettingsRows(supabase)).find((row) => row.id === id) || null,
    published: async () => (await readSettingsRows(supabase)).find((row) => row.is_published) || null,
    insert: (fields) => mutate((rows) => {
      const row = { id: randomUUID(), ...fields, is_published: false, created_at: now(), updated_at: now() };
      return { rows: [row, ...rows], value: row };
    }),
    update: (id, fields) => mutate((rows) => {
      const current = requireRow(rows, id);
      const row = { ...current, ...fields, id, updated_at: now() };
      return { rows: rows.map((item) => (item.id === id ? row : item)), value: row };
    }),
    publishOnly: (id) => mutate((rows) => {
      requireRow(rows, id);
      const next = rows.map((item) => (item.id === id
        ? { ...item, is_published: true, updated_at: now() }
        : { ...item, is_published: false }));
      return { rows: next, value: next.find((item) => item.id === id) };
    }),
    remove: (id) => mutate((rows) => ({ rows: rows.filter((item) => item.id !== id), value: null })),
  };
}

/* ---------------------------------- presentation ---------------------------------- */

function publicStorageUrl(supabase, bucket, value) {
  const raw = trim(value, 1000);
  if (!raw) return '';
  if (isAbsoluteHttpUrl(raw)) return raw;
  return supabase.storage.from(bucket).getPublicUrl(raw).data.publicUrl;
}

export function presentFeaturedVideo(supabase, row, { includeAdmin = false } = {}) {
  if (!row) return null;
  const youtubeId = row.video_type === 'youtube' ? parseYouTubeId(row.video_url) : null;
  const thumbnailSrc = publicStorageUrl(supabase, FEATURED_THUMBNAIL_BUCKET, row.thumbnail_url)
    || (youtubeId ? youTubeThumbnailUrl(youtubeId) : '');
  const video = {
    id: row.id,
    title: row.title,
    description: row.description || '',
    video_type: row.video_type,
    video_src: row.video_type === 'mp4' ? publicStorageUrl(supabase, FEATURED_VIDEO_BUCKET, row.video_url) : '',
    youtube_id: youtubeId,
    thumbnail_src: thumbnailSrc,
    has_custom_thumbnail: Boolean(row.thumbnail_url),
    resource_link: row.resource_link || '',
    updated_at: row.updated_at || row.created_at || null,
  };
  if (includeAdmin) {
    Object.assign(video, {
      video_url: row.video_url,
      thumbnail_url: row.thumbnail_url || '',
      is_published: Boolean(row.is_published),
      created_at: row.created_at || null,
    });
  }
  return video;
}

/* ---------------------------------- storage helpers ---------------------------------- */

async function ensureBucket(supabase, id, options) {
  const { data, error } = await supabase.storage.getBucket(id);
  if (data && !error) return data;
  const created = await supabase.storage.createBucket(id, options);
  if (created.error && !/already exists/i.test(created.error.message || '')) {
    throw new Error(`Storage bucket ${id} is unavailable: ${created.error.message}`);
  }
  const again = await supabase.storage.getBucket(id);
  return again.data || null;
}

async function featuredStorageLimits(supabase) {
  const configuredMax = configuredVideoMaxBytes();
  const videoBucket = await ensureBucket(supabase, FEATURED_VIDEO_BUCKET, {
    public: true,
    fileSizeLimit: configuredMax,
    allowedMimeTypes: ['video/mp4'],
  });
  const thumbBucket = await ensureBucket(supabase, FEATURED_THUMBNAIL_BUCKET, {
    public: true,
    fileSizeLimit: FEATURED_THUMBNAIL_MAX_BYTES,
    allowedMimeTypes: FEATURED_THUMBNAIL_MIME_TYPES,
  });
  const bucketMax = Number(videoBucket?.file_size_limit) || 0;
  // Honour the configured env cap, but never exceed a smaller live bucket limit.
  const maxVideoBytes = bucketMax > 0
    ? Math.min(configuredMax, bucketMax)
    : configuredMax || FEATURED_VIDEO_DEFAULT_MAX_BYTES;
  return {
    maxVideoBytes,
    maxThumbnailBytes: Number(thumbBucket?.file_size_limit) || FEATURED_THUMBNAIL_MAX_BYTES,
  };
}

function isManagedPath(kind, path) {
  const raw = trim(path, 1000);
  return Boolean(raw) && !isAbsoluteHttpUrl(raw) && raw.startsWith(UPLOAD_PREFIX[kind]) && !raw.includes('..');
}

function storedFilesFor(row) {
  const files = [];
  if (row?.video_type === 'mp4' && isManagedPath('video', row.video_url)) {
    files.push({ bucket: FEATURED_VIDEO_BUCKET, path: row.video_url });
  }
  if (isManagedPath('thumbnail', row?.thumbnail_url)) {
    files.push({ bucket: FEATURED_THUMBNAIL_BUCKET, path: row.thumbnail_url });
  }
  return files;
}

/** Deletes storage files that no remaining record references. */
async function deleteUnreferencedFiles(supabase, files, remainingRows) {
  const referenced = new Set(remainingRows.flatMap((row) => storedFilesFor(row).map((f) => `${f.bucket}/${f.path}`)));
  const byBucket = new Map();
  for (const file of files) {
    if (referenced.has(`${file.bucket}/${file.path}`)) continue;
    if (!byBucket.has(file.bucket)) byBucket.set(file.bucket, new Set());
    byBucket.get(file.bucket).add(file.path);
  }
  const removed = [];
  for (const [bucket, paths] of byBucket) {
    const { data, error } = await supabase.storage.from(bucket).remove([...paths]);
    if (error) throw new Error(`Could not delete files from storage: ${error.message}`);
    removed.push(...(data || []).map((item) => `${bucket}/${item.name}`));
  }
  return removed;
}

/* ---------------------------------- request handlers ---------------------------------- */

export function wantsFeaturedVideoPublicRequest(req) {
  const kind = trim(req.query?.kind, 40);
  return kind === 'featured-video' || String(req.url || '').includes('/api/featured-video');
}

export async function handleFeaturedVideoPublicRequest(req, res, supabase) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const store = await createFeaturedVideoStore(supabase);
    const row = await store.published();
    // Browsers always revalidate (so a newly published video shows straight away);
    // only Vercel's edge keeps a short shared copy.
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('Vercel-CDN-Cache-Control', 'max-age=15, stale-while-revalidate=30');
    return res.status(200).json({ ok: true, video: presentFeaturedVideo(supabase, row) });
  } catch (err) {
    console.error('featured-video failed:', err?.message || err);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ error: 'Could not load the featured video.' });
  }
}

export function wantsFeaturedVideoAdminRequest(req, body) {
  const scope = trim(req.query?.scope, 40);
  return scope === 'featured-video'
    || String(req.url || '').includes('/api/admin-featured-video')
    || ADMIN_ACTIONS.has(trim(body?.action, 40));
}

/** Confirms the Supabase session token belongs to an authorised admin email. */
export async function verifyFeaturedVideoAdmin(supabase, req) {
  const token = readBearerToken(req);
  if (!token) {
    return {
      ok: false,
      status: 401,
      error: 'Sign in to jdscience.co.uk with your administrator account (Login, top right), then retry.',
    };
  }
  const { data, error } = await supabase.auth.getUser(token);
  const email = String(data?.user?.email || '').toLowerCase();
  if (error || !email) {
    return { ok: false, status: 401, error: 'Your admin session has expired. Sign in again and retry.' };
  }
  if (!featuredVideoAdminEmails().includes(email)) {
    return { ok: false, status: 403, error: 'Only JD Science administrators can manage the Video of the Day.' };
  }
  return { ok: true, email };
}

async function listResponse(res, supabase, store, extra = {}) {
  const rows = await store.list();
  const limits = await featuredStorageLimits(supabase);
  return res.status(200).json({
    ok: true,
    backend: store.backend,
    limits,
    videos: rows.map((row) => presentFeaturedVideo(supabase, row, { includeAdmin: true })),
    ...extra,
  });
}

export async function handleFeaturedVideoAdminRequest(req, res, body, supabase) {
  res.setHeader('Cache-Control', 'no-store');
  const action = trim(body?.action, 40) || 'fv-list';

  try {
    const auth = await verifyFeaturedVideoAdmin(supabase, req);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    if (action === 'fv-prepare-upload') {
      const kind = trim(body.kind, 20) === 'thumbnail' ? 'thumbnail' : 'video';
      const filename = trim(body.filename, 200);
      const contentType = trim(body.contentType, 100).toLowerCase();
      const fileSize = Number(body.fileSize);
      const limits = await featuredStorageLimits(supabase);
      const maxBytes = kind === 'video' ? limits.maxVideoBytes : limits.maxThumbnailBytes;

      if (!filename) return res.status(400).json({ error: 'File name is missing.' });
      if (!Number.isFinite(fileSize) || fileSize <= 0) return res.status(400).json({ error: 'The selected file is empty.' });
      if (fileSize > maxBytes) {
        const youtubeHint = kind === 'video'
          ? ' Compress the MP4, use a YouTube link instead, or ask an administrator to raise FEATURED_VIDEO_MAX_MB (and the matching Supabase upload limit).'
          : '';
        return res.status(400).json({
          error: `This file is ${formatBytes(fileSize)}. The current upload limit is ${formatBytes(maxBytes)}.${youtubeHint}`,
        });
      }
      if (kind === 'video' && !isAllowedFeaturedVideoFile({ name: filename, type: contentType })) {
        return res.status(400).json({ error: 'Upload an MP4 video file (.mp4).' });
      }
      if (kind === 'thumbnail' && !isAllowedFeaturedThumbnailFile({ name: filename, type: contentType })) {
        return res.status(400).json({ error: 'Upload a JPG, PNG or WebP thumbnail image.' });
      }

      const bucket = kind === 'video' ? FEATURED_VIDEO_BUCKET : FEATURED_THUMBNAIL_BUCKET;
      const ext = kind === 'video' ? 'mp4' : ({ 'image/png': 'png', 'image/webp': 'webp' }[thumbnailContentType({ name: filename, type: contentType })] || 'jpg');
      const base = slug(filename.replace(/\.[^.]+$/, '')) || kind;
      const path = `${UPLOAD_PREFIX[kind]}${Date.now()}-${base}.${ext}`;
      const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
      if (error || !data?.signedUrl) {
        return res.status(500).json({ error: error?.message || 'Could not prepare the upload.' });
      }
      return res.status(200).json({
        ok: true,
        kind,
        bucket,
        path,
        signedUrl: data.signedUrl,
        publicUrl: publicStorageUrl(supabase, bucket, path),
      });
    }

    const store = await createFeaturedVideoStore(supabase);

    if (action === 'fv-list') {
      return listResponse(res, supabase, store);
    }

    if (action === 'fv-check-youtube') {
      const check = await checkYouTubePublicEmbed(body.video_url || body.url || '');
      return res.status(check.ok ? 200 : 400).json(check);
    }

    if (action === 'fv-save') {
      const input = body.video || {};
      const parsed = validateFeaturedVideoInput(input);
      if (!parsed.ok) return res.status(400).json({ error: parsed.error });
      const fields = parsed.fields;
      if (fields.video_type === 'mp4' && !isManagedPath('video', fields.video_url) && !isAbsoluteHttpUrl(fields.video_url)) {
        return res.status(400).json({ error: 'The uploaded video path is invalid. Upload the MP4 again.' });
      }
      if (fields.thumbnail_url && !isManagedPath('thumbnail', fields.thumbnail_url) && !isAbsoluteHttpUrl(fields.thumbnail_url)) {
        return res.status(400).json({ error: 'The uploaded thumbnail path is invalid. Upload the image again.' });
      }
      if (fields.video_type === 'youtube') {
        const check = await checkYouTubePublicEmbed(fields.video_url);
        if (!check.embeddable) {
          return res.status(400).json({ error: check.error, youtubeCheck: check });
        }
      }

      const id = trim(input.id, 64);
      let saved;
      let removedFiles = [];
      if (id) {
        const previous = await store.get(id);
        if (!previous) return res.status(404).json({ error: 'That featured video no longer exists.' });
        saved = await store.update(id, fields);
        if (body.deleteReplacedFiles === true) {
          const keep = new Set(storedFilesFor(saved).map((f) => `${f.bucket}/${f.path}`));
          const replaced = storedFilesFor(previous).filter((f) => !keep.has(`${f.bucket}/${f.path}`));
          if (replaced.length) removedFiles = await deleteUnreferencedFiles(supabase, replaced, await store.list());
        }
      } else {
        saved = await store.insert(fields);
      }
      if (body.publish === true) saved = await store.publishOnly(saved.id);
      return listResponse(res, supabase, store, {
        video: presentFeaturedVideo(supabase, saved, { includeAdmin: true }),
        removedFiles,
      });
    }

    if (action === 'fv-publish' || action === 'fv-unpublish') {
      const id = trim(body.id, 64);
      if (!id) return res.status(400).json({ error: 'Missing video id.' });
      const existing = await store.get(id);
      if (!existing) return res.status(404).json({ error: 'That featured video no longer exists.' });
      if (action === 'fv-publish') {
        if (existing.video_type === 'youtube') {
          const check = await checkYouTubePublicEmbed(existing.video_url);
          if (!check.embeddable) {
            return res.status(400).json({ error: check.error, youtubeCheck: check });
          }
        }
        await store.publishOnly(id);
      } else await store.update(id, { is_published: false });
      return listResponse(res, supabase, store);
    }

    if (action === 'fv-delete') {
      const id = trim(body.id, 64);
      if (!id) return res.status(400).json({ error: 'Missing video id.' });
      if (body.confirm !== true) return res.status(400).json({ error: 'Deletion must be confirmed.' });
      const existing = await store.get(id);
      if (!existing) return res.status(404).json({ error: 'That featured video no longer exists.' });
      await store.remove(id);
      const removedFiles = await deleteUnreferencedFiles(supabase, storedFilesFor(existing), await store.list());
      return listResponse(res, supabase, store, { removedFiles });
    }

    if (action === 'fv-discard-uploads') {
      const files = (Array.isArray(body.files) ? body.files : [])
        .slice(0, 10)
        .map((file) => ({ kind: file?.kind === 'thumbnail' ? 'thumbnail' : 'video', path: trim(file?.path, 1000) }))
        .filter((file) => isManagedPath(file.kind, file.path))
        .map((file) => ({ bucket: file.kind === 'video' ? FEATURED_VIDEO_BUCKET : FEATURED_THUMBNAIL_BUCKET, path: file.path }));
      const removedFiles = files.length ? await deleteUnreferencedFiles(supabase, files, await store.list()) : [];
      return res.status(200).json({ ok: true, removedFiles });
    }

    return res.status(400).json({ error: 'Unknown featured video action.' });
  } catch (err) {
    console.error('admin featured video failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Featured video request failed.' });
  }
}
