/**
 * Password recovery via generateLink + Resend.
 *
 * Supabase's built-in Auth SMTP is limited (~2 emails/hour) and not reliable for
 * production. This path generates a recovery link with the service role (no email
 * send through GoTrue) and delivers it with the project's existing Resend key.
 *
 * Never logs action_link / tokens. Does not change passwords. Always returns a
 * generic success payload to the client (anti-enumeration) except for clear
 * server misconfiguration / rate limits / hard delivery failures.
 */

import { createClient } from '@supabase/supabase-js';
import { PRODUCTION_SITE_ORIGIN } from '../../src/authRedirect.js';

const RECOVERY_REDIRECT = `${PRODUCTION_SITE_ORIGIN}/?recovery=1`;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_MAX_PER_EMAIL = 3;
const RATE_MAX_PER_IP = 10;
const RESEND_POLL_TIMEOUT_MS = 12_000;
const RESEND_POLL_INTERVAL_MS = 1_500;
const TERMINAL_EVENTS = new Set([
  'delivered',
  'opened',
  'clicked',
  'bounced',
  'complained',
  'failed',
  'delivery_delayed',
  'suppressed',
]);
const FAILURE_EVENTS = new Set(['bounced', 'complained', 'failed', 'suppressed']);
const emailBuckets = new Map();
const ipBuckets = new Map();

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

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function takeToken(bucketMap, key, max) {
  const now = Date.now();
  let bucket = bucketMap.get(key);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    bucket = { start: now, count: 0 };
    bucketMap.set(key, bucket);
  }
  bucket.count += 1;
  return bucket.count <= max;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 160;
}

