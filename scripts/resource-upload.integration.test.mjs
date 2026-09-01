import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import {
  completeResourceUpload,
  createResourceUploadClient,
  prepareResourceUpload,
  resourceSupabaseConfig,
} from '../api/_lib/resourceUpload.js';

const config = resourceSupabaseConfig();
assert.ok(config.supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL must be configured');
assert.ok(config.serviceRoleKey, 'SUPABASE_SERVICE_ROLE_KEY must be configured');

const supabase = createResourceUploadClient();
const fields = {
  level: 'BTEC',
  subject: 'Applied Science',
  exam_board: 'Pearson',
  resource_category: 'Past Questions',
  title: 'Upload probe',
  file_name: 'upload-probe.pdf',
  contentType: 'application/pdf',
  fileSize: 16,
};

const prepared = await prepareResourceUpload(supabase, fields);
assert.equal(prepared.ok, true, prepared.error || 'prepare failed');
assert.ok(prepared.signedUrl, 'signed URL missing');
assert.match(prepared.storage_path, /^btec\/applied-science\/pearson\/past-questions\//);

const putResp = await fetch(prepared.signedUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/pdf' },
  body: Buffer.from('%PDF-1.4 upload probe'),
});
assert.equal(putResp.ok, true, `storage PUT failed: ${putResp.status}`);

const completed = await completeResourceUpload(supabase, {
  ...fields,
  storage_path: prepared.storage_path,
});
assert.equal(completed.ok, true, completed.error || 'complete failed');
assert.equal(completed.resource.level, 'BTEC');
assert.equal(completed.resource.subject, 'Applied Science');
assert.equal(completed.resource.exam_board, 'Pearson');
assert.equal(completed.resource.resource_category, 'Past Questions');
assert.equal(completed.resource.storage_path, prepared.storage_path);
assert.ok(completed.publicUrl.includes('/storage/v1/object/public/resources/'));

await supabase.from('resources').delete().eq('id', completed.resource.id);
await supabase.storage.from('resources').remove([prepared.storage_path]);

console.log('resource-upload.integration.test.mjs: ok');
