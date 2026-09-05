/**
 * Shared analytics helpers for event validation and dashboard aggregation.
 * Privacy: never store passwords, card details, messages, or raw PII.
 */

export const ANALYTICS_EVENT_NAMES = Object.freeze([
  'page_view',
  'page_engagement',
  'resource_view',
  'resource_download',
  'resource_preview',
  'product_view',
  'product_preview',
  'add_to_cart',
  'checkout_started',
  'purchase_completed',
  'tutor_page_view',
  'tutor_profile_view',
  'tutor_enquiry_started',
  'tutor_booking_submitted',
  'tutor_booking_confirmed',
  'amazon_book_click',
  'contact_form_submitted',
  'signup_completed',
]);

const EVENT_SET = new Set(ANALYTICS_EVENT_NAMES);

const MAX_STRING = 500;
const MAX_ID = 120;
const MAX_METADATA_KEYS = 12;
const MAX_METADATA_VALUE = 200;

export function isAllowedEventName(name) {
  return EVENT_SET.has(String(name || ''));
}

function clip(value, max = MAX_STRING) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, max);
}

function clipId(value) {
  return clip(value, MAX_ID);
}

function sanitizeMetadata(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  const keys = Object.keys(raw).slice(0, MAX_METADATA_KEYS);
  for (const key of keys) {
    const safeKey = String(key).slice(0, 40);
    if (!/^[a-zA-Z0-9_]+$/.test(safeKey)) continue;
    // Block sensitive-looking keys
    if (/pass|card|cvv|iban|ssn|message|email|phone|name|address|dob/i.test(safeKey)) continue;
    const val = raw[key];
    if (val == null) continue;
    if (typeof val === 'number' && Number.isFinite(val)) {
      out[safeKey] = val;
    } else if (typeof val === 'boolean') {
      out[safeKey] = val;
    } else if (typeof val === 'string') {
      out[safeKey] = val.slice(0, MAX_METADATA_VALUE);
    }
  }
  return out;
}

export function classifyTrafficSource({ referrer, utmSource, utmMedium, pagePath } = {}) {
  const source = String(utmSource || '').trim().toLowerCase();
  const medium = String(utmMedium || '').trim().toLowerCase();
  if (source) {
    if (source.includes('facebook') || source === 'fb') return { source: 'Facebook', medium: medium || 'social' };
    if (source.includes('instagram') || source === 'ig') return { source: 'Instagram', medium: medium || 'social' };
    if (source.includes('tiktok')) return { source: 'TikTok', medium: medium || 'social' };
    if (source.includes('youtube') || source === 'yt') return { source: 'YouTube', medium: medium || 'social' };
    if (source.includes('whatsapp') || source === 'wa') return { source: 'WhatsApp', medium: medium || 'social' };
    if (medium === 'email' || source === 'email' || source === 'newsletter') {
      return { source: 'Email', medium: medium || 'email' };
    }
    if (medium === 'organic' || source === 'google') {
      return { source: 'Google organic search', medium: medium || 'organic' };
    }
    return { source: clip(utmSource, 80) || 'Other', medium: medium || 'campaign' };
  }

  let host = '';
  try {
    if (referrer) host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    host = '';
  }

  if (!host) return { source: 'Direct', medium: 'none' };
  if (host.includes('google.') || host === 'google.com') return { source: 'Google organic search', medium: 'organic' };
  if (host.includes('facebook.') || host === 'fb.com' || host === 'm.facebook.com') return { source: 'Facebook', medium: 'social' };
  if (host.includes('instagram.')) return { source: 'Instagram', medium: 'social' };
  if (host.includes('tiktok.')) return { source: 'TikTok', medium: 'social' };
  if (host.includes('youtube.') || host === 'youtu.be') return { source: 'YouTube', medium: 'social' };
  if (host.includes('whatsapp.') || host === 'wa.me') return { source: 'WhatsApp', medium: 'social' };
  if (host.includes('jdscience.')) return { source: 'Direct', medium: 'none' };
  return { source: `Referral (${host})`, medium: 'referral' };
}

