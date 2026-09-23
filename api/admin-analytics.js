import { handleAdminAnalyticsRequest } from './_lib/analyticsHandlers.js';
import { parseRequestBody } from './_lib/tutors.js';

/**
 * Dedicated admin analytics endpoint.
 * Authenticated with ADMIN_PASSWORD (JSON body.password or x-admin-password).
 * Prefer this over the /api/admin-education-posts?scope=analytics rewrite so the
 * dashboard cannot fall through to the education-posts list handler.
 */

function safeEqual(a, b) {
  const sa = String(a || '');
  const sb = String(b || '');
  if (sa.length !== sb.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i++) diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  return diff === 0;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin dashboard is not configured yet.' });
  }

  const body = parseRequestBody(req.body) || {};
  const provided = req.headers['x-admin-password'] || body.password;
  if (!provided || !safeEqual(provided, adminPassword)) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  // Force analytics scope even if the client omits it.
  body.scope = 'analytics';
  return handleAdminAnalyticsRequest(req, res, body);
}
