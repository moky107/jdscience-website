export const TUTOR_STORAGE_BUCKET = 'tutor-applications';

export const TUTOR_ALLOWED_MODES = new Set(['online', 'face-to-face', 'both']);
export const TUTOR_ALLOWED_STATUSES = new Set(['pending', 'approved', 'rejected', 'suspended']);

export const PROFILE_PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
export const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp']);

export const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_MAX_BYTES = 8 * 1024 * 1024;

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

/**
 * Bot honeypot fields. Avoid common autofill tokens like "company" — browsers often
 * fill those for real applicants, which previously caused silent false-success drops.
 */
export const TUTOR_HONEYPOT_FIELDS = ['jd_bot_check', 'website_url_confirm'];

export function isTutorApplicationSpam(body = {}) {
  return TUTOR_HONEYPOT_FIELDS.some((field) => Boolean(safeTrim(body?.[field], 120)));
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
  const normalizedPath = safeTrim(path, 400);
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

export async function signTutorAsset(supabase, path, expiresIn = 3600) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(TUTOR_STORAGE_BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl || null;
}

export async function attachTutorAssetUrls(supabase, row, includePrivate = false) {
  if (!row) return row;
  const next = { ...row };
  next.profile_photo_url = await signTutorAsset(supabase, row.profile_photo_path);
  if (includePrivate) {
    next.cv_url = await signTutorAsset(supabase, row.cv_path);
    next.qualification_evidence_url = await signTutorAsset(supabase, row.qualification_evidence_path);
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