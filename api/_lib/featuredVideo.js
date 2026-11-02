import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { safeTrim, slugify } from './tutors.js';
import { ADMIN_RESOURCE_EMAILS, readBearerToken, resourceSupabaseConfig } from './resourceUpload.js';
import {
  FEATURED_THUMBNAIL_MAX_BYTES,
  FEATURED_VIDEO_DEFAULT_MAX_BYTES,
  formatBytes,
  isMp4Upload,
  parseYouTubeId,
  thumbnailContentType,
  toPublicFeaturedVideo,
  validateFeaturedVideoInput,
} from '../../src/featuredVideo.js';

export const FEATURED_VIDEO_TABLE = 'featured_videos';
export const FEATURED_VIDEO_BUCKET = 'featured-videos';
export const FEATURED_THUMBNAIL_BUCKET = 'featured-thumbnails';
/** Fallback store (JSON array in public.site_settings) used until the migration has been run. */
export const FEATURED_VIDEO_SETTINGS_KEY = 'featured_videos';
export const FEATURED_VIDEO_MIGRATION_FILE = 'supabase/migrations/20261102_featured_videos.sql';

const STORAGE_PATH_RE = /^(videos|thumbnails)\/[a-z0-9][a-z0-9/_.-]{0,300}$/;

export function featuredVideoMaxBytes() {
  const mb = Number(process.env.FEATURED_VIDEO_MAX_MB);
  return Number.isFinite(mb) && mb > 0 ? Math.round(mb * 1024 * 1024) : FEATURED_VIDEO_DEFAULT_MAX_BYTES;
}

export function featuredVideoAdminEmails() {
  const extra = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...ADMIN_RESOURCE_EMAILS.map((e) => e.toLowerCase()), ...extra])];
}

export function isMissingFeaturedTable(error) {
  if (!error) return false;
  const code = String(error.code || '');
  const message = String(error.message || '');
  if (code === 'PGRST205' || code === '42P01') return /featured_videos/i.test(message) || code === '42P01';
  return /could not find the table 'public\.featured_videos'|relation "(public\.)?featured_videos" does not exist/i.test(message);
}

function isMissingSettingsTable(error) {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return code === 'PGRST205' || code === '42P01' || /site_settings/i.test(message);
}

function isMissingPublishFunction(error) {
  const code = String(error?.code || '');
  return code === 'PGRST202' || code === '42883' || /publish_featured_video/i.test(String(error?.message || ''));
}

export function isSafeStoragePath(path, kind) {
  const text = String(path || '');
  if (!STORAGE_PATH_RE.test(text) || text.includes('..') || text.includes('//')) return false;
  if (kind === 'video') return text.startsWith('videos/');
  if (kind === 'thumbnail') return text.startsWith('thumbnails/');
  return true;
}

const THUMBNAIL_EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export function buildFeaturedStoragePath(kind, fileName, now = new Date(), contentType = '') {
  const ext = kind === 'video'
    ? 'mp4'
    : THUMBNAIL_EXTENSIONS[thumbnailContentType({ fileName, contentType })] || 'jpg';
  const base = slugify(String(fileName || '').replace(/\.[^.]+$/, '')).slice(0, 60) || kind;
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const suffix = randomUUID().slice(0, 8);
  return `${kind === 'video' ? 'videos' : 'thumbnails'}/${yyyy}/${mm}/${now.getTime()}-${suffix}-${base}.${ext}`;
}

