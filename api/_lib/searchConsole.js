/**
 * Server-side Google Search Console client.
 * Credentials stay in process.env — never sent to the browser.
 *
 * Env (Vercel, non-VITE_*):
 *   GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL
 *   GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY
 *   GOOGLE_SEARCH_CONSOLE_SITE_URL  — exact GSC property id
 *     URL-prefix example: https://www.jdscience.co.uk/
 *     Domain example:     sc-domain:jdscience.co.uk
 */

import crypto from 'node:crypto';
import { pctChange } from './analytics.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const API_BASE = 'https://www.googleapis.com/webmasters/v3';

/** GSC typically retains ~16 months; clamp "all time" starts. */
const MAX_LOOKBACK_DAYS = 480;
/** Search Analytics data usually lags ~2–3 days. */
const DATA_LAG_DAYS = 2;

let cachedToken = null;

export function getSearchConsoleConfig() {
  const clientEmail = String(process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL || '').trim();
  const privateKeyRaw = String(process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY || '').trim();
  const siteUrl = String(process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || '').trim();
  const configured = Boolean(clientEmail && privateKeyRaw && siteUrl);
  return {
    configured,
    clientEmail: configured ? clientEmail : null,
    siteUrl: configured ? siteUrl : null,
    privateKey: configured ? normalisePrivateKey(privateKeyRaw) : null,
  };
}

export function normalisePrivateKey(raw) {
  let key = String(raw || '').trim();
  // Vercel / .env often stores literal \n sequences
  if (key.includes('\\n')) key = key.replace(/\\n/g, '\n');
  // Strip wrapping quotes if pasted that way
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
    if (key.includes('\\n')) key = key.replace(/\\n/g, '\n');
  }
  return key;
}

function b64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function toDateOnly(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function clampGscWindow(startIso, endIso) {
  const lagEnd = new Date();
  lagEnd.setUTCDate(lagEnd.getUTCDate() - DATA_LAG_DAYS);
  lagEnd.setUTCHours(23, 59, 59, 999);

  let end = new Date(endIso);
  let start = new Date(startIso);
  if (Number.isNaN(end.getTime())) end = new Date(lagEnd);
  if (Number.isNaN(start.getTime())) start = new Date(end.getTime() - 29 * 86400000);

  if (end > lagEnd) end = new Date(lagEnd);

  const earliest = new Date(lagEnd);
  earliest.setUTCDate(earliest.getUTCDate() - MAX_LOOKBACK_DAYS);
  if (start < earliest) start = earliest;
  if (start > end) start = new Date(end.getTime() - 86400000);

  return {
    startDate: toDateOnly(start),
    endDate: toDateOnly(end),
  };
}

function changeBlock(current, previous) {
  const change = pctChange(current, previous);
  return {
    current,
    previous,
    change_pct: Math.round(change * 10) / 10,
    direction: change > 0.05 ? 'up' : change < -0.05 ? 'down' : 'flat',
  };
}

async function getAccessToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.email === clientEmail && cachedToken.exp > now + 60) {
    return cachedToken.accessToken;
  }

  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), privateKey);
  const jwt = `${unsigned}.${b64url(signature)}`;

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data.access_token) {
    const msg = data.error_description || data.error || `token_http_${resp.status}`;
    throw new Error(`Search Console auth failed: ${msg}`);
  }

  cachedToken = {
    email: clientEmail,
    accessToken: data.access_token,
    exp: now + Number(data.expires_in || 3600),
  };
  return data.access_token;
}