export function detectDeviceCategory(userAgent = '') {
  const ua = String(userAgent || '').toLowerCase();
  if (!ua) return 'unknown';
  if (/ipad|tablet|kindle|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Validate and normalise a client-submitted analytics event.
 * Returns { ok: true, row } or { ok: false, error }.
 */
export function sanitizeAnalyticsEvent(body = {}, { userAgent = '', ipHint = '' } = {}) {
  const eventName = String(body.event_name || body.eventName || '').trim();
  if (!isAllowedEventName(eventName)) {
    return { ok: false, error: 'Unsupported event_name.' };
  }

  const anonymousVisitorId = clipId(body.anonymous_visitor_id || body.anonymousVisitorId);
  const sessionId = clipId(body.session_id || body.sessionId);
  if (!anonymousVisitorId || !sessionId) {
    return { ok: false, error: 'anonymous_visitor_id and session_id are required.' };
  }

  // Soft bot / abuse filters
  if (anonymousVisitorId.length < 8 || sessionId.length < 8) {
    return { ok: false, error: 'Invalid identifiers.' };
  }

  const pagePath = clip(body.page_path || body.pagePath || '/', 300) || '/';
  const referrer = clip(body.referrer, 500);
  const utmSource = clip(body.utm_source || body.source || body.campaign_source, 120);
  const utmMedium = clip(body.utm_medium || body.medium, 120);
  const utmCampaign = clip(body.utm_campaign || body.campaign, 120);
  const utmContent = clip(body.utm_content || body.content, 120);

  const classified = classifyTrafficSource({
    referrer,
    utmSource,
    utmMedium,
    pagePath,
  });

  let engagementMs = body.engagement_ms ?? body.engagementMs;
  if (engagementMs != null) {
    engagementMs = Number(engagementMs);
    if (!Number.isFinite(engagementMs) || engagementMs < 0) engagementMs = null;
    else engagementMs = Math.min(Math.round(engagementMs), 3_600_000);
  } else {
    engagementMs = null;
  }

  const device =
    clip(body.device_category || body.deviceCategory, 40) ||
    detectDeviceCategory(userAgent);

  const metadata = sanitizeMetadata(body.metadata);
  if (ipHint) {
    // Store only a coarse hash hint length marker — never the raw IP.
    metadata.has_ip_hint = true;
  }

  const isAdmin = Boolean(body.is_admin || body.isAdmin);

  return {
    ok: true,
    row: {
      event_name: eventName,
      anonymous_visitor_id: anonymousVisitorId,
      session_id: sessionId,
      page_path: pagePath,
      referrer,
      source: classified.source,
      medium: classified.medium || utmMedium,
      campaign: utmCampaign,
      content: utmContent,
      resource_id: clipId(body.resource_id || body.resourceId),
      product_id: clipId(body.product_id || body.productId),
      tutor_id: clipId(body.tutor_id || body.tutorId),
      device_category: device,
      engagement_ms: engagementMs,
      is_admin: isAdmin,
      metadata,
    },
  };
}

export function parseDateRange(query = {}) {
  const preset = String(query.range || query.preset || 'last_30_days').toLowerCase();
  const now = new Date();
  const end = query.end ? new Date(query.end) : now;
  let start;

  const startOfDay = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  };
  const endOfDay = (d) => {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
  };

  switch (preset) {
    case 'today':
      start = startOfDay(now);
      break;
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      start = startOfDay(y);
      end.setTime(endOfDay(y).getTime());
      break;
    }
    case 'last_7_days':
      start = startOfDay(new Date(now.getTime() - 6 * 86400000));
      break;
    case 'last_90_days':
      start = startOfDay(new Date(now.getTime() - 89 * 86400000));
      break;
    case 'this_year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'all_time':
      start = new Date('2020-01-01T00:00:00.000Z');
      break;
    case 'custom':
      start = query.start ? new Date(query.start) : startOfDay(new Date(now.getTime() - 29 * 86400000));
      break;
    case 'last_30_days':
    default:
      start = startOfDay(new Date(now.getTime() - 29 * 86400000));
      break;
  }

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return null;
  }

  const durationMs = Math.max(end.getTime() - start.getTime(), 86400000);
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  return {
    preset,
    start: start.toISOString(),
    end: end.toISOString(),
    previousStart: prevStart.toISOString(),
    previousEnd: prevEnd.toISOString(),
  };
}