export function validateUploadRequest(body, maxVideoBytes = featuredVideoMaxBytes()) {
  const kind = safeTrim(body.kind, 20) === 'thumbnail' ? 'thumbnail' : (safeTrim(body.kind, 20) === 'video' ? 'video' : '');
  const fileName = safeTrim(body.file_name, 200);
  const contentType = safeTrim(body.content_type, 120).toLowerCase();
  const fileSize = Number(body.file_size);

  if (!kind) return { ok: false, error: 'Choose whether you are uploading a video or a thumbnail.' };
  if (!fileName) return { ok: false, error: 'File name is missing.' };
  if (!Number.isFinite(fileSize) || fileSize <= 0) return { ok: false, error: 'File size is invalid.' };

  if (kind === 'video') {
    if (!isMp4Upload({ fileName, contentType })) {
      return { ok: false, error: 'Only MP4 video files can be uploaded. Export the video as .mp4 (H.264) and try again.' };
    }
    if (fileSize > maxVideoBytes) {
      return {
        ok: false,
        error: `This video is ${formatBytes(fileSize)}. The current upload limit is ${formatBytes(maxVideoBytes)} — compress the MP4 or use a YouTube link instead.`,
      };
    }
    return { ok: true, kind, fileName, fileSize, contentType: 'video/mp4', bucket: FEATURED_VIDEO_BUCKET };
  }

  const type = thumbnailContentType({ fileName, contentType });
  if (!type) return { ok: false, error: 'Thumbnails must be JPG, PNG or WebP images.' };
  if (fileSize > FEATURED_THUMBNAIL_MAX_BYTES) {
    return { ok: false, error: `Thumbnail is too large (maximum ${formatBytes(FEATURED_THUMBNAIL_MAX_BYTES)}).` };
  }
  return { ok: true, kind, fileName, fileSize, contentType: type, bucket: FEATURED_THUMBNAIL_BUCKET };
}

function publicUrlFor(supabase, bucket, path) {
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

async function storageObjectExists(supabase, bucket, path) {
  const slash = path.lastIndexOf('/');
  const dir = path.slice(0, slash);
  const name = path.slice(slash + 1);
  const { data, error } = await supabase.storage.from(bucket).list(dir, { search: name, limit: 10 });
  if (error) return false;
  return (data || []).some((item) => item.name === name);
}

function toAdminVideo(row) {
  if (!row) return null;
  const publicShape = toPublicFeaturedVideo(row);
  return {
    ...publicShape,
    is_published: Boolean(row.is_published),
    created_at: row.created_at || null,
    video_storage_path: row.video_storage_path || null,
    thumbnail_storage_path: row.thumbnail_storage_path || null,
    resource_label: row.resource_label || '',
  };
}

function sortVideos(list) {
  return [...list].sort((a, b) => {
    if (Boolean(b.is_published) !== Boolean(a.is_published)) return b.is_published ? 1 : -1;
    return String(b.created_at || '').localeCompare(String(a.created_at || ''));
  });
}

/* ------------------------------ storage backends ------------------------------ */

function tableBackend(supabase) {
  const table = () => supabase.from(FEATURED_VIDEO_TABLE);
  return {
    name: 'table',
    async list() {
      const { data, error } = await table().select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return sortVideos(data || []);
    },
    async get(id) {
      const { data, error } = await table().select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data || null;
    },
    async published() {
      const { data, error } = await table()
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    },
    async insert(fields) {
      const { data, error } = await table().insert([{ ...fields, is_published: false }]).select('*').single();
      if (error) throw error;
      return data;
    },
    async update(id, fields) {
      const { data, error } = await table().update(fields).eq('id', id).select('*').maybeSingle();
      if (error) throw error;
      return data || null;
    },
    async publish(id) {
      const rpc = await supabase.rpc('publish_featured_video', { target_id: id });
      if (!rpc.error) return Array.isArray(rpc.data) ? rpc.data[0] : rpc.data;
      if (!isMissingPublishFunction(rpc.error)) throw rpc.error;
      const off = await table().update({ is_published: false }).eq('is_published', true).neq('id', id);
      if (off.error) throw off.error;
      const { data, error } = await table()
        .update({ is_published: true, published_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      return data || null;
    },
    async unpublishAll() {
      const { error } = await table().update({ is_published: false }).eq('is_published', true);
      if (error) throw error;
    },
    async remove(id) {
      const { error } = await table().delete().eq('id', id);
      if (error) throw error;
    },
  };
}

function settingsBackend(supabase) {
  async function read() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', FEATURED_VIDEO_SETTINGS_KEY)
      .maybeSingle();
    if (error) throw error;
    try {
      const parsed = JSON.parse(data?.value || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  async function write(list) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: FEATURED_VIDEO_SETTINGS_KEY, value: JSON.stringify(list) }, { onConflict: 'key' });
    if (error) throw error;
  }
  const now = () => new Date().toISOString();
  return {
    name: 'settings',
    async list() {
      return sortVideos(await read());
    },
    async get(id) {
      return (await read()).find((item) => item.id === id) || null;
    },
    async published() {
      return (await read()).find((item) => item.is_published) || null;
    },
    async insert(fields) {
      const list = await read();
      const row = { id: randomUUID(), ...fields, is_published: false, created_at: now(), updated_at: now(), published_at: null };
      list.push(row);
      await write(list);
      return row;
    },
    async update(id, fields) {
      const list = await read();
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) return null;
      list[index] = { ...list[index], ...fields, updated_at: now() };
      await write(list);
      return list[index];
    },
    async publish(id) {
      const list = await read();
      if (!list.some((item) => item.id === id)) return null;
      const stamp = now();
      const next = list.map((item) => (item.id === id
        ? { ...item, is_published: true, published_at: stamp, updated_at: stamp }
        : (item.is_published ? { ...item, is_published: false, updated_at: stamp } : item)));
      await write(next);
      return next.find((item) => item.id === id);
    },
    async unpublishAll() {
      const list = await read();
      if (!list.some((item) => item.is_published)) return;
      await write(list.map((item) => (item.is_published ? { ...item, is_published: false, updated_at: now() } : item)));
    },
    async remove(id) {
      await write((await read()).filter((item) => item.id !== id));
    },
  };
}

/** Uses the featured_videos table when it exists, otherwise the site_settings fallback. */
export async function resolveFeaturedVideoBackend(supabase) {
  const probe = await supabase.from(FEATURED_VIDEO_TABLE).select('id').limit(1);
  if (!probe.error) return tableBackend(supabase);
  if (!isMissingFeaturedTable(probe.error)) throw probe.error;

  const settings = await supabase.from('site_settings').select('key').limit(1);
  if (settings.error) {
    if (isMissingSettingsTable(settings.error)) return null;
    throw settings.error;
  }
  return settingsBackend(supabase);
}

function createServiceClient() {
  const { supabaseUrl, serviceRoleKey } = resourceSupabaseConfig();
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

/* --------------------------------- public API --------------------------------- */

export function wantsFeaturedVideoPublicRequest(req) {
  const kind = safeTrim(req.query?.kind, 40);
  const url = String(req.url || '');
  return kind === 'featured-video' || url.startsWith('/api/featured-video');
}

export async function handleFeaturedVideoPublicRequest(req, res, deps = {}) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = deps.supabase || createServiceClient();
  if (!supabase) return res.status(500).json({ error: 'Server not configured for database access.' });

  try {
    const backend = await resolveFeaturedVideoBackend(supabase);
    const row = backend ? await backend.published() : null;
    // Short CDN cache so a newly published video reaches every visitor within seconds.
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10, stale-while-revalidate=50');
    return res.status(200).json({ ok: true, video: toPublicFeaturedVideo(row), ...(backend ? {} : { setupRequired: true }) });
  } catch (err) {
    console.error('featured-video failed:', err?.message || err);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ error: 'Could not load the featured video.' });
  }
}

