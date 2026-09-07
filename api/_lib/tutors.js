export const TUTOR_STORAGE_BUCKET = 'tutor-applications';

export const TUTOR_ALLOWED_MODES = new Set(['online', 'face-to-face', 'both']);
export const TUTOR_ALLOWED_STATUSES = new Set(['pending', 'approved', 'rejected', 'suspended']);

export const PROFILE_PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
export const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp']);

export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_MAX_BYTES = 8 * 1024 * 1024;

/** Private-document signed URL TTL (1 hour). */
export const TUTOR_PRIVATE_SIGNED_TTL_SECONDS = 3600;
/**
 * Fallback signed URL TTL for profile photos when the stable /api/tutor-photo
 * route is unavailable (e.g. unpublished admin previews).
 */
export const PROFILE_PHOTO_SIGNED_TTL_SECONDS = 60 * 60 * 24 * 7;
export const TUTOR_PHOTO_API_PATH = '/api/tutor-photo';
export const LOCAL_AVATAR_FALLBACK = '/avatar-fallback.svg';

export const PUBLIC_TUTOR_SELECT = [
  'id',
  'public_slug',
  'tutor_name',
  'profile_photo_path',
  'subjects_taught',
  'levels_taught',
  'exam_boards_taught',
  'highest_relevant_qualification',
  'teaching_qualifications',
  'professional_memberships',
  'years_experience',
  'current_professional_role',
  'short_professional_biography',
  'tutoring_approach',
  'teaching_mode',
  'availability_summary',
  'rate_display',
  'location',
  'qualifications',
  'subject_specialism',
  'level_taught',
  'bio',
  'contact_for_quote',
  'hourly_rate',
  'profile_status',
  'is_published',
  'created_at',
].join(', ');

export function parseRequestBody(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
  return body || {};
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 64);
}

export function makeTutorSlug(name) {
  const base = slugify(name) || 'tutor';
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

export function safeTrim(value, max = 5000) {
  return String(value || '').trim().slice(0, max);
}

export function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
  if (typeof value === 'number') return value === 1;
  return false;
}

export function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => safeTrim(item, 120)).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => safeTrim(item, 120))
      .filter(Boolean);
  }
  return [];
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function isValidPhone(value) {
  const raw = String(value || '').trim();
  const digits = raw.replace(/\D/g, '');
  return /^[+()\d\s-]{7,24}$/.test(raw) && digits.length >= 7 && digits.length <= 15;
}

export function pickPrimaryLabel(list, fallback = 'Multi-subject') {
  return Array.isArray(list) && list.length > 0 ? list.join(', ') : fallback;
}

export function toRateFields(rateDisplay) {
  const normalized = safeTrim(rateDisplay, 120);
  const firstCurrencyMatch = normalized.match(/\d+(?:\.\d{1,2})?/);
  const numericValue = firstCurrencyMatch ? Number(firstCurrencyMatch[0]) : null;
  return {
    rateDisplay: normalized,
    contactForQuote: !normalized || /quote|contact/i.test(normalized),
    hourlyRate: numericValue != null && !Number.isNaN(numericValue) ? numericValue : null,
  };
}

