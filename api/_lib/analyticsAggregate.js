/**
 * Server-side aggregation for the admin analytics dashboard.
 * Keeps heavy work off the browser — never returns raw event dumps.
 */

import {
  buildTimeseries,
  CONVERSION_EVENTS,
  CHEMISTRY_COMPANION_PRODUCT_ID,
  pctChange,
  uniqueCount,
  isAmazonCompanionEvent,
} from './analytics.js';

const PAGE_VIEW_EVENTS = new Set(['page_view']);
const DOWNLOAD_EVENTS = new Set(['resource_download']);
const PRODUCT_VIEW_EVENTS = new Set(['product_view']);
const PURCHASE_EVENTS = new Set(['purchase_completed']);
const BOOKING_EVENTS = new Set(['tutor_booking_confirmed', 'tutor_booking_submitted']);
const AMAZON_EVENTS = new Set(['amazon_book_click']);

function filterRange(rows, startIso, endIso) {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return rows.filter((r) => {
    const t = new Date(r.created_at).getTime();
    return t >= start && t <= end;
  });
}

function excludeAdmin(rows) {
  return rows.filter((r) => !r.is_admin);
}

function byName(rows, name) {
  return rows.filter((r) => r.event_name === name);
}

function avg(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function formatDuration(ms) {
  const n = Math.round(Number(ms) || 0);
  if (n < 1000) return `${n}ms`;
  const s = Math.round(n / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

function changeBlock(current, previous, { invertBad = false } = {}) {
  const change = pctChange(current, previous);
  let direction = 'flat';
  if (change > 0.05) direction = invertBad ? 'down' : 'up';
  if (change < -0.05) direction = invertBad ? 'up' : 'down';
  // For metrics where decrease is not necessarily bad (e.g. bounce), caller sets invertBad.
  // Default: green for up, red for down.
  return {
    current,
    previous,
    change_pct: Math.round(change * 10) / 10,
    direction: change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'flat',
    positive: invertBad ? change < -0.05 : change > 0.05,
  };
}

function topN(mapOrEntries, n = 10) {
  const entries = mapOrEntries instanceof Map
    ? [...mapOrEntries.entries()]
    : Object.entries(mapOrEntries);
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, value]) => ({ key, value }));
}

function pageLabel(path) {
  const p = String(path || '/');
  if (p === '/' || p === '') return 'Homepage';
  if (p.startsWith('/papers')) return 'Resources / Past papers';
  if (p === '/shop' || p === '/shop/') return 'Shop';
  if (p.startsWith('/shop/')) return `Product: ${decodeURIComponent(p.slice(6).replace(/\/$/, ''))}`;
  if (p.startsWith('/tutors')) return 'Tutors';
  if (p.includes('book')) return 'Booking';
  if (p.includes('chemistry-companion') || p.includes('companion')) return 'Chemistry Companion';
  return p;
}

/**
 * Aggregate dashboard payload from event rows + optional shop/booking tables.
 */
