/**
 * JDScience first-party analytics client.
 *
 * Privacy rules:
 * - Anonymous visitor + session IDs in localStorage/sessionStorage (not tracking cookies).
 * - No passwords, card data, messages, emails, or precise location.
 * - Admin traffic is flagged and excluded from public aggregates server-side.
 * - Failures never throw into page UX.
 * - GA4 is optional and only loads when a measurement ID is configured.
 *
 * Event schema (see docs/analytics-events.md):
 * page_view, page_engagement, resource_view, resource_download, resource_preview,
 * product_view, product_preview, add_to_cart, checkout_started, purchase_completed,
 * tutor_page_view, tutor_profile_view, tutor_enquiry_started, tutor_booking_submitted,
 * tutor_booking_confirmed, amazon_book_click, contact_form_submitted, signup_completed
 */

export const ANALYTICS_EVENTS = Object.freeze({
  PAGE_VIEW: 'page_view',
  PAGE_ENGAGEMENT: 'page_engagement',
  RESOURCE_VIEW: 'resource_view',
  RESOURCE_DOWNLOAD: 'resource_download',
  RESOURCE_PREVIEW: 'resource_preview',
  PRODUCT_VIEW: 'product_view',
  PRODUCT_PREVIEW: 'product_preview',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',
  TUTOR_PAGE_VIEW: 'tutor_page_view',
  TUTOR_PROFILE_VIEW: 'tutor_profile_view',
  TUTOR_ENQUIRY_STARTED: 'tutor_enquiry_started',
  TUTOR_BOOKING_SUBMITTED: 'tutor_booking_submitted',
  TUTOR_BOOKING_CONFIRMED: 'tutor_booking_confirmed',
  AMAZON_BOOK_CLICK: 'amazon_book_click',
  CONTACT_FORM_SUBMITTED: 'contact_form_submitted',
  SIGNUP_COMPLETED: 'signup_completed',
});

const VISITOR_KEY = 'jd_analytics_vid';
const SESSION_KEY = 'jd_analytics_sid';
const SESSION_TS_KEY = 'jd_analytics_sid_ts';
const UTM_KEY = 'jd_analytics_utm';
const SESSION_TTL_MS = 30 * 60 * 1000;