/* ---------------------------------- admin API --------------------------------- */

const ADMIN_ACTIONS = new Set([
  'fv-list',
  'fv-prepare-upload',
  'fv-save',
  'fv-publish',
  'fv-unpublish',
  'fv-delete',
  'fv-discard-upload',
]);

export function wantsFeaturedVideoAdminRequest(req, body) {
  const scope = safeTrim(req.query?.scope, 40);
  const url = String(req.url || '');
  const action = safeTrim(body?.action, 30);
  return scope === 'featured-video' || url.startsWith('/api/admin-featured-video') || ADMIN_ACTIONS.has(action);
}

/** Confirms the Supabase session token belongs to an authorised admin email. */
export async function verifyFeaturedVideoAdmin(supabase, req) {
  const token = readBearerToken(req);
  if (!token) {
    return { ok: false, status: 401, error: 'Sign in to jdscience.co.uk with your administrator account (Login, top right), then retry.' };
  }
  const { data, error } = await supabase.auth.getUser(token);
  const email = String(data?.user?.email || '').toLowerCase();
  if (error || !email) return { ok: false, status: 401, error: 'Your admin session has expired. Sign in again and retry.' };
  if (!featuredVideoAdminEmails().includes(email)) {
    return { ok: false, status: 403, error: 'Only JD Science administrators can manage the Video of the Day.' };
  }
  return { ok: true, email };
}