function extractFromHost(from) {
  const match = String(from || '').match(/@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * GoTrue may ignore redirectTo when Site URL / allow-list are misconfigured
 * (commonly falling back to http://localhost:3000). Rewrite the query param on
 * the generated action_link so the emailed URL targets production recovery.
 */
export function forceRecoveryRedirect(actionLink, redirectTo = RECOVERY_REDIRECT) {
  try {
    const url = new URL(actionLink);
    const before = url.searchParams.get('redirect_to');
    url.searchParams.set('redirect_to', redirectTo);
    return {
      actionLink: url.toString(),
      redirectRewritten: before !== redirectTo,
      originalRedirect: before,
      redirectTo,
    };
  } catch {
    return {
      actionLink,
      redirectRewritten: false,
      originalRedirect: null,
      redirectTo,
    };
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll Resend for last_event. Sending-only API keys may refuse GET (401/403);
 * in that case we still treat the earlier POST accept as provisional success.
 */
export async function pollResendDelivery(apiKey, emailId, {
  timeoutMs = RESEND_POLL_TIMEOUT_MS,
  intervalMs = RESEND_POLL_INTERVAL_MS,
} = {}) {
  if (!apiKey || !emailId) {
    return { lastEvent: null, retrieveStatus: null, reason: 'missing_id' };
  }
  const deadline = Date.now() + timeoutMs;
  let lastEvent = null;
  let retrieveStatus = null;
  let from = null;

  while (Date.now() <= deadline) {
    try {
      const resp = await fetch(`https://api.resend.com/emails/${emailId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      retrieveStatus = resp.status;
      if (resp.status === 401 || resp.status === 403) {
        return {
          lastEvent: null,
          retrieveStatus,
          reason: 'retrieve_forbidden',
          from,
        };
      }
      if (!resp.ok) {
        const detail = await resp.text().catch(() => '');
        console.warn('password-recovery Resend retrieve failed:', resp.status, detail.slice(0, 160));
        await sleep(intervalMs);
        continue;
      }
      const data = await resp.json().catch(() => ({}));
      lastEvent = data?.last_event || null;
      from = data?.from || from;
      if (lastEvent && TERMINAL_EVENTS.has(lastEvent)) {
        return { lastEvent, retrieveStatus, from };
      }
    } catch (err) {
      console.warn('password-recovery Resend retrieve error:', err?.message || err);
    }
    await sleep(intervalMs);
  }

  return { lastEvent: lastEvent || 'sent', retrieveStatus, from, reason: 'poll_timeout' };
}

function classifyResendError(status, detail) {
  const text = String(detail || '').toLowerCase();
  if (status === 401) return 'invalid_api_key';
  if (status === 403 && text.includes('only send testing emails')) return 'testing_recipient_restricted';
  if (status === 403 && text.includes('not verified')) return 'unverified_domain';
  if (status === 403 && text.includes('domain')) return 'domain_mismatch';
  if (status === 422 && text.includes('from')) return 'invalid_from';
  if (status === 429) return 'resend_rate_limited';
  return `http_${status}`;
}

export async function sendResendEmail({ to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_FROM || process.env.RESEND_FROM || 'JD Science <onboarding@resend.dev>';
  const fromHost = extractFromHost(from);
  if (!apiKey) {
    return { sent: false, reason: 'no_api_key', fromHost };
  }
  try {
    const payload = {
      from,
      to: [to],
      subject,
      html,
      tags: [{ name: 'category', value: 'password-recovery' }],
    };
    if (replyTo) payload.reply_to = replyTo;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const raw = await resp.text().catch(() => '');
    let parsed = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      parsed = {};
    }

    if (!resp.ok) {
      const reason = classifyResendError(resp.status, raw);
      console.warn(
        'password-recovery Resend failed:',
        resp.status,
        reason,
        `fromHost=${fromHost}`,
        raw.slice(0, 220),
      );
      return {
        sent: false,
        reason,
        httpStatus: resp.status,
        fromHost,
        errorName: parsed?.name || null,
      };
    }

    const resendId = parsed?.id || null;
    console.info(
      'password-recovery Resend accepted:',
      `id=${resendId || 'unknown'}`,
      `fromHost=${fromHost}`,
      `http=${resp.status}`,
    );

    const delivery = await pollResendDelivery(apiKey, resendId);
    if (delivery.lastEvent && FAILURE_EVENTS.has(delivery.lastEvent)) {
      console.warn(
        'password-recovery Resend delivery failed:',
        `id=${resendId}`,
        `lastEvent=${delivery.lastEvent}`,
        `fromHost=${fromHost}`,
      );
      return {
        sent: false,
        reason: `delivery_${delivery.lastEvent}`,
        httpStatus: resp.status,
        resendId,
        lastEvent: delivery.lastEvent,
        fromHost,
      };
    }

    console.info(
      'password-recovery Resend status:',
      `id=${resendId || 'unknown'}`,
      `lastEvent=${delivery.lastEvent || 'accepted'}`,
      `retrieve=${delivery.retrieveStatus ?? 'n/a'}`,
      `fromHost=${fromHost}`,
    );

    return {
      sent: true,
      httpStatus: resp.status,
      resendId,
      lastEvent: delivery.lastEvent || 'accepted',
      fromHost,
      retrieveStatus: delivery.retrieveStatus,
      retrieveReason: delivery.reason || null,
    };
  } catch (err) {
    console.warn('password-recovery Resend error:', err?.message || err);
    return { sent: false, reason: 'exception', fromHost };
  }
}

function recoveryEmailHtml(actionLink) {
  const safeLink = String(actionLink || '').replace(/"/g, '&quot;');
  return `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
    <div style="background:linear-gradient(135deg,#004d40,#009688);color:#fff;padding:18px 20px;border-radius:12px 12px 0 0;">
      <h2 style="margin:0;font-size:18px;">Reset your JD Science password</h2>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:20px;background:#fff;">
      <p style="margin:0 0 14px;line-height:1.6;color:#334155;">
        We received a request to reset the password for your JD Science account.
        Click the button below to choose a new password. This link expires soon.
      </p>
      <p style="margin:0 0 18px;text-align:center;">
        <a href="${safeLink}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#009688;color:#fff;text-decoration:none;font-weight:800;">
          Choose a new password
        </a>
      </p>
      <p style="margin:0;font-size:13px;line-height:1.55;color:#64748b;">
        If you did not request this, you can ignore this email. Your password will stay the same.
      </p>
    </div>
  </div>`;
}

/**
 * Create a recovery link without sending via GoTrue's built-in mailer.
 * Returns { ok, actionLink } or { ok:false, reason } — never throws with tokens.
 */
export async function createRecoveryLink(supabase, email) {
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: RECOVERY_REDIRECT },
  });
  if (error) {
    return {
      ok: false,
      reason: error.message || 'generate_link_failed',
      status: error.status || null,
      code: error.code || null,
    };
  }
  const rawLink = data?.properties?.action_link || data?.action_link || null;
  if (!rawLink) {
    return { ok: false, reason: 'missing_action_link' };
  }
  const forced = forceRecoveryRedirect(rawLink, RECOVERY_REDIRECT);
  if (forced.redirectRewritten) {
    console.warn(
      'password-recovery redirect rewritten:',
      `from=${forced.originalRedirect}`,
      `to=${forced.redirectTo}`,
    );
  }
  return {
    ok: true,
    actionLink: forced.actionLink,
    redirectTo: forced.redirectTo,
    redirectRewritten: forced.redirectRewritten,
    originalRedirect: forced.originalRedirect,
  };
}

export function wantsPasswordRecoveryRequest(req) {
  const kind = String(req.query?.kind || '');
  const url = String(req.url || '');
  return kind === 'password-recovery'
    || url.includes('/api/password-recovery')
    || url.includes('kind=password-recovery');
}

export async function handlePasswordRecoveryRequest(req, res) {
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

  const body = parseBody(req);
  const email = normalizeEmail(body.email);
  const ip = clientIp(req);
  // Opt-in diagnostics for operators (never includes tokens / API keys).
  const wantDiag = body.diagnostics === true || body.diagnostics === '1';

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (!takeToken(emailBuckets, email, RATE_MAX_PER_EMAIL) || !takeToken(ipBuckets, ip, RATE_MAX_PER_IP)) {
    return res.status(429).json({
      error: 'Too many password reset requests. Please wait about an hour and try again.',
      code: 'rate_limited',
    });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({
      error: 'Password reset email is not configured on the server (missing RESEND_API_KEY). Configure Resend or custom SMTP, then try again.',
      code: 'email_not_configured',
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(503).json({ error: 'Server is not configured for password recovery.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const link = await createRecoveryLink(supabase, email);
  if (!link.ok) {
    // Anti-enumeration: unknown users look the same as success to the client.
    // Log only a safe reason code.
    console.warn('password-recovery generateLink:', link.code || link.reason || 'failed');
    const payload = {
      ok: true,
      message: 'If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.',
    };
    if (wantDiag) {
      payload.diagnostics = {
        generateLink: 'failed',
        reason: link.code || link.reason || 'failed',
        resendConfigured: true,
        serviceRoleConfigured: true,
      };
    }
    return res.status(200).json(payload);
  }

  const mailed = await sendResendEmail({
    to: email,
    subject: 'Reset your JD Science password',
    html: recoveryEmailHtml(link.actionLink),
    replyTo: 'info@jdscience.co.uk',
  });

  if (!mailed.sent) {
    console.warn('password-recovery send failed:', mailed.reason, mailed.fromHost || '');
    return res.status(503).json({
      error: 'Could not send the password reset email. Please try again shortly, or contact info@jdscience.co.uk.',
      code: mailed.reason || 'send_failed',
      ...(wantDiag
        ? {
            diagnostics: {
              generateLink: 'ok',
              redirectRewritten: !!link.redirectRewritten,
              originalRedirectHost: safeHost(link.originalRedirect),
              resendHttpStatus: mailed.httpStatus || null,
              resendId: mailed.resendId || null,
              lastEvent: mailed.lastEvent || null,
              fromHost: mailed.fromHost || null,
              reason: mailed.reason || 'send_failed',
            },
          }
        : {}),
    });
  }

  return res.status(200).json({
    ok: true,
    message: 'If an account exists for that email, a password reset link has been sent. Check your inbox and spam folder.',
    delivery: 'resend',
    ...(wantDiag
      ? {
          diagnostics: {
            generateLink: 'ok',
            redirectRewritten: !!link.redirectRewritten,
            originalRedirectHost: safeHost(link.originalRedirect),
            redirectHost: safeHost(link.redirectTo),
            resendHttpStatus: mailed.httpStatus || 200,
            resendId: mailed.resendId || null,
            lastEvent: mailed.lastEvent || null,
            fromHost: mailed.fromHost || null,
            retrieveStatus: mailed.retrieveStatus ?? null,
            serviceRoleConfigured: true,
            resendConfigured: true,
          },
        }
      : {}),
  });
}

function safeHost(value) {
  if (!value) return null;
  try {
    return new URL(value).host || null;
  } catch {
    return String(value).slice(0, 80);
  }
}