export function aggregateAnalyticsDashboard({
  events = [],
  range,
  shopOrders = [],
  shopProducts = [],
  bookings = [],
  searchConsoleConnected = false,
  searchConsole = null,
} = {}) {
  const current = excludeAdmin(filterRange(events, range.start, range.end));
  const previous = excludeAdmin(filterRange(events, range.previousStart, range.previousEnd));

  const pageViews = byName(current, 'page_view');
  const prevPageViews = byName(previous, 'page_view');
  const visitors = uniqueCount(pageViews, 'anonymous_visitor_id');
  const prevVisitors = uniqueCount(prevPageViews, 'anonymous_visitor_id');
  const sessions = uniqueCount(pageViews, 'session_id');

  // New vs returning: visitors whose first-ever page_view in full dataset is in range
  const firstSeen = new Map();
  for (const row of excludeAdmin(events).filter((r) => r.event_name === 'page_view')) {
    const id = row.anonymous_visitor_id;
    if (!id) continue;
    const t = new Date(row.created_at).getTime();
    if (!firstSeen.has(id) || t < firstSeen.get(id)) firstSeen.set(id, t);
  }
  const rangeStart = new Date(range.start).getTime();
  const rangeEnd = new Date(range.end).getTime();
  let newVisitors = 0;
  let returningVisitors = 0;
  const visitorIds = new Set(pageViews.map((r) => r.anonymous_visitor_id).filter(Boolean));
  for (const id of visitorIds) {
    const first = firstSeen.get(id);
    if (first != null && first >= rangeStart && first <= rangeEnd) newVisitors += 1;
    else returningVisitors += 1;
  }

  const engagementRows = current.filter((r) => r.event_name === 'page_engagement' && r.engagement_ms != null);
  const avgEngagement = avg(engagementRows.map((r) => r.engagement_ms));

  const resourceViews = byName(current, 'resource_view');
  const resourceDownloads = byName(current, 'resource_download');
  const productViews = byName(current, 'product_view');
  const addToCart = byName(current, 'add_to_cart');
  const checkoutStarted = byName(current, 'checkout_started');
  const purchases = byName(current, 'purchase_completed');
  const tutorProfileViews = byName(current, 'tutor_profile_view');
  const tutorEnquiries = byName(current, 'tutor_enquiry_started');
  const bookingAttempts = current.filter((r) =>
    r.event_name === 'tutor_booking_submitted' || r.event_name === 'tutor_enquiry_started'
  );
  const bookingConfirmed = byName(current, 'tutor_booking_confirmed');
  const amazonClicks = current.filter(isAmazonCompanionEvent);

  // Revenue from shop orders in range (reuse existing orders — no PII beyond totals)
  const ordersInRange = shopOrders.filter((o) => {
    const t = new Date(o.created_at).getTime();
    return t >= rangeStart && t <= rangeEnd && String(o.payment_status || '').toLowerCase() === 'paid';
  });
  const revenuePence = ordersInRange.reduce((sum, o) => sum + (Number(o.total_pence) || 0), 0);
  const completedPurchases = Math.max(purchases.length, ordersInRange.length);
  const shopConversion = uniqueCount(productViews, 'anonymous_visitor_id') > 0
    ? (uniqueCount(purchases.length ? purchases : ordersInRange.map((o) => ({
        anonymous_visitor_id: o.stripe_session_id || o.id,
      })), 'anonymous_visitor_id') / uniqueCount(productViews, 'anonymous_visitor_id')) * 100
    : 0;

  // Most downloaded / viewed resources
  const downloadByResource = new Map();
  const viewByResource = new Map();
  const resourceMeta = new Map();
  for (const row of resourceDownloads) {
    const id = row.resource_id || row.metadata?.title || row.page_path;
    if (!id) continue;
    downloadByResource.set(id, (downloadByResource.get(id) || 0) + 1);
    resourceMeta.set(id, {
      title: row.metadata?.title || id,
      level: row.metadata?.level || null,
      subject: row.metadata?.subject || null,
      exam_board: row.metadata?.exam_board || null,
      resource_type: row.metadata?.resource_type || null,
    });
  }
  for (const row of resourceViews) {
    const id = row.resource_id || row.metadata?.title || row.page_path;
    if (!id) continue;
    viewByResource.set(id, (viewByResource.get(id) || 0) + 1);
    if (!resourceMeta.has(id)) {
      resourceMeta.set(id, {
        title: row.metadata?.title || id,
        level: row.metadata?.level || null,
        subject: row.metadata?.subject || null,
        exam_board: row.metadata?.exam_board || null,
        resource_type: row.metadata?.resource_type || null,
      });
    }
  }
  const mostDownloaded = topN(downloadByResource, 1)[0];
  const mostViewed = topN(viewByResource, 1)[0];

  // Traffic series metric switch handled client-side; send all series
  const series = {
    visitors: buildTimeseries(pageViews, { start: range.start, end: range.end, metric: 'visitors' }),
    page_views: buildTimeseries(pageViews, { start: range.start, end: range.end }),
    resource_downloads: buildTimeseries(resourceDownloads, { start: range.start, end: range.end }),
    product_views: buildTimeseries(productViews, { start: range.start, end: range.end }),
    purchases: buildTimeseries(purchases.length ? purchases : ordersInRange.map((o) => ({
      created_at: o.created_at,
      event_name: 'purchase_completed',
      anonymous_visitor_id: o.id,
    })), { start: range.start, end: range.end }),
    tutor_bookings: buildTimeseries(bookingConfirmed.length ? bookingConfirmed : bookings.filter((b) => {
      const t = new Date(b.created_at).getTime();
      return t >= rangeStart && t <= rangeEnd && String(b.status || '').toLowerCase() === 'confirmed';
    }).map((b) => ({
      created_at: b.created_at,
      event_name: 'tutor_booking_confirmed',
      anonymous_visitor_id: b.id,
    })), { start: range.start, end: range.end }),
    amazon_clicks: buildTimeseries(amazonClicks, { start: range.start, end: range.end }),
  };

  // Traffic sources
  const sourceMap = new Map();
  for (const row of pageViews) {
    const src = row.source || 'Direct';
    if (!sourceMap.has(src)) {
      sourceMap.set(src, {
        source: src,
        visitors: new Set(),
        sessions: new Set(),
        conversions: 0,
        utm_source: row.medium === 'campaign' || row.campaign ? row.source : null,
        utm_medium: row.medium || null,
        utm_campaign: row.campaign || null,
        utm_content: row.content || null,
      });
    }
    const bucket = sourceMap.get(src);
    if (row.anonymous_visitor_id) bucket.visitors.add(row.anonymous_visitor_id);
    if (row.session_id) bucket.sessions.add(row.session_id);
    if (row.campaign) bucket.utm_campaign = row.campaign;
    if (row.content) bucket.utm_content = row.content;
    if (row.medium) bucket.utm_medium = row.medium;
  }
  for (const row of current) {
    if (!CONVERSION_EVENTS.has(row.event_name)) continue;
    const src = row.source || 'Direct';
    if (!sourceMap.has(src)) {
      sourceMap.set(src, {
        source: src,
        visitors: new Set(),
        sessions: new Set(),
        conversions: 0,
        utm_medium: row.medium || null,
        utm_campaign: row.campaign || null,
        utm_content: row.content || null,
      });
    }
    sourceMap.get(src).conversions += 1;
  }
  const trafficSources = [...sourceMap.values()]
    .map((b) => {
      const visitorsN = b.visitors.size;
      return {
        source: b.source,
        visitors: visitorsN,
        sessions: b.sessions.size,
        conversions: b.conversions,
        conversion_rate: visitorsN ? Math.round((b.conversions / visitorsN) * 1000) / 10 : 0,
        utm_source: b.utm_source || null,
        utm_medium: b.utm_medium || null,
        utm_campaign: b.utm_campaign || null,
        utm_content: b.utm_content || null,
      };
    })
    .sort((a, b) => b.visitors - a.visitors);

  // Page performance
  const pageMap = new Map();
  for (const row of pageViews) {
    const path = row.page_path || '/';
    if (!pageMap.has(path)) {
      pageMap.set(path, {
        page: path,
        label: pageLabel(path),
        views: 0,
        visitors: new Set(),
        engagement: [],
        conversions: 0,
      });
    }
    const p = pageMap.get(path);
    p.views += 1;
    if (row.anonymous_visitor_id) p.visitors.add(row.anonymous_visitor_id);
  }
  for (const row of engagementRows) {
    const path = row.page_path || '/';
    if (!pageMap.has(path)) continue;
    pageMap.get(path).engagement.push(row.engagement_ms);
  }
  for (const row of current) {
    if (!CONVERSION_EVENTS.has(row.event_name)) continue;
    const path = row.page_path || '/';
    if (!pageMap.has(path)) continue;
    pageMap.get(path).conversions += 1;
  }
  const pages = [...pageMap.values()]
    .map((p) => ({
      page: p.page,
      label: p.label,
      views: p.views,
      unique_visitors: p.visitors.size,
      average_engagement_ms: Math.round(avg(p.engagement)),
      average_engagement: formatDuration(avg(p.engagement)),
      conversions: p.conversions,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 100);

  // Resource leaderboard
  const resourceIds = new Set([...viewByResource.keys(), ...downloadByResource.keys()]);
  const resourceLeaderboard = [...resourceIds].map((id) => {
    const views = viewByResource.get(id) || 0;
    const downloads = downloadByResource.get(id) || 0;
    const meta = resourceMeta.get(id) || {};
    return {
      resource_id: id,
      title: meta.title || id,
      level: meta.level,
      subject: meta.subject,
      exam_board: meta.exam_board,
      resource_type: meta.resource_type,
      views,
      downloads,
      conversion_rate: views ? Math.round((downloads / views) * 1000) / 10 : 0,
    };
  });

  const resourceBreakdown = (field) => {
    const map = new Map();
    for (const item of resourceLeaderboard) {
      const key = item[field] || 'Other';
      if (!map.has(key)) map.set(key, { key, views: 0, downloads: 0 });
      const b = map.get(key);
      b.views += item.views;
      b.downloads += item.downloads;
    }
    return [...map.values()]
      .map((b) => ({
        ...b,
        conversion_rate: b.views ? Math.round((b.downloads / b.views) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.views - a.views);
  };

  // Shop product analytics
  const productById = new Map(shopProducts.map((p) => [String(p.id), p]));
  const productStats = new Map();
  const ensureProduct = (id, titleHint) => {
    const key = String(id || titleHint || 'unknown');
    if (!productStats.has(key)) {
      const prod = productById.get(key);
      productStats.set(key, {
        product_id: key,
        title: prod?.title || titleHint || key,
        product_type: prod?.product_type || null,
        views: 0,
        unique_viewers: new Set(),
        previews: 0,
        add_to_cart: 0,
        checkouts: 0,
        purchases: 0,
        revenue_pence: 0,
      });
    }
    return productStats.get(key);
  };
  for (const row of productViews) {
    const s = ensureProduct(row.product_id, row.metadata?.title);
    s.views += 1;
    if (row.anonymous_visitor_id) s.unique_viewers.add(row.anonymous_visitor_id);
  }
  for (const row of byName(current, 'product_preview')) {
    ensureProduct(row.product_id, row.metadata?.title).previews += 1;
  }
  for (const row of addToCart) {
    ensureProduct(row.product_id, row.metadata?.title).add_to_cart += 1;
  }
  for (const row of checkoutStarted) {
    ensureProduct(row.product_id, row.metadata?.title).checkouts += 1;
  }
  for (const row of purchases) {
    const s = ensureProduct(row.product_id, row.metadata?.title);
    s.purchases += 1;
    s.revenue_pence += Number(row.metadata?.revenue_pence) || 0;
  }
  for (const order of ordersInRange) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      const s = ensureProduct(item.productId || item.product_id, item.title);
      s.purchases += 1;
      s.revenue_pence += (Number(item.unitPricePence) || Number(item.unit_price_pence) || 0) * (Number(item.quantity) || 1);
    }
  }
  const shopProductsStats = [...productStats.values()].map((s) => {
    const uniqueViewers = s.unique_viewers.size;
    return {
      product_id: s.product_id,
      title: s.title,
      product_type: s.product_type,
      views: s.views,
      unique_viewers: uniqueViewers,
      previews: s.previews,
      add_to_cart: s.add_to_cart,
      checkouts: s.checkouts,
      purchases: s.purchases,
      revenue_pence: s.revenue_pence,
      conversion_rate: uniqueViewers ? Math.round((s.purchases / uniqueViewers) * 1000) / 10 : 0,
    };
  });

  const shopVisitors = uniqueCount(
    pageViews.filter((r) => String(r.page_path || '').startsWith('/shop')),
    'anonymous_visitor_id'
  );
  const productViewers = uniqueCount(productViews, 'anonymous_visitor_id');
  const cartUsers = uniqueCount(addToCart, 'anonymous_visitor_id');
  const checkoutUsers = uniqueCount(checkoutStarted, 'anonymous_visitor_id');
  const purchaseUsers = Math.max(
    uniqueCount(purchases, 'anonymous_visitor_id'),
    ordersInRange.length
  );

  const funnelStage = (count, prev) => ({
    count,
    pct_of_previous: prev > 0 ? Math.round((count / prev) * 1000) / 10 : (count ? 100 : 0),
  });

  // Tutoring
  const tutorViewMap = new Map();
  const tutorBookMap = new Map();
  for (const row of tutorProfileViews) {
    const id = row.tutor_id || row.metadata?.tutor_name || 'unknown';
    tutorViewMap.set(id, (tutorViewMap.get(id) || 0) + 1);
  }
  for (const row of [...bookingConfirmed, ...byName(current, 'tutor_booking_submitted')]) {
    const id = row.tutor_id || row.metadata?.tutor_name || 'unknown';
    tutorBookMap.set(id, (tutorBookMap.get(id) || 0) + 1);
  }
  const subjectReq = new Map();
  const levelReq = new Map();
  const bookingRows = bookings.filter((b) => {
    const t = new Date(b.created_at).getTime();
    return t >= rangeStart && t <= rangeEnd;
  });
  for (const b of bookingRows) {
    if (b.subject) subjectReq.set(b.subject, (subjectReq.get(b.subject) || 0) + 1);
    if (b.level) levelReq.set(b.level, (levelReq.get(b.level) || 0) + 1);
  }

  // Amazon companion
  const amazonBySource = new Map();
  const amazonByPage = new Map();
  for (const row of amazonClicks) {
    const src = row.source || 'Direct';
    amazonBySource.set(src, (amazonBySource.get(src) || 0) + 1);
    const page = row.page_path || '/';
    amazonByPage.set(page, (amazonByPage.get(page) || 0) + 1);
  }
  const allAmazon = excludeAdmin(events).filter(isAmazonCompanionEvent);
  const now = Date.now();
  const amazonToday = allAmazon.filter((r) => new Date(r.created_at).toDateString() === new Date().toDateString()).length;
  const amazon7 = allAmazon.filter((r) => now - new Date(r.created_at).getTime() <= 7 * 86400000).length;
  const amazon30 = allAmazon.filter((r) => now - new Date(r.created_at).getTime() <= 30 * 86400000).length;

  const companionPageViews = pageViews.filter((r) =>
    String(r.page_path || '').includes('chemistry-companion') ||
    String(r.page_path || '').includes('companion') ||
    String(r.metadata?.product_slug || '').includes('chemistry-companion')
  ).length;
  const amazonCtr = companionPageViews || productViews.filter((r) =>
    r.product_id === CHEMISTRY_COMPANION_PRODUCT_ID ||
    String(r.metadata?.product_slug || '').includes('chemistry-companion')
  ).length;
  const amazonCtrBase = Math.max(amazonCtr, companionPageViews, 1);

  // Recent conversions (sanitised — no PII)
  const recentConversions = current
    .filter((r) => CONVERSION_EVENTS.has(r.event_name))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 25)
    .map((r) => ({
      event_name: r.event_name,
      created_at: r.created_at,
      page_path: r.page_path,
      source: r.source,
      device_category: r.device_category,
      resource_id: r.resource_id,
      product_id: r.product_id,
      tutor_id: r.tutor_id,
    }));

  const revenueByType = new Map();
  for (const p of shopProductsStats) {
    const type = p.product_type || 'Other';
    revenueByType.set(type, (revenueByType.get(type) || 0) + p.revenue_pence);
  }

  return {
    range,
    generated_at: new Date().toISOString(),
    overview: {
      website: {
        visitors: changeBlock(visitors, prevVisitors),
        unique_visitors: changeBlock(visitors, prevVisitors),
        new_visitors: { current: newVisitors },
        returning_visitors: { current: returningVisitors },
        page_views: changeBlock(pageViews.length, prevPageViews.length),
        sessions: { current: sessions },
        average_engagement_ms: Math.round(avgEngagement),
        average_engagement: formatDuration(avgEngagement),
      },
      resources: {
        resource_page_views: changeBlock(resourceViews.length, byName(previous, 'resource_view').length),
        resource_downloads: changeBlock(resourceDownloads.length, byName(previous, 'resource_download').length),
        most_downloaded: mostDownloaded
          ? { id: mostDownloaded.key, title: resourceMeta.get(mostDownloaded.key)?.title || mostDownloaded.key, downloads: mostDownloaded.value }
          : null,
        most_viewed: mostViewed
          ? { id: mostViewed.key, title: resourceMeta.get(mostViewed.key)?.title || mostViewed.key, views: mostViewed.value }
          : null,
      },
      shop: {
        product_views: changeBlock(productViews.length, byName(previous, 'product_view').length),
        add_to_cart: changeBlock(addToCart.length, byName(previous, 'add_to_cart').length),
        checkout_starts: changeBlock(checkoutStarted.length, byName(previous, 'checkout_started').length),
        completed_purchases: changeBlock(completedPurchases, byName(previous, 'purchase_completed').length),
        conversion_rate: Math.round(shopConversion * 10) / 10,
        revenue_pence: revenuePence,
        revenue: `£${(revenuePence / 100).toFixed(2)}`,
      },
      tutoring: {
        tutor_profile_views: changeBlock(tutorProfileViews.length, byName(previous, 'tutor_profile_view').length),
        tutor_enquiries: changeBlock(tutorEnquiries.length, byName(previous, 'tutor_enquiry_started').length),
        booking_attempts: changeBlock(bookingAttempts.length, previous.filter((r) => r.event_name === 'tutor_booking_submitted' || r.event_name === 'tutor_enquiry_started').length),
        confirmed_bookings: changeBlock(
          Math.max(bookingConfirmed.length, bookingRows.filter((b) => String(b.status || '').toLowerCase() === 'confirmed').length),
          byName(previous, 'tutor_booking_confirmed').length
        ),
      },
      amazon: {
        amazon_clicks: changeBlock(amazonClicks.length, previous.filter(isAmazonCompanionEvent).length),
        click_through_rate: Math.round((amazonClicks.length / amazonCtrBase) * 1000) / 10,
        top_origin_page: topN(amazonByPage, 1)[0]
          ? { page: topN(amazonByPage, 1)[0].key, clicks: topN(amazonByPage, 1)[0].value }
          : null,
      },
    },
    traffic_series: series,
    traffic_comparison: {
      visitors: changeBlock(visitors, prevVisitors),
      page_views: changeBlock(pageViews.length, prevPageViews.length),
      resource_downloads: changeBlock(resourceDownloads.length, byName(previous, 'resource_download').length),
      product_views: changeBlock(productViews.length, byName(previous, 'product_view').length),
      purchases: changeBlock(completedPurchases, byName(previous, 'purchase_completed').length),
      tutor_bookings: changeBlock(
        Math.max(bookingConfirmed.length, bookingRows.filter((b) => String(b.status || '').toLowerCase() === 'confirmed').length),
        byName(previous, 'tutor_booking_confirmed').length
      ),
      amazon_clicks: changeBlock(amazonClicks.length, previous.filter(isAmazonCompanionEvent).length),
    },
    traffic_sources: trafficSources,
    pages,
    resources: {
      leaderboard: resourceLeaderboard.sort((a, b) => b.downloads - a.downloads || b.views - a.views).slice(0, 50),
      by_level: resourceBreakdown('level'),
      by_subject: resourceBreakdown('subject'),
      by_exam_board: resourceBreakdown('exam_board'),
      by_type: resourceBreakdown('resource_type'),
    },
    shop: {
      products: shopProductsStats.sort((a, b) => b.revenue_pence - a.revenue_pence || b.views - a.views),
      top_selling: [...shopProductsStats].sort((a, b) => b.purchases - a.purchases).slice(0, 10),
      most_viewed: [...shopProductsStats].sort((a, b) => b.views - a.views).slice(0, 10),
      high_view_low_purchase: [...shopProductsStats]
        .filter((p) => p.views >= 3 && p.conversion_rate < 5)
        .sort((a, b) => b.views - a.views)
        .slice(0, 10),
      revenue_by_type: topN(revenueByType, 20).map(({ key, value }) => ({
        product_type: key,
        revenue_pence: value,
        revenue: `£${(value / 100).toFixed(2)}`,
      })),
      revenue_over_time: buildTimeseries(
        ordersInRange.map((o) => ({
          created_at: o.created_at,
          event_name: 'purchase_completed',
        })),
        { start: range.start, end: range.end }
      ),
      funnel: [
        { stage: 'Shop visitors', ...funnelStage(shopVisitors, shopVisitors) },
        { stage: 'Product viewers', ...funnelStage(productViewers, shopVisitors) },
        { stage: 'Add to cart', ...funnelStage(cartUsers, productViewers) },
        { stage: 'Checkout started', ...funnelStage(checkoutUsers, cartUsers) },
        { stage: 'Payment completed', ...funnelStage(purchaseUsers, checkoutUsers) },
      ],
    },
    tutoring: {
      profile_views: tutorProfileViews.length,
      enquiries: tutorEnquiries.length,
      confirmed_bookings: Math.max(
        bookingConfirmed.length,
        bookingRows.filter((b) => String(b.status || '').toLowerCase() === 'confirmed').length
      ),
      conversion_rate: tutorProfileViews.length
        ? Math.round((Math.max(bookingConfirmed.length, bookingRows.filter((b) => String(b.status || '').toLowerCase() === 'confirmed').length) / tutorProfileViews.length) * 1000) / 10
        : 0,
      most_viewed_tutors: topN(tutorViewMap, 10).map(({ key, value }) => ({ tutor: key, views: value })),
      most_booked_tutors: topN(tutorBookMap, 10).map(({ key, value }) => ({ tutor: key, bookings: value })),
      most_requested_subjects: topN(subjectReq, 10).map(({ key, value }) => ({ subject: key, count: value })),
      most_requested_levels: topN(levelReq, 10).map(({ key, value }) => ({ level: key, count: value })),
      funnel: [
        { stage: 'Tutor page visit', ...funnelStage(byName(current, 'tutor_page_view').length || uniqueCount(pageViews.filter((r) => String(r.page_path || '').startsWith('/tutors') || r.page_path === '/' /* booking on home */), 'session_id'), 1) },
        { stage: 'Tutor profile viewed', ...funnelStage(tutorProfileViews.length, Math.max(byName(current, 'tutor_page_view').length, 1)) },
        { stage: 'Booking/enquiry started', ...funnelStage(tutorEnquiries.length, Math.max(tutorProfileViews.length, 1)) },
        { stage: 'Booking submitted', ...funnelStage(byName(current, 'tutor_booking_submitted').length || bookingRows.length, Math.max(tutorEnquiries.length, 1)) },
        { stage: 'Booking confirmed', ...funnelStage(Math.max(bookingConfirmed.length, bookingRows.filter((b) => String(b.status || '').toLowerCase() === 'confirmed').length), Math.max(byName(current, 'tutor_booking_submitted').length || bookingRows.length, 1)) },
      ],
    },
    amazon: {
      clicks_today: amazonToday,
      clicks_last_7_days: amazon7,
      clicks_last_30_days: amazon30,
      clicks_all_time: allAmazon.length,
      clicks_in_range: amazonClicks.length,
      click_through_rate: Math.round((amazonClicks.length / amazonCtrBase) * 1000) / 10,
      top_origin_page: topN(amazonByPage, 5).map(({ key, value }) => ({ page: key, clicks: value })),
      referral_paths: topN(amazonBySource, 10).map(({ key, value }) => ({
        path: `${key} → JDScience → Amazon`,
        clicks: value,
      })),
      note: 'Amazon clicks measure interest only. JDScience cannot confirm whether a visitor completed a purchase on Amazon.',
    },
    search_console: searchConsole && typeof searchConsole === 'object'
      ? searchConsole
      : {
        connected: Boolean(searchConsoleConnected),
        message: searchConsoleConnected
          ? null
          : 'Google Search Console not connected',
        impressions: null,
        clicks: null,
        ctr: null,
        average_position: null,
        top_queries: [],
        top_landing_pages: [],
        by_device: [],
        by_country: [],
        timeseries: [],
        comparison: null,
      },
    recent_conversions: recentConversions,
    empty: current.length === 0 && ordersInRange.length === 0 && bookingRows.length === 0,
  };
}

// Silence unused lint for imported sets kept for documentation / future filters
void PAGE_VIEW_EVENTS;
void DOWNLOAD_EVENTS;
void PRODUCT_VIEW_EVENTS;
void PURCHASE_EVENTS;
void BOOKING_EVENTS;
void AMAZON_EVENTS;
