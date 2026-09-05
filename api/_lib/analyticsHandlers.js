import { createClient } from '@supabase/supabase-js';
import { sanitizeAnalyticsEvent, parseDateRange } from './analytics.js';
import { aggregateAnalyticsDashboard } from './analyticsAggregate.js';

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 120;
const ipBuckets = new Map();
const cache = new Map();
const CACHE_TTL_MS = 45_000;

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
  if (ipBuckets.size > 5000) {
    for (const [key, val] of ipBuckets) {
      if (now - val.start > RATE_WINDOW_MS * 2) ipBuckets.delete(key);
    }
  }
  return bucket.count <= RATE_MAX;
}

function parseBody(req, body) {
  let parsed = body ?? req.body;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = {};
    }
  }
  return parsed || {};
}

export function wantsAnalyticsEventRequest(req) {
  const kind = String(req.query?.kind || '');
  const url = String(req.url || '');
  return kind === 'analytics-event'
    || url.includes('/api/analytics-event')
    || url.includes('kind=analytics-event');
}

export function wantsAdminAnalyticsRequest(req, body = {}) {
  const scope = String(req.query?.scope || body.scope || '');
  const url = String(req.url || '');
  return scope === 'analytics'
    || url.includes('/api/admin-analytics')
    || url.includes('scope=analytics');
}

export async function handleAnalyticsEventRequest(req, res) {
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
    console.error('analytics-event: missing Supabase env');
    return res.status(503).json({ error: 'Analytics temporarily unavailable.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.from('analytics_events').insert(rows);
    if (error) {
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

export async function handleAdminAnalyticsRequest(req, res, bodyInput) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = parseBody(req, bodyInput);
  const range = parseDateRange({
    range: body.range || body.preset,
    start: body.start,
    end: body.end,
  });
  if (!range) {
    return res.status(400).json({ error: 'Invalid date range.' });
  }

  const cacheKey = `${range.start}|${range.end}|${range.preset}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return res.status(200).json({ ok: true, cached: true, ...cached.payload });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server not configured for database access.' });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const historyStart = range.preset === 'all_time'
      ? range.start
      : new Date(Math.min(
        new Date(range.previousStart).getTime(),
        new Date(range.start).getTime() - 90 * 86400000
      )).toISOString();

    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('id,event_name,anonymous_visitor_id,session_id,page_path,referrer,source,medium,campaign,content,resource_id,product_id,tutor_id,device_category,engagement_ms,is_admin,metadata,created_at')
      .gte('created_at', historyStart)
      .lte('created_at', range.end)
      .order('created_at', { ascending: true })
      .limit(50000);

    if (eventsError) {
      if (/relation .*analytics_events.* does not exist/i.test(eventsError.message || '')) {
        return res.status(503).json({
          ok: false,
          error: 'Analytics table not created yet.',
          code: 'MIGRATION_REQUIRED',
          migration: 'supabase/migrations/20260905_analytics_events.sql',
        });
      }
      console.error('admin-analytics events error:', eventsError);
      return res.status(500).json({ error: eventsError.message || 'Failed to load analytics.' });
    }

    const [ordersRes, productsRes, bookingsRes] = await Promise.all([
      supabase
        .from('shop_orders')
        .select('id,items,total_pence,payment_status,created_at,stripe_session_id')
        .gte('created_at', range.previousStart)
        .lte('created_at', range.end)
        .limit(5000),
      supabase
        .from('shop_products')
        .select('id,slug,title,product_type,level,subject,exam_board')
        .limit(2000),
      supabase
        .from('bookings')
        .select('id,subject,level,status,created_at,session_type')
        .gte('created_at', range.previousStart)
        .lte('created_at', range.end)
        .limit(5000),
    ]);

    const searchConsoleConnected = Boolean(
      process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL &&
      process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY &&
      process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL
    );

    const dashboard = aggregateAnalyticsDashboard({
      events: events || [],
      range,
      shopOrders: ordersRes.error ? [] : (ordersRes.data || []),
      shopProducts: productsRes.error ? [] : (productsRes.data || []),
      bookings: bookingsRes.error ? [] : (bookingsRes.data || []),
      searchConsoleConnected,
    });

    const payload = { dashboard };
    cache.set(cacheKey, { at: Date.now(), payload });
    return res.status(200).json({ ok: true, cached: false, ...payload });
  } catch (err) {
    console.error('admin-analytics failed:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to load analytics.' });
  }
}