export function normalizeTutorProfileFields(body) {
  const tutor_name = safeTrim(body.tutor_name, 120);
  const email_address = safeTrim(body.email_address, 160).toLowerCase();
  const telephone_number = safeTrim(body.telephone_number, 40);
  const location = safeTrim(body.location, 120);
  const subjects_taught = normalizeList(body.subjects_taught);
  const subjects_other = safeTrim(body.subjects_other, 120);
  const levels_taught = normalizeList(body.levels_taught);
  const levels_other = safeTrim(body.levels_other, 120);
  const exam_boards_taught = safeTrim(body.exam_boards_taught, 240);
  const highest_relevant_qualification = safeTrim(body.highest_relevant_qualification, 240);
  const teaching_qualifications = safeTrim(body.teaching_qualifications, 240);
  const professional_memberships = safeTrim(body.professional_memberships, 240);
  const years_experience = safeTrim(body.years_experience, 80);
  const current_professional_role = safeTrim(body.current_professional_role, 240);
  const short_professional_biography = safeTrim(body.short_professional_biography, 2500);
  const tutoring_approach = safeTrim(body.tutoring_approach, 2500);
  const teaching_mode = safeTrim(body.teaching_mode, 40).toLowerCase();
  const availability_summary = safeTrim(body.availability_summary, 240);
  const rate_display = safeTrim(body.rate_display, 120);
  const admin_note = body.admin_note === undefined ? undefined : (safeTrim(body.admin_note, 2000) || null);

  if (
    !tutor_name ||
    !email_address ||
    !telephone_number ||
    !location ||
    subjects_taught.length === 0 ||
    levels_taught.length === 0 ||
    !exam_boards_taught ||
    !highest_relevant_qualification ||
    !years_experience ||
    !current_professional_role ||
    !short_professional_biography ||
    !tutoring_approach ||
    !teaching_mode ||
    !availability_summary ||
    !rate_display
  ) {
    return { ok: false, error: 'Missing required tutor profile fields.' };
  }

  if (subjects_taught.includes('Other') && !subjects_other) {
    return { ok: false, error: 'Please specify the other subject taught.' };
  }

  if (levels_taught.includes('Other') && !levels_other) {
    return { ok: false, error: 'Please specify the other level taught.' };
  }

  if (!isValidEmail(email_address)) {
    return { ok: false, error: 'Please provide a valid email address.' };
  }

  if (!isValidPhone(telephone_number)) {
    return { ok: false, error: 'Please provide a valid telephone number.' };
  }

  if (!TUTOR_ALLOWED_MODES.has(teaching_mode)) {
    return { ok: false, error: 'Invalid teaching mode. Allowed: online, face-to-face, both.' };
  }

  const rateInfo = toRateFields(rate_display);
  const fields = {
    tutor_name,
    email_address,
    telephone_number,
    location,
    subjects_taught,
    subjects_other,
    levels_taught,
    levels_other,
    exam_boards_taught,
    highest_relevant_qualification,
    teaching_qualifications,
    professional_memberships,
    years_experience,
    current_professional_role,
    short_professional_biography,
    tutoring_approach,
    teaching_mode,
    availability_summary,
    rate_display: rateInfo.rateDisplay,
    hourly_rate: rateInfo.contactForQuote ? null : rateInfo.hourlyRate,
    contact_for_quote: rateInfo.contactForQuote,
    subject_specialism: pickPrimaryLabel(subjects_taught),
    level_taught: pickPrimaryLabel(levels_taught, ''),
    qualifications: highest_relevant_qualification,
    bio: short_professional_biography,
  };

  if (admin_note !== undefined) {
    fields.admin_note = admin_note;
  }

  return { ok: true, fields };
}

function getFileExtension(path) {
  const parts = String(path || '').toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() : '';
}

/**
 * Normalise legacy and newly uploaded tutor storage paths so signing / public
 * proxy URLs resolve to the same object.
 */
export function normalizeTutorStoragePath(path) {
  if (path == null) return null;
  let value = String(path).trim();
  if (!value) return null;

  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep raw value when decoding fails */
  }

  value = value.split('#')[0].split('?')[0].trim();
  if (!value) return null;

  value = value.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/(?:public|sign|authenticated)\//i, '');
  value = value.replace(/^\/+/, '');

  const bucketPrefix = `${TUTOR_STORAGE_BUCKET}/`;
  while (value.toLowerCase().startsWith(bucketPrefix)) {
    value = value.slice(bucketPrefix.length);
  }

  value = value.replace(/^(?:applications\/)+/i, 'applications/');
  value = value.replace(/\/{2,}/g, '/');

  if (!value || value.includes('..')) return null;
  return value;
}

