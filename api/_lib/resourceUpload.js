import { createClient } from '@supabase/supabase-js';
import { parseRequestBody, safeTrim, slugify } from './tutors.js';

export const RESOURCES_BUCKET = 'resources';
export const RESOURCE_UPLOAD_MAX_BYTES = 25 * 1024 * 1024;
export const ADMIN_RESOURCE_EMAILS = ['jd943791@gmail.com'];

const PDF_CONTENT_TYPES = new Set([
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'applications/vnd.pdf',
  'text/pdf',
]);

const ALLOWED_RESOURCE_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'txt', 'md', 'odt',
]);

export function isAllowedResourceUpload({ fileName, contentType }) {
  const ext = String(fileName || '').split('.').pop()?.toLowerCase();
  if (ext && ALLOWED_RESOURCE_EXTENSIONS.has(ext)) return true;
  if (PDF_CONTENT_TYPES.has(String(contentType || '').toLowerCase())) return true;
  return false;
}

export function resourceSupabaseConfig() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || 'https://xugsznxfvpbifpzpuoek.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || null;
  return { supabaseUrl, serviceRoleKey, projectRef };
}

export function formatResourceUploadError(error, fallback = 'Upload failed.') {
  const message = String(error?.message || error || '').trim();
  const status = error?.status || error?.statusCode || error?.cause?.status;

  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return 'Network error — check your connection and try again.';
  }
  if (/jwt expired|invalid jwt|token expired|session expired|not authenticated|invalid claim/i.test(message)) {
    return 'Your session expired. Sign in again and retry.';
  }
  if (/payload too large|entity too large|request body is too large|413/i.test(message) || status === 413) {
    return `File is too large (maximum ${Math.round(RESOURCE_UPLOAD_MAX_BYTES / (1024 * 1024))} MB).`;
  }
  if (/bucket not found|bucket does not exist/i.test(message)) {
    return 'Storage bucket unavailable. Contact support if this persists.';
  }
  if (/row-level security|permission denied|access denied|42501|403/i.test(message) || status === 403) {
    return 'You do not have permission to upload resources. Sign in with an authorised admin account.';
  }
  if (/unsupported media type|invalid file type|not a pdf/i.test(message)) {
    return message;
  }
  if (/file is too large/i.test(message)) {
    return message;
  }
  return message || fallback;
}

export function isPdfUpload({ fileName, contentType }) {
  const ext = String(fileName || '').split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return true;
  return PDF_CONTENT_TYPES.has(String(contentType || '').toLowerCase());
}

export function buildResourceStoragePath({ level, subject, board, category, fileName }) {
  const ext = resourceFileExtension(fileName);
  const base = slugify(String(fileName || '').replace(/\.[^.]+$/, '')) || 'resource';
  const clean = `${Date.now()}-${base}.${ext}`;
  return `${slugify(level)}/${slugify(subject)}/${slugify(board)}/${slugify(category)}/${clean}`;
}

function resourceFileExtension(fileName) {
  const ext = String(fileName || '').split('.').pop()?.toLowerCase();
  if (ext && /^[a-z0-9]{1,8}$/.test(ext)) return ext;
  return 'bin';
}

export function validateResourceUploadMeta(body) {
  const level = safeTrim(body.level, 40);
  const subject = safeTrim(body.subject, 80);
  const exam_board = safeTrim(body.exam_board, 40);
  const resource_category = safeTrim(body.resource_category, 40);
  const title = safeTrim(body.title, 180);
  const file_name = safeTrim(body.file_name, 180);
  const contentType = safeTrim(body.contentType, 120);
  const fileSize = Number(body.fileSize);

  if (!level || !subject || !exam_board || !resource_category) {
    return { ok: false, error: 'Level, subject, exam board and section are required.' };
  }
  if (!title) {
    return { ok: false, error: 'Title is required.' };
  }
  if (!file_name) {
    return { ok: false, error: 'File name is required.' };
  }
  if (!Number.isFinite(fileSize) || fileSize <= 0) {
    return { ok: false, error: 'File size is invalid.' };
  }
  if (fileSize > RESOURCE_UPLOAD_MAX_BYTES) {
    return {
      ok: false,
      error: `File is too large (maximum ${Math.round(RESOURCE_UPLOAD_MAX_BYTES / (1024 * 1024))} MB).`,
    };
  }
  if (!isAllowedResourceUpload({ fileName: file_name, contentType })) {
    return { ok: false, error: 'This file type is not supported. Use PDF, Word, PowerPoint, Excel or image files.' };
  }

  return {
    ok: true,
    fields: { level, subject, exam_board, resource_category, title, file_name, contentType, fileSize },
  };
}

export async function verifyAdminAccessToken(supabase, accessToken) {
  if (!accessToken) {
    return { ok: false, status: 401, error: 'Your session expired. Sign in again and retry.' };
  }
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user?.email) {
    return { ok: false, status: 401, error: 'Your session expired. Sign in again and retry.' };
  }
  if (!ADMIN_RESOURCE_EMAILS.includes(data.user.email)) {
    return { ok: false, status: 403, error: 'You do not have permission to upload resources.' };
  }
  return { ok: true, user: data.user };
}

export async function probeResourcesBucket(supabase) {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    return { exists: false, error: formatResourceUploadError(error, 'Storage bucket unavailable.') };
  }
  const exists = (data || []).some((bucket) => bucket.name === RESOURCES_BUCKET);
  if (!exists) {
    return { exists: false, error: 'Storage bucket unavailable. Contact support if this persists.' };
  }
  return { exists: true, error: null };
}

