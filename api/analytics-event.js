import { createClient } from '@supabase/supabase-js';
import { sanitizeAnalyticsEvent } from './_lib/analytics.js';

/**
 * Public analytics ingest endpoint.
 * Validates events, rate-limits obvious abuse, inserts via service role.
 * Never returns analytics data.
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 120;
const ipBuckets = new Map();

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function rateLimit(ip) {
  const now = Date.now();
  let bucket = ipBuckets.get(ip);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    ipBuckets.set(ip, bucket);
  }
  bucket.count += 1;
  // Opportunistic cleanup
  if (ipBuckets.size > 5000) {
    for (const [key, val] of ipBuckets) {
      if (now - val.start > RATE_WINDOW_MS * 2) ipBuckets.delete(key);
    }
  }
  return bucket.count <= RATE_MAX;
}

function parseBody(req) {
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  return body || {};
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = clientIp(req);
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests.' });
  }

  const body = parseBody(req);
  // Support single event or batch (max 20)
  const events = Array.isArray(body.events) ? body.events.slice(0, 20) : [body];

  const userAgent = req.headers['user-agent'] || '';
  const rows = [];
  for (const event of events) {
    const result = sanitizeAnalyticsEvent(event, { userAgent, ipHint: ip });
    if (!result.ok) {
      return res.status(400).json({ error: result.error || 'Invalid event.' });
    }
    rows.push(result.row);
  }

  if (!rows.length) {
    return res.status(400).json({ error: 'No events provided.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    // Fail soft for the site — client should not break UX
    console.error('analytics-event: missing Supabase env');
    return res.status(503).json({ error: 'Analytics temporarily unavailable.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from('analytics_events').insert(rows);
    if (error) {
      // Missing table is a configuration issue — do not crash the site
      console.error('analytics-event insert failed:', error.message || error);
      if (/relation .*analytics_events.* does not exist/i.test(error.message || '')) {
        return res.status(503).json({
          error: 'Analytics table not created yet. Run supabase/migrations/20260905_analytics_events.sql',
          code: 'MIGRATION_REQUIRED',
        });
      }
      return res.status(500).json({ error: 'Failed to record event.' });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('analytics-event failed:', err?.message || err);
    return res.status(500).json({ error: 'Failed to record event.' });
  }
}