async function searchAnalyticsQuery(accessToken, siteUrl, body) {
  const url = `${API_BASE}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = data.error?.message || data.error_description || data.error || `http_${resp.status}`;
    throw new Error(`Search Console query failed: ${msg}`);
  }
  return data;
}

function summariseRows(rows = []) {
  let clicks = 0;
  let impressions = 0;
  let positionWeighted = 0;
  for (const row of rows) {
    const c = Number(row.clicks) || 0;
    const i = Number(row.impressions) || 0;
    clicks += c;
    impressions += i;
    positionWeighted += (Number(row.position) || 0) * i;
  }
  const ctr = impressions > 0 ? clicks / impressions : 0;
  const average_position = impressions > 0 ? positionWeighted / impressions : 0;
  return {
    clicks,
    impressions,
    ctr: Math.round(ctr * 10000) / 10000,
    ctr_pct: Math.round(ctr * 1000) / 10,
    average_position: Math.round(average_position * 10) / 10,
  };
}

function mapDimensionRows(rows = [], keyName) {
  return (rows || [])
    .map((row) => {
      const keys = row.keys || [];
      const clicks = Number(row.clicks) || 0;
      const impressions = Number(row.impressions) || 0;
      const ctr = Number(row.ctr) || (impressions > 0 ? clicks / impressions : 0);
      const position = Number(row.position) || 0;
      return {
        [keyName]: keys[0] || '(unknown)',
        clicks,
        impressions,
        ctr: Math.round(ctr * 10000) / 10000,
        ctr_pct: Math.round(ctr * 1000) / 10,
        position: Math.round(position * 10) / 10,
      };
    })
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
}

/**
 * Fetch Search Console performance for the dashboard date range.
 * Returns a search_console payload fragment (never includes credentials).
 */
export async function fetchSearchConsoleMetrics(range, { fetchImpl } = {}) {
  const config = getSearchConsoleConfig();
  if (!config.configured) {
    return {
      connected: false,
      message: 'Google Search Console not connected',
      site_url: null,
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
    };
  }

  const runQuery = fetchImpl || (async (body) => {
    const token = await getAccessToken(config.clientEmail, config.privateKey);
    return searchAnalyticsQuery(token, config.siteUrl, body);
  });

  const currentWin = clampGscWindow(range.start, range.end);
  const previousWin = clampGscWindow(range.previousStart, range.previousEnd);

  try {
    const [
      currentTotals,
      previousTotals,
      byDate,
      byQuery,
      byPage,
      byDevice,
      byCountry,
    ] = await Promise.all([
      runQuery({
        startDate: currentWin.startDate,
        endDate: currentWin.endDate,
        rowLimit: 1,
      }),
      runQuery({
        startDate: previousWin.startDate,
        endDate: previousWin.endDate,
        rowLimit: 1,
      }),
      runQuery({
        startDate: currentWin.startDate,
        endDate: currentWin.endDate,
        dimensions: ['date'],
        rowLimit: 500,
      }),
      runQuery({
        startDate: currentWin.startDate,
        endDate: currentWin.endDate,
        dimensions: ['query'],
        rowLimit: 25,
      }),
      runQuery({
        startDate: currentWin.startDate,
        endDate: currentWin.endDate,
        dimensions: ['page'],
        rowLimit: 25,
      }),
      runQuery({
        startDate: currentWin.startDate,
        endDate: currentWin.endDate,
        dimensions: ['device'],
        rowLimit: 10,
      }),
      runQuery({
        startDate: currentWin.startDate,
        endDate: currentWin.endDate,
        dimensions: ['country'],
        rowLimit: 15,
      }),
    ]);

    let current = summariseRows(currentTotals.rows || []);
    // Totals query returns one aggregate row when data exists; fall back to date rows.
    if (!(currentTotals.rows || []).length) {
      current = summariseRows(byDate.rows || []);
    }
    const previous = summariseRows(previousTotals.rows || []);

    const timeseries = (byDate.rows || [])
      .map((row) => {
        const date = (row.keys && row.keys[0]) || null;
        return {
          date,
          clicks: Number(row.clicks) || 0,
          impressions: Number(row.impressions) || 0,
          ctr: Number(row.ctr) || 0,
          position: Math.round((Number(row.position) || 0) * 10) / 10,
        };
      })
      .filter((r) => r.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      connected: true,
      message: null,
      site_url: config.siteUrl,
      client_email: config.clientEmail,
      date_range: currentWin,
      previous_date_range: previousWin,
      impressions: current.impressions,
      clicks: current.clicks,
      ctr: current.ctr,
      ctr_pct: current.ctr_pct,
      average_position: current.average_position,
      clicks_block: changeBlock(current.clicks, previous.clicks),
      impressions_block: changeBlock(current.impressions, previous.impressions),
      ctr_block: changeBlock(current.ctr_pct, previous.ctr_pct),
      position_block: changeBlock(current.average_position, previous.average_position),
      top_queries: mapDimensionRows(byQuery.rows, 'query'),
      top_landing_pages: mapDimensionRows(byPage.rows, 'page'),
      by_device: mapDimensionRows(byDevice.rows, 'device'),
      by_country: mapDimensionRows(byCountry.rows, 'country'),
      timeseries,
      comparison: {
        current,
        previous,
      },
      note: 'Figures come from the Google Search Console Search Analytics API for the selected range (data typically lags ~2 days).',
    };
  } catch (err) {
    const message = err?.message || String(err);
    console.error('search-console fetch failed:', message);
    return {
      connected: false,
      configured: true,
      error: true,
      message,
      site_url: config.siteUrl,
      client_email: config.clientEmail,
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
    };
  }
}

/** Clear cached OAuth token (tests). */
export function clearSearchConsoleTokenCache() {
  cachedToken = null;
}