async function removeStorageObjects(supabase, backend, row, { excludeId } = {}) {
  const others = (await backend.list()).filter((item) => item.id !== (excludeId || row.id));
  const stillUsed = (path) => others.some((item) => item.video_storage_path === path || item.thumbnail_storage_path === path);
  const removed = [];
  for (const [bucket, path] of [
    [FEATURED_VIDEO_BUCKET, row.video_storage_path],
    [FEATURED_THUMBNAIL_BUCKET, row.thumbnail_storage_path],
  ]) {
    if (!path || stillUsed(path)) continue;
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) console.warn('featured-video storage cleanup failed:', bucket, path, error.message);
    else removed.push(path);
  }
  return removed;
}

async function buildSaveFields(supabase, input) {
  const videoType = safeTrim(input.video_type, 10).toLowerCase();
  const fields = { ...input };

  if (videoType === 'mp4') {
    const path = safeTrim(input.video_storage_path, 400);
    if (!isSafeStoragePath(path, 'video')) return { ok: false, status: 400, error: 'Upload an MP4 video before saving.' };
    if (!(await storageObjectExists(supabase, FEATURED_VIDEO_BUCKET, path))) {
      return { ok: false, status: 400, error: 'The uploaded video could not be found in storage. Please upload it again.' };
    }
    fields.video_url = publicUrlFor(supabase, FEATURED_VIDEO_BUCKET, path);
  }

  const thumbPath = safeTrim(input.thumbnail_storage_path, 400);
  if (thumbPath) {
    if (!isSafeStoragePath(thumbPath, 'thumbnail')) return { ok: false, status: 400, error: 'Thumbnail path is invalid.' };
    if (!(await storageObjectExists(supabase, FEATURED_THUMBNAIL_BUCKET, thumbPath))) {
      return { ok: false, status: 400, error: 'The uploaded thumbnail could not be found. Please upload it again.' };
    }
    fields.thumbnail_url = publicUrlFor(supabase, FEATURED_THUMBNAIL_BUCKET, thumbPath);
  } else {
    fields.thumbnail_url = '';
  }

  const parsed = validateFeaturedVideoInput(fields);
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };

  return {
    ok: true,
    fields: {
      ...parsed.fields,
      video_storage_path: videoType === 'mp4' ? safeTrim(input.video_storage_path, 400) : null,
      thumbnail_storage_path: thumbPath || null,
    },
  };
}

