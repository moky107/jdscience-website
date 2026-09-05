import assert from "node:assert/strict";
import {
  sanitizeAnalyticsEvent,
  parseDateRange,
  classifyTrafficSource,
  pctChange,
  isAllowedEventName,
  ANALYTICS_EVENT_NAMES,
} from "../api/_lib/analytics.js";
import { aggregateAnalyticsDashboard } from "../api/_lib/analyticsAggregate.js";

assert.equal(isAllowedEventName("page_view"), true);
assert.equal(isAllowedEventName("hack_event"), false);
assert.ok(ANALYTICS_EVENT_NAMES.includes("amazon_book_click"));

const bad = sanitizeAnalyticsEvent({ event_name: "page_view" });
assert.equal(bad.ok, false);

const good = sanitizeAnalyticsEvent({
  event_name: "product_view",
  anonymous_visitor_id: "visitor-12345678",
  session_id: "session-12345678",
  page_path: "/shop/my-chemistry-companion",
  utm_source: "facebook",
  utm_campaign: "companion-launch",
  product_id: "503d4625-94df-4d80-b6d0-7c06cebdf693",
  metadata: { title: "My Chemistry Companion", password: "secret", email: "x@y.com" },
});
assert.equal(good.ok, true);
assert.equal(good.row.source, "Facebook");
assert.equal(good.row.campaign, "companion-launch");
assert.equal(good.row.metadata.password, undefined);
assert.equal(good.row.metadata.email, undefined);
assert.equal(good.row.metadata.title, "My Chemistry Companion");

const blockedName = sanitizeAnalyticsEvent({
  event_name: "page_view",
  anonymous_visitor_id: "visitor-12345678",
  session_id: "session-12345678",
  metadata: { student_message: "hello", revenue_pence: 999 },
});
assert.equal(blockedName.ok, true);
assert.equal(blockedName.row.metadata.student_message, undefined);
assert.equal(blockedName.row.metadata.revenue_pence, 999);

assert.equal(classifyTrafficSource({ referrer: "https://www.google.co.uk/search?q=gcse" }).source, "Google organic search");
assert.equal(classifyTrafficSource({}).source, "Direct");
assert.equal(classifyTrafficSource({ utmSource: "tiktok" }).source, "TikTok");

const range = parseDateRange({ range: "last_30_days" });
assert.ok(range.start);
assert.ok(range.previousStart);
assert.equal(parseDateRange({ range: "custom", start: "not-a-date", end: "also-bad" }), null);

assert.equal(pctChange(118, 100), 18);
assert.equal(pctChange(0, 0), 0);

const now = Date.now();
const events = [
  {
    event_name: "page_view",
    anonymous_visitor_id: "v1",
    session_id: "s1",
    page_path: "/",
    source: "Google organic search",
    created_at: new Date(now - 2 * 86400000).toISOString(),
    is_admin: false,
    metadata: {},
  },
  {
    event_name: "page_view",
    anonymous_visitor_id: "v2",
    session_id: "s2",
    page_path: "/shop",
    source: "Facebook",
    created_at: new Date(now - 1 * 86400000).toISOString(),
    is_admin: false,
    metadata: {},
  },
  {
    event_name: "product_view",
    anonymous_visitor_id: "v2",
    session_id: "s2",
    page_path: "/shop/my-chemistry-companion",
    product_id: "503d4625-94df-4d80-b6d0-7c06cebdf693",
    source: "Facebook",
    created_at: new Date(now - 1 * 86400000).toISOString(),
    is_admin: false,
    metadata: { title: "My Chemistry Companion", product_slug: "my-chemistry-companion" },
  },
  {
    event_name: "amazon_book_click",
    anonymous_visitor_id: "v2",
    session_id: "s2",
    page_path: "/shop/my-chemistry-companion",
    product_id: "503d4625-94df-4d80-b6d0-7c06cebdf693",
    source: "Facebook",
    device_category: "mobile",
    created_at: new Date(now - 1 * 86400000).toISOString(),
    is_admin: false,
    metadata: { is_chemistry_companion: true, product_slug: "my-chemistry-companion" },
  },
  {
    event_name: "page_view",
    anonymous_visitor_id: "admin1",
    session_id: "sa",
    page_path: "/admin/analytics",
    source: "Direct",
    created_at: new Date(now - 1 * 86400000).toISOString(),
    is_admin: true,
    metadata: {},
  },
];

const dashboard = aggregateAnalyticsDashboard({
  events,
  range,
  shopOrders: [],
  shopProducts: [{ id: "503d4625-94df-4d80-b6d0-7c06cebdf693", title: "My Chemistry Companion", product_type: "Revision Notes" }],
  bookings: [],
  searchConsoleConnected: false,
});

assert.equal(dashboard.overview.website.visitors.current, 2);
assert.equal(dashboard.overview.amazon.amazon_clicks.current, 1);
assert.equal(dashboard.search_console.connected, false);
assert.match(dashboard.search_console.message, /not connected/i);
assert.ok(dashboard.amazon.referral_paths.some((r) => r.path.includes("Facebook")));
assert.ok(dashboard.shop.funnel.length === 5);
assert.equal(dashboard.empty, false);

console.log("analytics.test.mjs: ok");
