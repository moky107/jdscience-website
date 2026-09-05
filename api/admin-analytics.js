import { createClient } from '@supabase/supabase-js';
import { parseDateRange } from './_lib/analytics.js';
import { aggregateAnalyticsDashboard } from './_lib/analyticsAggregate.js';

/**
 * Admin analytics aggregates.
 * Auth: ADMIN_PASSWORD (same as other admin APIs).
 * Never returns raw PII from bookings/orders beyond what the admin dashboard already shows
 * for operational use — aggregates strip emails/names from conversion feeds.
 */

function safeEqual(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  if (sa.length !== sb.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i++) diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return diff === 0;
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

// Short in-memory cache so repeated dashboard refreshes are cheap
const cache = new Map();
const CACHE_TTL_MS = 45_000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({
      error: 'Admin dashboard is not configured yet. (Server missing ADMIN_PASSWORD.)',
    });
  }

  const body = parseBody(req);
  const provided = req.headers['x-admin-password'] || body.password;
  if (!provided || !safeEqual(provided, adminPassword)) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

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

    // Pull events for current + previous windows (and enough history for new/returning)
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

    // Reuse existing shop + booking tables for revenue / confirmed bookings
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
