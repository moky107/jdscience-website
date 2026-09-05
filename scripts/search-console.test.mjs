import assert from "node:assert/strict";
import {
  normalisePrivateKey,
  getSearchConsoleConfig,
  fetchSearchConsoleMetrics,
  clearSearchConsoleTokenCache,
} from "../api/_lib/searchConsole.js";
import { parseDateRange } from "../api/_lib/analytics.js";
import { aggregateAnalyticsDashboard } from "../api/_lib/analyticsAggregate.js";

clearSearchConsoleTokenCache();

assert.equal(
  normalisePrivateKey("-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n").includes("\nABC\n"),
  true
);

const prevEmail = process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
const prevKey = process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
const prevSite = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

delete process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
delete process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
delete process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

assert.equal(getSearchConsoleConfig().configured, false);

const range = parseDateRange({ range: "last_30_days" });
const disconnected = await fetchSearchConsoleMetrics(range);
assert.equal(disconnected.connected, false);
assert.match(disconnected.message, /not connected/i);
assert.equal(disconnected.clicks, null);

process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL = "gsc-reader@example.iam.gserviceaccount.com";
process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n";
process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL = "https://www.jdscience.co.uk/";

assert.equal(getSearchConsoleConfig().configured, true);
assert.equal(getSearchConsoleConfig().siteUrl, "https://www.jdscience.co.uk/");
assert.equal(getSearchConsoleConfig().clientEmail, "gsc-reader@example.iam.gserviceaccount.com");

const mockRows = {
  totals: {
    rows: [{ clicks: 120, impressions: 4000, ctr: 0.03, position: 12.4 }],
  },
  previous: {
    rows: [{ clicks: 100, impressions: 3500, ctr: 0.0286, position: 13.1 }],
  },
  date: {
    rows: [
      { keys: ["2026-08-01"], clicks: 40, impressions: 1200, ctr: 0.033, position: 12.1 },
      { keys: ["2026-08-02"], clicks: 80, impressions: 2800, ctr: 0.029, position: 12.6 },
    ],
  },
  query: {
    rows: [
      { keys: ["gcse chemistry"], clicks: 50, impressions: 900, ctr: 0.055, position: 8.2 },
      { keys: ["btec applied science"], clicks: 20, impressions: 400, ctr: 0.05, position: 11.0 },
    ],
  },
  page: {
    rows: [
      { keys: ["https://www.jdscience.co.uk/"], clicks: 60, impressions: 2000, ctr: 0.03, position: 10.0 },
    ],
  },
  device: {
    rows: [
      { keys: ["MOBILE"], clicks: 70, impressions: 2500, ctr: 0.028, position: 12.0 },
      { keys: ["DESKTOP"], clicks: 50, impressions: 1500, ctr: 0.033, position: 11.0 },
    ],
  },
  country: {
    rows: [
      { keys: ["gbr"], clicks: 100, impressions: 3200, ctr: 0.031, position: 11.5 },
      { keys: ["usa"], clicks: 20, impressions: 800, ctr: 0.025, position: 14.0 },
    ],
  },
};

let call = 0;
const connected = await fetchSearchConsoleMetrics(range, {
  fetchImpl: async (body) => {
    call += 1;
    if (!body.dimensions) return call <= 2 && call === 1 ? mockRows.totals : mockRows.previous;
    if (body.dimensions[0] === "date") return mockRows.date;
    if (body.dimensions[0] === "query") return mockRows.query;
    if (body.dimensions[0] === "page") return mockRows.page;
    if (body.dimensions[0] === "device") return mockRows.device;
    if (body.dimensions[0] === "country") return mockRows.country;
    return { rows: [] };
  },
});

assert.equal(connected.connected, true);
assert.equal(connected.clicks, 120);
assert.equal(connected.impressions, 4000);
assert.equal(connected.clicks_block.change_pct, 20);
assert.equal(connected.top_queries[0].query, "gcse chemistry");
assert.equal(connected.top_landing_pages[0].page, "https://www.jdscience.co.uk/");
assert.equal(connected.by_device.length, 2);
assert.equal(connected.by_country[0].country, "gbr");
assert.equal(connected.timeseries.length, 2);
assert.ok(!JSON.stringify(connected).includes("BEGIN PRIVATE KEY"));

const dash = aggregateAnalyticsDashboard({
  events: [],
  range,
  searchConsole: connected,
  searchConsoleConnected: true,
});
assert.equal(dash.search_console.connected, true);
assert.equal(dash.search_console.clicks, 120);
assert.ok(dash.search_console.top_queries.length >= 1);

// Restore env
if (prevEmail == null) delete process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL;
else process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL = prevEmail;
if (prevKey == null) delete process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY;
else process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY = prevKey;
if (prevSite == null) delete process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
else process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL = prevSite;

console.log("search-console.test.mjs: ok");