export async function prepareResourceUpload(supabase, fields) {
  const bucket = await probeResourcesBucket(supabase);
  if (!bucket.exists) {
    return { ok: false, status: 503, error: bucket.error };
  }

  const storage_path = buildResourceStoragePath({
    level: fields.level,
    subject: fields.subject,
    board: fields.exam_board,
    category: fields.resource_category,
    fileName: fields.file_name,
  });

  const { data, error } = await supabase.storage.from(RESOURCES_BUCKET).createSignedUploadUrl(storage_path);
  if (error || !data?.signedUrl) {
    return {
      ok: false,
      status: 500,
      error: formatResourceUploadError(error, 'Could not prepare upload.'),
    };
  }

  return {
    ok: true,
    storage_path,
    signedUrl: data.signedUrl,
    token: data.token,
  };
}

export async function completeResourceUpload(supabase, body) {
  const parsed = validateResourceUploadMeta(body);
  if (!parsed.ok) return { ok: false, status: 400, error: parsed.error };

  const storage_path = safeTrim(body.storage_path, 400);
  if (!storage_path) {
    return { ok: false, status: 400, error: 'Storage path is missing.' };
  }

  const bucket = await probeResourcesBucket(supabase);
  if (!bucket.exists) {
    return { ok: false, status: 503, error: bucket.error };
  }

  const publicUrl = supabase.storage.from(RESOURCES_BUCKET).getPublicUrl(storage_path).data.publicUrl;
  const { data, error } = await supabase
    .from('resources')
    .insert({
      level: parsed.fields.level,
      subject: parsed.fields.subject,
      exam_board: parsed.fields.exam_board,
      resource_category: parsed.fields.resource_category,
      title: parsed.fields.title,
      file_name: parsed.fields.file_name,
      file_url: publicUrl,
      file_type: parsed.fields.contentType || 'application/pdf',
      storage_path,
      published: true,
    })
    .select('*')
    .single();

  if (error) {
    return {
      ok: false,
      status: 500,
      error: formatResourceUploadError(error, 'Could not save resource record.'),
    };
  }

  return { ok: true, resource: data, publicUrl };
}

export async function createResourceLink(supabase, body) {
  const level = safeTrim(body.level, 40);
  const subject = safeTrim(body.subject, 80);
  const exam_board = safeTrim(body.exam_board, 40);
  const resource_category = safeTrim(body.resource_category, 40);
  const title = safeTrim(body.title, 180);
  const file_url = safeTrim(body.file_url, 2000);

  if (!level || !subject || !exam_board || !resource_category || !title || !file_url) {
    return { ok: false, status: 400, error: 'Title and link are required.' };
  }

  const { data, error } = await supabase
    .from('resources')
    .insert({
      level,
      subject,
      exam_board,
      resource_category,
      title,
      file_name: title,
      file_url,
      file_type: 'link',
      storage_path: null,
      published: true,
    })
    .select('*')
    .single();

  if (error) {
    return {
      ok: false,
      status: 500,
      error: formatResourceUploadError(error, 'Could not save resource link.'),
    };
  }

  return { ok: true, resource: data };
}

export function readBearerToken(req) {
  const header = String(req.headers?.authorization || req.headers?.Authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export function createResourceUploadClient() {
  const { supabaseUrl, serviceRoleKey } = resourceSupabaseConfig();
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey);
}

export function parseResourceUploadBody(req) {
  return parseRequestBody(req.body) || {};
}

const RESOURCE_UPLOAD_ACTIONS = new Set(['prepare', 'complete', 'link']);

export function wantsResourceUploadRequest(req, body) {
  const scope = safeTrim(req.query?.scope, 40);
  const url = String(req.url || '');
  const action = String(body?.action || '').trim().toLowerCase();
  return scope === 'resource-upload'
    || url.includes('/api/admin-resource-upload')
    || RESOURCE_UPLOAD_ACTIONS.has(action);
}

export async function handleResourceUploadRequest(req, res, body) {
  const config = resourceSupabaseConfig();
  if (!config.supabaseUrl || !config.serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for resource uploads.' });
  }

  const supabase = createResourceUploadClient();
  if (!supabase) {
    return res.status(500).json({ error: 'Server not configured for resource uploads.' });
  }

  const accessToken = readBearerToken(req);
  const auth = await verifyAdminAccessToken(supabase, accessToken);
  if (!auth.ok) {
    return res.status(auth.status).json({ error: auth.error });
  }

  const action = String(body.action || 'prepare').trim().toLowerCase();

  try {
    if (action === 'prepare') {
      const parsed = validateResourceUploadMeta(body);
      if (!parsed.ok) return res.status(400).json({ error: parsed.error });

      const prepared = await prepareResourceUpload(supabase, parsed.fields);
      if (!prepared.ok) return res.status(prepared.status).json({ error: prepared.error });

      return res.status(200).json({
        ok: true,
        signedUrl: prepared.signedUrl,
        storage_path: prepared.storage_path,
        token: prepared.token,
      });
    }

    if (action === 'complete') {
      const completed = await completeResourceUpload(supabase, body);
      if (!completed.ok) return res.status(completed.status).json({ error: completed.error });
      return res.status(200).json({
        ok: true,
        resource: completed.resource,
        publicUrl: completed.publicUrl,
      });
    }

    if (action === 'link') {
      const linked = await createResourceLink(supabase, body);
      if (!linked.ok) return res.status(linked.status).json({ error: linked.error });
      return res.status(200).json({ ok: true, resource: linked.resource });
    }

    return res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    return res.status(500).json({ error: formatResourceUploadError(err, 'Upload failed.') });
  }
}