export async function handleFeaturedVideoAdminRequest(req, res, body, deps = {}) {
  const supabase = deps.supabase || createServiceClient();
  if (!supabase) return res.status(500).json({ error: 'Server not configured for database access.' });

  const verify = deps.verifyAdmin || verifyFeaturedVideoAdmin;
  const auth = await verify(supabase, req);
  if (!auth.ok) return res.status(auth.status || 401).json({ error: auth.error });

  const action = safeTrim(body.action, 30) || 'fv-list';
  const maxVideoBytes = featuredVideoMaxBytes();

  try {
    if (action === 'fv-prepare-upload') {
      const upload = validateUploadRequest(body, maxVideoBytes);
      if (!upload.ok) return res.status(400).json({ error: upload.error });
      const storagePath = buildFeaturedStoragePath(upload.kind, upload.fileName, new Date(), upload.contentType);
      const { data, error } = await supabase.storage.from(upload.bucket).createSignedUploadUrl(storagePath);
      if (error || !data?.signedUrl) {
        const missingBucket = /bucket not found|does not exist/i.test(error?.message || '');
        return res.status(missingBucket ? 503 : 500).json({
          error: missingBucket
            ? `Storage bucket "${upload.bucket}" is missing. Run ${FEATURED_VIDEO_MIGRATION_FILE} in the Supabase SQL editor.`
            : (error?.message || 'Could not prepare the upload.'),
        });
      }
      return res.status(200).json({
        ok: true,
        kind: upload.kind,
        bucket: upload.bucket,
        storage_path: storagePath,
        signedUrl: data.signedUrl,
        contentType: upload.contentType,
        public_url: publicUrlFor(supabase, upload.bucket, storagePath),
      });
    }

    const backend = await resolveFeaturedVideoBackend(supabase);
    if (!backend) {
      return res.status(409).json({
        error: `Run ${FEATURED_VIDEO_MIGRATION_FILE} in the Supabase SQL editor to enable the Video of the Day.`,
        setupRequired: true,
      });
    }

    const listPayload = async () => ({
      videos: (await backend.list()).map(toAdminVideo),
      storage: backend.name,
      setupRequired: backend.name !== 'table',
      migrationFile: FEATURED_VIDEO_MIGRATION_FILE,
      limits: { videoMaxBytes: maxVideoBytes, thumbnailMaxBytes: FEATURED_THUMBNAIL_MAX_BYTES },
    });

    if (action === 'fv-list') {
      return res.status(200).json({ ok: true, ...(await listPayload()) });
    }

    const id = safeTrim(body.id || body.video?.id, 64);

    if (action === 'fv-save') {
      const input = body.video || {};
      const built = await buildSaveFields(supabase, input);
      if (!built.ok) return res.status(built.status).json({ error: built.error });

      let row;
      if (id) {
        const existing = await backend.get(id);
        if (!existing) return res.status(404).json({ error: 'That video no longer exists. Refresh and try again.' });
        row = await backend.update(id, built.fields);
        // A replaced file on the same video is no longer needed (unless another video uses it).
        const replaced = {
          id: existing.id,
          video_storage_path: existing.video_storage_path !== built.fields.video_storage_path ? existing.video_storage_path : null,
          thumbnail_storage_path: existing.thumbnail_storage_path !== built.fields.thumbnail_storage_path ? existing.thumbnail_storage_path : null,
        };
        if (replaced.video_storage_path || replaced.thumbnail_storage_path) {
          await removeStorageObjects(supabase, backend, replaced, { excludeId: existing.id });
        }
      } else {
        row = await backend.insert(built.fields);
      }

      if (body.publish === true) row = await backend.publish(row.id);
      return res.status(200).json({ ok: true, video: toAdminVideo(row), ...(await listPayload()) });
    }

    if (action === 'fv-publish') {
      if (!id) return res.status(400).json({ error: 'Missing video id.' });
      const row = await backend.publish(id);
      if (!row) return res.status(404).json({ error: 'That video no longer exists. Refresh and try again.' });
      return res.status(200).json({ ok: true, video: toAdminVideo(row), ...(await listPayload()) });
    }

    if (action === 'fv-unpublish') {
      await backend.unpublishAll();
      return res.status(200).json({ ok: true, ...(await listPayload()) });
    }

    if (action === 'fv-delete') {
      if (!id) return res.status(400).json({ error: 'Missing video id.' });
      const existing = await backend.get(id);
      if (!existing) return res.status(404).json({ error: 'That video no longer exists.' });
      await backend.remove(id);
      const removedFiles = await removeStorageObjects(supabase, backend, existing);
      return res.status(200).json({ ok: true, removedFiles, ...(await listPayload()) });
    }

    if (action === 'fv-discard-upload') {
      // Tidies an upload that was replaced before it was ever saved to a video.
      const kind = safeTrim(body.kind, 20) === 'thumbnail' ? 'thumbnail' : 'video';
      const path = safeTrim(body.storage_path, 400);
      if (!isSafeStoragePath(path, kind)) return res.status(400).json({ error: 'Storage path is invalid.' });
      const referenced = (await backend.list())
        .some((item) => item.video_storage_path === path || item.thumbnail_storage_path === path);
      if (!referenced) {
        const bucket = kind === 'video' ? FEATURED_VIDEO_BUCKET : FEATURED_THUMBNAIL_BUCKET;
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) return res.status(500).json({ error: error.message || 'Could not remove the upload.' });
      }
      return res.status(200).json({ ok: true, removed: !referenced });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    console.error('admin featured-video failed:', err?.message || err);
    if (/featured_videos_single_published|duplicate key/i.test(err?.message || '')) {
      return res.status(409).json({ error: 'Another video was published at the same time. Refresh and try again.' });
    }
    return res.status(500).json({ error: err?.message || 'Featured video request failed.' });
  }
}

export { parseYouTubeId };
