import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://xugsznxfvpbifpzpuoek.supabase.co';

/**
 * Resolve the Supabase project URL used by serverless admin/booking handlers.
 * Prefer NEXT_PUBLIC_* (Vercel), then VITE_* (local), then the known production project.
 */
export function resolveSupabaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || DEFAULT_SUPABASE_URL;
  return String(raw || '').trim().replace(/\/$/, '');
}

export function resolveServiceRoleKey() {
  return String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
}

export function getSupabaseAdminConfig() {
  const supabaseUrl = resolveSupabaseUrl();
  const serviceRoleKey = resolveServiceRoleKey();
  const missing = [];
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');

  let invalidUrl = false;
  if (supabaseUrl) {
    try {
      const parsed = new URL(supabaseUrl);
      if (!/^https?:$/i.test(parsed.protocol)) invalidUrl = true;
      if (/^(localhost|127\.0\.0\.1)$/i.test(parsed.hostname)) invalidUrl = true;
    } catch {
      invalidUrl = true;
    }
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    ok: missing.length === 0 && !invalidUrl,
    missing,
    invalidUrl,
  };
}

export function createServiceRoleClient() {
  const config = getSupabaseAdminConfig();
  if (!config.ok) {
    const err = new Error(
      config.invalidUrl
        ? 'Supabase URL is invalid or points at localhost. Set NEXT_PUBLIC_SUPABASE_URL to your https://….supabase.co project URL in Vercel.'
        : `Server not configured for database access. Missing: ${config.missing.join(', ') || 'unknown'}.`,
    );
    err.code = config.invalidUrl ? 'INVALID_SUPABASE_URL' : 'MISSING_SUPABASE_ENV';
    throw err;
  }
  return createClient(config.supabaseUrl, config.serviceRoleKey);
}

/**
 * Turn raw Supabase / fetch failures into actionable API error messages.
 * Node often surfaces "fetch failed"; browsers show "Failed to fetch".
 */
export function formatSupabaseAdminError(error, fallback = 'Database request failed.') {
  if (error?.code === 'INVALID_SUPABASE_URL' || error?.code === 'MISSING_SUPABASE_ENV') {
    return {
      status: 500,
      error: String(error.message || fallback),
      code: error.code,
    };
  }

  const message = String(error?.message || error || '').trim();
  const details = String(error?.details || error?.hint || error?.cause?.message || '').trim();
  const combined = `${message} ${details}`.trim();

  if (/invalid or points at localhost|invalid supabase url/i.test(combined)) {
    return {
      status: 500,
      error: message || 'Supabase URL is invalid. Set NEXT_PUBLIC_SUPABASE_URL in Vercel Production.',
      code: 'INVALID_SUPABASE_URL',
    };
  }

  if (/failed to fetch|fetch failed|networkerror|load failed|network request failed|econnrefused|enotfound|getaddrinfo/i.test(combined)) {
    return {
      status: 502,
      error:
        'Could not reach the Supabase database from the server. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel Production, then Redeploy.',
      code: 'SUPABASE_UNREACHABLE',
    };
  }

  if (/invalid api key|invalid jwt|jwt|service.role|401|403/i.test(combined) && /supabase|api key|jwt/i.test(combined)) {
    return {
      status: 500,
      error: 'Supabase rejected the service role credentials. Check SUPABASE_SERVICE_ROLE_KEY in Vercel Production.',
      code: 'SUPABASE_AUTH_CONFIG',
    };
  }

  if (/row-level security|permission denied|42501/i.test(combined)) {
    return {
      status: 500,
      error: 'Database permission denied while using the service role. Check Supabase RLS/policies for the bookings table.',
      code: 'SUPABASE_RLS',
    };
  }

  if (/relation .* does not exist|schema cache|PGRST205|could not find the table/i.test(combined)) {
    return {
      status: 500,
      error: message || 'Required database table is missing in Supabase.',
      code: 'SUPABASE_TABLE_MISSING',
    };
  }

  return {
    status: 500,
    error: message || fallback,
    code: 'SUPABASE_ERROR',
  };
}
