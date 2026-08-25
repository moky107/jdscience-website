import { createClient } from '@supabase/supabase-js';
import { sendTutorApplicationNotification } from './_lib/notify.js';
import { hasAcceptedTerms, TERMS_ACCEPTANCE_ERROR } from './_lib/requireTerms.js';
import {
  DOCUMENT_EXTENSIONS,
  DOCUMENT_MAX_BYTES,
  PROFILE_PHOTO_EXTENSIONS,
  PROFILE_PHOTO_MAX_BYTES,
  TUTOR_ALLOWED_MODES,
  TUTOR_STORAGE_BUCKET,
  isValidEmail,
  isValidPhone,
  makeTutorSlug,
  normalizeList,
  parseBoolean,
  parseRequestBody,
  pickPrimaryLabel,
  safeTrim,
  toRateFields,
  validateStoredFile,
} from './_lib/tutors.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for tutor applications.' });
  }

  const body = parseRequestBody(req.body);
  if (!body) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

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
  const company = safeTrim(body.company, 120);
  const profile_photo_path = safeTrim(body.profile_photo_path, 400);
  const cv_path = safeTrim(body.cv_path, 400);
  const qualification_evidence_path = safeTrim(body.qualification_evidence_path, 400);
  const confirm_accurate = parseBoolean(body.confirm_accurate);
  const consent_review_store = parseBoolean(body.consent_review_store);
  const consent_public_profile = parseBoolean(body.consent_public_profile);
  const accept_terms = hasAcceptedTerms(body);

  if (company) {
    return res.status(200).json({ ok: true });
  }

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
    return res.status(400).json({ error: 'Missing required tutor application fields.' });
  }

  if (subjects_taught.includes('Other') && !subjects_other) {
    return res.status(400).json({ error: 'Please specify the other subject taught.' });
  }

  if (levels_taught.includes('Other') && !levels_other) {
    return res.status(400).json({ error: 'Please specify the other level taught.' });
  }

  if (!isValidEmail(email_address)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  if (!isValidPhone(telephone_number)) {
    return res.status(400).json({ error: 'Please provide a valid telephone number.' });
  }

  if (!TUTOR_ALLOWED_MODES.has(teaching_mode)) {
    return res.status(400).json({ error: 'Invalid teaching mode. Allowed: online, face-to-face, both.' });
  }

  if (!confirm_accurate || !consent_review_store || !consent_public_profile || !accept_terms) {
    return res.status(400).json({ error: accept_terms ? 'You must complete the required consent checkboxes.' : TERMS_ACCEPTANCE_ERROR });
  }

  const rateInfo = toRateFields(rate_display);

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const profilePhoto = await validateStoredFile(supabase, profile_photo_path, {
      required: true,
      allowedExtensions: PROFILE_PHOTO_EXTENSIONS,
      maxBytes: PROFILE_PHOTO_MAX_BYTES,
      expectedFolder: 'profile-photo',
    });
    if (!profilePhoto.ok) {
      return res.status(400).json({ error: profilePhoto.error });
    }

    const cvFile = await validateStoredFile(supabase, cv_path, {
      required: false,
      allowedExtensions: DOCUMENT_EXTENSIONS,
      maxBytes: DOCUMENT_MAX_BYTES,
      expectedFolder: 'cv',
    });
    if (!cvFile.ok) {
      return res.status(400).json({ error: cvFile.error });
    }

    const qualificationEvidence = await validateStoredFile(supabase, qualification_evidence_path, {
      required: false,
      allowedExtensions: DOCUMENT_EXTENSIONS,
      maxBytes: DOCUMENT_MAX_BYTES,
      expectedFolder: 'qualification-evidence',
    });
    if (!qualificationEvidence.ok) {
      return res.status(400).json({ error: qualificationEvidence.error });
    }

    const { data, error } = await supabase
      .from('tutor_profiles')
      .insert([
        {
          tutor_name,
          public_slug: makeTutorSlug(tutor_name),
          email_address,
          telephone_number,
          subject_specialism: pickPrimaryLabel(subjects_taught),
          level_taught: pickPrimaryLabel(levels_taught, ''),
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
          qualifications: highest_relevant_qualification,
          bio: short_professional_biography,
          teaching_mode,
          location,
          availability_summary,
          rate_display: rateInfo.rateDisplay,
          hourly_rate: rateInfo.contactForQuote ? null : rateInfo.hourlyRate,
          contact_for_quote: rateInfo.contactForQuote,
          profile_photo_path: profilePhoto.path,
          cv_path: cvFile.path,
          qualification_evidence_path: qualificationEvidence.path,
          confirm_accurate,
          consent_review_store,
          consent_public_profile,
          profile_status: 'pending',
          is_published: false,
          admin_note: null,
        },
      ])
      .select('*')
      .single();

    if (error) {
      return res.status(500).json({ error: error.message || `Failed to create tutor application in ${TUTOR_STORAGE_BUCKET}` });
    }

    try {
      await sendTutorApplicationNotification({
        tutor_name,
        email_address,
        telephone_number,
        location,
        subjects_taught,
        subjects_other,
        levels_taught,
        exam_boards_taught,
        highest_relevant_qualification,
        years_experience,
        current_professional_role,
        teaching_mode,
        availability_summary,
        rate_display: rateInfo.rateDisplay,
        profile_status: data?.profile_status || "pending",
      });
    } catch (notifyErr) {
      console.warn("Tutor application notification failed (ignored):", notifyErr?.message || notifyErr);
    }

    return res.status(200).json({ ok: true, application: data });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Failed to create tutor application' });
  }
}