const recentEventKeys = new Map();
const DEDUPE_MS = 2500;

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `jd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

function safeGet(storage, key) {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, value);
  } catch {
    /* ignore quota / private mode */
  }
}

function getVisitorId() {
  if (typeof window === 'undefined') return randomId();
  let id = safeGet(localStorage, VISITOR_KEY);
  if (!id) {
    id = randomId();
    safeSet(localStorage, VISITOR_KEY, id);
  }
  return id;
}

function getSessionId() {
  if (typeof window === 'undefined') return randomId();
  const now = Date.now();
  let id = safeGet(sessionStorage, SESSION_KEY);
  const ts = Number(safeGet(sessionStorage, SESSION_TS_KEY) || 0);
  if (!id || !ts || now - ts > SESSION_TTL_MS) {
    id = randomId();
    safeSet(sessionStorage, SESSION_KEY, id);
  }
  safeSet(sessionStorage, SESSION_TS_KEY, String(now));
  return id;
}

function captureUtmsFromUrl() {
  if (typeof window === 'undefined') return readStoredUtms();
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
    };
    if (utm.utm_source || utm.utm_medium || utm.utm_campaign || utm.utm_content) {
      safeSet(sessionStorage, UTM_KEY, JSON.stringify(utm));
      return utm;
    }
  } catch {
    /* ignore */
  }
  return readStoredUtms();
}

function readStoredUtms() {
  try {
    const raw = safeGet(sessionStorage, UTM_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function deviceCategory() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || '';
  if (/ipad|tablet|kindle|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobi|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function isAdminContext() {
  try {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname || '';
    if (path.startsWith('/admin')) return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') return true;
    if (window.location.hash === '#admin') return true;
  } catch {
    /* ignore */
  }
  return false;
}

function dedupeKey(eventName, payload) {
  return [
    eventName,
    payload.page_path || '',
    payload.resource_id || '',
    payload.product_id || '',
    payload.tutor_id || '',
  ].join('|');
}

function shouldDedupe(eventName, payload) {
  // Only dedupe view-like events that React remounts can spam
  const viewLike = new Set([
    ANALYTICS_EVENTS.PAGE_VIEW,
    ANALYTICS_EVENTS.RESOURCE_VIEW,
    ANALYTICS_EVENTS.PRODUCT_VIEW,
    ANALYTICS_EVENTS.TUTOR_PROFILE_VIEW,
    ANALYTICS_EVENTS.TUTOR_PAGE_VIEW,
  ]);
  if (!viewLike.has(eventName)) return false;
  const key = dedupeKey(eventName, payload);
  const now = Date.now();
  const prev = recentEventKeys.get(key);
  if (prev && now - prev < DEDUPE_MS) return true;
  recentEventKeys.set(key, now);
  if (recentEventKeys.size > 200) {
    for (const [k, t] of recentEventKeys) {
      if (now - t > DEDUPE_MS * 4) recentEventKeys.delete(k);
    }
  }
  return false;
}

function getGaMeasurementId() {
  try {
    const fromVite = typeof import.meta !== 'undefined'
      ? (import.meta.env?.VITE_GA_MEASUREMENT_ID || import.meta.env?.NEXT_PUBLIC_GA_MEASUREMENT_ID)
      : '';
    const fromWindow = typeof window !== 'undefined' ? window.__JD_GA_MEASUREMENT_ID : '';
    return String(fromVite || fromWindow || '').trim();
  } catch {
    return '';
  }
}

let gaLoaded = false;

function ensureGa4() {
  const id = getGaMeasurementId();
  if (!id || typeof document === 'undefined' || gaLoaded) return id;
  // Only load GA4 when an ID is configured. Site works without it.
  // UK PECR: ensure your cookie/consent notice covers GA4 before enabling in production.
  try {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true, send_page_view: false });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.onerror = () => { /* GA unavailable — ignore */ };
    document.head.appendChild(script);
    gaLoaded = true;
  } catch {
    /* ignore */
  }
  return id;
}

function sendToGa4(eventName, params = {}) {
  try {
    const id = ensureGa4();
    if (!id || typeof window.gtag !== 'function') return;
    const gaMap = {
      page_view: 'page_view',
      resource_download: 'resource_download',
      add_to_cart: 'add_to_cart',
      checkout_started: 'begin_checkout',
      purchase_completed: 'purchase',
      tutor_booking_submitted: 'generate_lead',
      amazon_book_click: 'outbound_click',
      signup_completed: 'sign_up',
      contact_form_submitted: 'generate_lead',
    };
    const mapped = gaMap[eventName];
    if (!mapped) return;
    window.gtag('event', mapped, {
      ...params,
      send_to: id,
    });
  } catch {
    /* never break the site */
  }
}

async function postEvents(events) {
  try {
    const resp = await fetch('/api/analytics-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
    });
    return resp.ok || resp.status === 204;
  } catch {
    return false;
  }
}

/**
 * Track an analytics event. Always safe to call; never throws.
 */
export function track(eventName, details = {}) {
  try {
    if (typeof window === 'undefined') return;
    const utm = captureUtmsFromUrl();
    const pagePath = details.page_path || details.pagePath || `${window.location.pathname}${window.location.search || ''}` || '/';
    const payload = {
      event_name: eventName,
      anonymous_visitor_id: getVisitorId(),
      session_id: getSessionId(),
      page_path: String(pagePath).slice(0, 300),
      referrer: details.referrer != null ? details.referrer : (document.referrer || ''),
      utm_source: utm.utm_source || '',
      utm_medium: utm.utm_medium || '',
      utm_campaign: utm.utm_campaign || '',
      utm_content: utm.utm_content || '',
      resource_id: details.resource_id || details.resourceId || null,
      product_id: details.product_id || details.productId || null,
      tutor_id: details.tutor_id || details.tutorId || null,
      device_category: deviceCategory(),
      engagement_ms: details.engagement_ms ?? details.engagementMs ?? null,
      is_admin: details.is_admin != null ? Boolean(details.is_admin) : isAdminContext(),
      metadata: details.metadata && typeof details.metadata === 'object' ? details.metadata : {},
    };

    if (shouldDedupe(eventName, payload)) return;

    // Fire-and-forget
    void postEvents([payload]);
    sendToGa4(eventName, {
      page_path: payload.page_path,
      item_id: payload.product_id || payload.resource_id || undefined,
    });
  } catch {
    /* swallow */
  }
}

export function trackPageView(extra = {}) {
  track(ANALYTICS_EVENTS.PAGE_VIEW, extra);
}

export function trackPageEngagement(ms, extra = {}) {
  if (!ms || ms < 1000) return;
  track(ANALYTICS_EVENTS.PAGE_ENGAGEMENT, { ...extra, engagement_ms: ms });
}

/**
 * Hook page views + engagement for SPA navigations.
 * Call once from App root; pass getContext() returning { page, isAdmin }.
 */
export function startAnalyticsLifecycle(getContext = () => ({})) {
  if (typeof window === 'undefined') return () => {};

  let pageStartedAt = Date.now();
  let lastPath = '';

  const flushEngagement = () => {
    const ms = Date.now() - pageStartedAt;
    const ctx = getContext() || {};
    trackPageEngagement(ms, {
      page_path: lastPath || window.location.pathname,
      is_admin: Boolean(ctx.isAdmin),
    });
  };

  const onNavigate = () => {
    const path = `${window.location.pathname}${window.location.search || ''}`;
    if (path === lastPath) return;
    if (lastPath) flushEngagement();
    lastPath = path;
    pageStartedAt = Date.now();
    const ctx = getContext() || {};
    // Skip counting admin shell as customer traffic (still recorded with is_admin)
    trackPageView({
      page_path: path,
      is_admin: Boolean(ctx.isAdmin) || path.startsWith('/admin'),
      metadata: { page: ctx.page || null },
    });
    if (path.startsWith('/tutors') || ctx.page === 'tutors') {
      track(ANALYTICS_EVENTS.TUTOR_PAGE_VIEW, {
        page_path: path,
        is_admin: Boolean(ctx.isAdmin),
      });
    }
  };

  // Initial
  captureUtmsFromUrl();
  ensureGa4();
  onNavigate();

  const onPop = () => onNavigate();
  window.addEventListener('popstate', onPop);

  // Patch pushState/replaceState for SPA navigations
  const origPush = history.pushState;
  const origReplace = history.replaceState;
  history.pushState = function patchedPush(...args) {
    const ret = origPush.apply(this, args);
    queueMicrotask(onNavigate);
    return ret;
  };
  history.replaceState = function patchedReplace(...args) {
    const ret = origReplace.apply(this, args);
    queueMicrotask(onNavigate);
    return ret;
  };

  const onHide = () => {
    if (document.visibilityState === 'hidden') flushEngagement();
  };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', flushEngagement);

  return () => {
    window.removeEventListener('popstate', onPop);
    document.removeEventListener('visibilitychange', onHide);
    window.removeEventListener('pagehide', flushEngagement);
    history.pushState = origPush;
    history.replaceState = origReplace;
  };
}

export function isChemistryCompanionProduct(product = {}) {
  const id = String(product.id || '');
  const slug = String(product.slug || '').toLowerCase();
  const title = String(product.title || '').toLowerCase();
  if (id === '503d4625-94df-4d80-b6d0-7c06cebdf693') return true;
  if (slug.includes('chemistry-companion') || slug === 'my-chemistry-companion') return true;
  if (title.includes('chemistry companion')) return true;
  return false;
}

export function isAmazonRetailer(product = {}) {
  const retailer = String(product.retailer_name || product.retailerName || '').toLowerCase();
  const url = String(product.external_url || '').toLowerCase();
  return retailer.includes('amazon') || url.includes('amazon.');
}
