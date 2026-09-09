import assert from 'node:assert/strict';
import {
  formatSupabaseAdminError,
  getSupabaseAdminConfig,
  resolveSupabaseUrl,
  DEFAULT_SUPABASE_URL,
} from '../api/_lib/supabaseAdmin.js';
import { safeEqual } from '../api/_lib/adminAuth.js';

assert.equal(safeEqual('abc', 'abc'), true);
assert.equal(safeEqual('abc', 'abd'), false);
assert.equal(safeEqual('abc', 'abcd'), false);

const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const previousVite = process.env.VITE_SUPABASE_URL;
const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.VITE_SUPABASE_URL;
assert.equal(resolveSupabaseUrl(), DEFAULT_SUPABASE_URL);

process.env.VITE_SUPABASE_URL = 'https://example.supabase.co/';
assert.equal(resolveSupabaseUrl(), 'https://example.supabase.co');

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://primary.supabase.co';
assert.equal(resolveSupabaseUrl(), 'https://primary.supabase.co');

process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
const localConfig = getSupabaseAdminConfig();
assert.equal(localConfig.ok, false);
assert.equal(localConfig.invalidUrl, true);

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xugsznxfvpbifpzpuoek.supabase.co';
const okConfig = getSupabaseAdminConfig();
assert.equal(okConfig.ok, true);

const unreachable = formatSupabaseAdminError(new TypeError('fetch failed'));
assert.equal(unreachable.status, 502);
assert.match(unreachable.error, /Could not reach the Supabase database/i);
assert.equal(unreachable.code, 'SUPABASE_UNREACHABLE');

const browserFetch = formatSupabaseAdminError({ message: 'Failed to fetch' });
assert.equal(browserFetch.status, 502);
assert.equal(browserFetch.code, 'SUPABASE_UNREACHABLE');

if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
if (previousVite === undefined) delete process.env.VITE_SUPABASE_URL;
else process.env.VITE_SUPABASE_URL = previousVite;
if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;

console.log('admin-bookings helpers ok');