export function pctChange(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p === 0) return c === 0 ? 0 : 100;
  return ((c - p) / p) * 100;
}

export function uniqueCount(rows, key) {
  const set = new Set();
  for (const row of rows) {
    const v = row?.[key];
    if (v) set.add(String(v));
  }
  return set.size;
}

export function groupCount(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

export function dayKey(iso) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

export function buildTimeseries(rows, { start, end, eventNames = null, metric = 'events' } = {}) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = [];
  for (let t = startOfUtcDay(startDate).getTime(); t <= endDate.getTime(); t += 86400000) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  const counts = Object.fromEntries(days.map((d) => [d, 0]));
  const seen = new Map(); // day -> Set for unique visitors

  for (const row of rows) {
    if (eventNames && !eventNames.includes(row.event_name)) continue;
    const d = dayKey(row.created_at);
    if (!d || counts[d] == null) continue;
    if (metric === 'visitors') {
      if (!seen.has(d)) seen.set(d, new Set());
      const set = seen.get(d);
      const id = row.anonymous_visitor_id || row.session_id;
      if (id && !set.has(id)) {
        set.add(id);
        counts[d] += 1;
      }
    } else {
      counts[d] += 1;
    }
  }

  return days.map((date) => ({ date, value: counts[date] || 0 }));
}

function startOfUtcDay(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Conversion events used in traffic-source conversion rates. */
export const CONVERSION_EVENTS = new Set([
  'resource_download',
  'purchase_completed',
  'tutor_booking_submitted',
  'tutor_booking_confirmed',
  'amazon_book_click',
  'contact_form_submitted',
  'signup_completed',
]);

export const CHEMISTRY_COMPANION_PRODUCT_ID = '503d4625-94df-4d80-b6d0-7c06cebdf693';
export const CHEMISTRY_COMPANION_SLUG = 'my-chemistry-companion';

/**
 * Best-effort server-side analytics insert. Never throws to callers.
 */
export async function recordServerAnalyticsEvent(supabase, event = {}) {
  try {
    if (!supabase || !event?.event_name) return false;
    const row = {
      event_name: String(event.event_name),
      anonymous_visitor_id: event.anonymous_visitor_id || `server_${Date.now()}`,
      session_id: event.session_id || `server_session_${Date.now()}`,
      page_path: event.page_path || null,
      referrer: event.referrer || null,
      source: event.source || 'Direct',
      medium: event.medium || 'server',
      campaign: event.campaign || null,
      content: event.content || null,
      resource_id: event.resource_id || null,
      product_id: event.product_id || null,
      tutor_id: event.tutor_id || null,
      device_category: event.device_category || 'server',
      engagement_ms: event.engagement_ms ?? null,
      is_admin: Boolean(event.is_admin),
      metadata: event.metadata && typeof event.metadata === 'object' ? event.metadata : {},
    };
    const { error } = await supabase.from('analytics_events').insert([row]);
    if (error) {
      console.warn('recordServerAnalyticsEvent:', error.message || error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('recordServerAnalyticsEvent failed:', err?.message || err);
    return false;
  }
}

export function isAmazonCompanionEvent(row) {
  if (row.event_name !== 'amazon_book_click') return false;
  const meta = row.metadata || {};
  const slug = String(meta.product_slug || meta.slug || '').toLowerCase();
  if (slug.includes('chemistry-companion') || slug === CHEMISTRY_COMPANION_SLUG) return true;
  if (row.product_id === CHEMISTRY_COMPANION_PRODUCT_ID) return true;
  if (meta.is_chemistry_companion === true) return true;
  // Fallback: any amazon_book_click counts toward companion section when labelled
  return true;
}
