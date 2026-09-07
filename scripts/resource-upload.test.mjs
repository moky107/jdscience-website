import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ADMIN_RESOURCE_EMAILS,
  RESOURCES_BUCKET,
  RESOURCE_UPLOAD_MAX_BYTES,
  buildResourceStoragePath,
  formatResourceUploadError,
  isAllowedResourceUpload,
  validateResourceUploadMeta,
} from '../api/_lib/resourceUpload.js';

assert.equal(RESOURCES_BUCKET, 'resources');
assert.equal(RESOURCE_UPLOAD_MAX_BYTES, 25 * 1024 * 1024);
assert.deepEqual(ADMIN_RESOURCE_EMAILS, ['jd943791@gmail.com']);

assert.equal(
  formatResourceUploadError(new TypeError('Failed to fetch')),
  'Network error — check your connection and try again.',
);
assert.equal(
  formatResourceUploadError({ message: 'JWT expired' }),
  'Your session expired. Sign in again and retry.',
);
assert.equal(
  formatResourceUploadError({ message: 'new row violates row-level security policy' }),
  'You do not have permission to upload resources. Sign in with an authorised admin account.',
);
assert.match(
  formatResourceUploadError({ message: 'Payload too large' }),
  /File is too large/,
);

assert.equal(isAllowedResourceUpload({ fileName: 'unit1-biology.pdf', contentType: 'application/pdf' }), true);
assert.equal(isAllowedResourceUpload({ fileName: 'notes.docx', contentType: '' }), true);
assert.equal(isAllowedResourceUpload({ fileName: 'bad.exe', contentType: '' }), false);

const path = buildResourceStoragePath({
  level: 'BTEC',
  subject: 'Applied Science',
  board: 'Pearson',
  category: 'Past Questions',
  fileName: 'unit1-biology.pdf',
});
assert.match(path, /^btec\/applied-science\/pearson\/past-questions\/\d+-unit1-biology\.pdf$/);

const valid = validateResourceUploadMeta({
  level: 'BTEC',
  subject: 'Applied Science',
  exam_board: 'Pearson',
  resource_category: 'Past Questions',
  title: 'Unit 1 Biology',
  file_name: 'unit1-biology.pdf',
  contentType: 'application/pdf',
  fileSize: 1024,
});
assert.equal(valid.ok, true);
assert.equal(valid.fields.level, 'BTEC');

const invalidSubjectForLevel = validateResourceUploadMeta({
  level: 'T-Level',
  subject: 'Chemistry',
  exam_board: 'Pearson',
  resource_category: 'Worksheets',
  title: 'Core Chemistry',
  file_name: 'core-chemistry.pdf',
  contentType: 'application/pdf',
  fileSize: 1024,
});
assert.equal(invalidSubjectForLevel.ok, false);
assert.match(invalidSubjectForLevel.error, /not valid for/i);

const uncertainTLevelOnGcse = validateResourceUploadMeta({
  level: 'GCSE/IGCSE',
  subject: 'Chemistry',
  exam_board: 'AQA',
  resource_category: 'Worksheets',
  title: 'TLevel_Chemistry_Worksheets_A10-A15',
  file_name: 'TLevel_Chemistry_Worksheets_A10-A15.pdf',
  contentType: 'application/pdf',
  fileSize: 1024,
});
assert.equal(uncertainTLevelOnGcse.ok, false);
assert.equal(uncertainTLevelOnGcse.needsConfirmation, true);

const confirmedTLevelOnGcse = validateResourceUploadMeta({
  level: 'GCSE/IGCSE',
  subject: 'Chemistry',
  exam_board: 'AQA',
  resource_category: 'Worksheets',
  title: 'TLevel_Chemistry_Worksheets_A10-A15',
  file_name: 'TLevel_Chemistry_Worksheets_A10-A15.pdf',
  contentType: 'application/pdf',
  fileSize: 1024,
  confirm_classification: true,
});
assert.equal(confirmedTLevelOnGcse.ok, true);
assert.equal(confirmedTLevelOnGcse.fields.classification_uncertain, true);

const tooLarge = validateResourceUploadMeta({
  level: 'BTEC',
  subject: 'Applied Science',
  exam_board: 'Pearson',
  resource_category: 'Past Questions',
  title: 'Unit 1 Biology',
  file_name: 'unit1-biology.pdf',
  contentType: 'application/pdf',
  fileSize: RESOURCE_UPLOAD_MAX_BYTES + 1,
});
assert.equal(tooLarge.ok, false);
assert.match(tooLarge.error, /too large/i);

const appSource = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
assert.match(appSource, /admin-resource-upload/, 'UploadModal must call admin-resource-upload API');
assert.match(appSource, /formatResourceUploadError/, 'Upload UI must format upload errors');
assert.match(appSource, /RESOURCE_UPLOAD_MAX_BYTES/, 'Upload UI must enforce size limits');
assert.doesNotMatch(appSource, /supabase\.storage\.from\(BUCKET\)\.upload/, 'Browser must not upload directly to storage');

console.log('resource-upload.test.mjs: ok');