export function mimeTypeForTutorPath(path) {
  const extension = getFileExtension(path);
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

export function isPublishedTutorRow(row) {
  if (!row) return false;
  const status = String(row.profile_status || '').trim().toLowerCase();
  if (status !== 'approved') return false;
  if (row.is_published !== true) return false;
  return Boolean(String(row.public_slug || '').trim());
}

/** Stable same-origin URL for published tutor profile photos (no expiring token). */
export function buildTutorPhotoApiUrl(slug, storagePath) {
  const safeSlug = safeTrim(slug, 120);
  const normalized = normalizeTutorStoragePath(storagePath);
  if (!safeSlug || !normalized) return null;
  const version = encodeURIComponent(normalized.split('/').pop() || '1');
  return `${TUTOR_PHOTO_API_PATH}?slug=${encodeURIComponent(safeSlug)}&v=${version}`;
}

function normalizeStorageMetadata(file) {
  const metadata = file?.metadata || {};
  return {
    bytes:
      Number(metadata.size) ||
      Number(metadata.fileSize) ||
      Number(metadata.file_size) ||
      Number(metadata.length) ||
      0,
    mimeType: String(metadata.mimetype || metadata.contentType || metadata.content_type || ''),
  };
}

export async function validateStoredFile(supabase, path, { required, allowedExtensions, maxBytes, expectedFolder }) {
  const normalizedPath = normalizeTutorStoragePath(path);
  if (!normalizedPath) {
    return required
      ? { ok: false, error: 'A required uploaded file is missing.' }
      : { ok: true, path: null };
  }

  if (!normalizedPath.startsWith(`applications/${expectedFolder}/`)) {
    return { ok: false, error: 'Uploaded file path is invalid.' };
  }

  const extension = getFileExtension(normalizedPath);
  if (!allowedExtensions.has(extension)) {
    return { ok: false, error: 'Uploaded file type is not allowed.' };
  }

  const segments = normalizedPath.split('/');
  const fileName = segments.pop();
  const folder = segments.join('/');

  const { data, error } = await supabase.storage.from(TUTOR_STORAGE_BUCKET).list(folder, {
    limit: 100,
    search: fileName,
  });

  if (error) {
    return { ok: false, error: error.message || 'Failed to validate uploaded file.' };
  }

  const match = (data || []).find((item) => item.name === fileName);
  if (!match) {
    return { ok: false, error: 'Uploaded file could not be found.' };
  }

  const meta = normalizeStorageMetadata(match);
  if (meta.bytes > maxBytes) {
    return { ok: false, error: 'Uploaded file exceeds the allowed size.' };
  }

  return { ok: true, path: normalizedPath, size: meta.bytes, mimeType: meta.mimeType };
}

export async function signTutorAsset(supabase, path, expiresIn = TUTOR_PRIVATE_SIGNED_TTL_SECONDS) {
  const normalized = normalizeTutorStoragePath(path);
  if (!normalized) return null;
  const { data, error } = await supabase.storage
    .from(TUTOR_STORAGE_BUCKET)
    .createSignedUrl(normalized, expiresIn);
  if (error) return null;
  return data?.signedUrl || null;
}

export async function attachTutorAssetUrls(supabase, row, includePrivate = false) {
  if (!row) return row;
  const next = { ...row };
  const photoPath = normalizeTutorStoragePath(row.profile_photo_path);
  next.profile_photo_path = photoPath;

  if (isPublishedTutorRow(row) && photoPath) {
    next.profile_photo_url = buildTutorPhotoApiUrl(row.public_slug, photoPath);
  } else {
    next.profile_photo_url = await signTutorAsset(
      supabase,
      photoPath,
      PROFILE_PHOTO_SIGNED_TTL_SECONDS,
    );
  }

  if (includePrivate) {
    next.cv_path = normalizeTutorStoragePath(row.cv_path);
    next.qualification_evidence_path = normalizeTutorStoragePath(row.qualification_evidence_path);
    next.cv_url = await signTutorAsset(supabase, next.cv_path, TUTOR_PRIVATE_SIGNED_TTL_SECONDS);
    next.qualification_evidence_url = await signTutorAsset(
      supabase,
      next.qualification_evidence_path,
      TUTOR_PRIVATE_SIGNED_TTL_SECONDS,
    );
  }
  return next;
}

export async function attachTutorAssetUrlsToMany(supabase, rows, includePrivate = false) {
  return Promise.all((rows || []).map((row) => attachTutorAssetUrls(supabase, row, includePrivate)));
}

export function toPublicTutor(row) {
  if (!row) return row;
  return {
    id: row.id,
    public_slug: row.public_slug,
    tutor_name: row.tutor_name,
    profile_photo_url: row.profile_photo_url || null,
    subjects_taught: row.subjects_taught || [],
    levels_taught: row.levels_taught || [],
    exam_boards_taught: row.exam_boards_taught || '',
    highest_relevant_qualification: row.highest_relevant_qualification || '',
    teaching_qualifications: row.teaching_qualifications || '',
    professional_memberships: row.professional_memberships || '',
    years_experience: row.years_experience || '',
    current_professional_role: row.current_professional_role || '',
    short_professional_biography: row.short_professional_biography || row.bio || '',
    tutoring_approach: row.tutoring_approach || '',
    teaching_mode: row.teaching_mode || '',
    availability_summary: row.availability_summary || '',
    rate_display: row.rate_display || '',
    location: row.location || '',
    qualifications: row.qualifications || row.highest_relevant_qualification || '',
    subject_specialism: row.subject_specialism || pickPrimaryLabel(row.subjects_taught),
    level_taught: row.level_taught || pickPrimaryLabel(row.levels_taught, ''),
    bio: row.bio || row.short_professional_biography || '',
    contact_for_quote: Boolean(row.contact_for_quote),
    hourly_rate: row.hourly_rate ?? null,
    approved_badge_label: 'Listed tutor',
  };
}