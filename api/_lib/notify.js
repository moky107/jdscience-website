/**
 * Best-effort email notification helper.
 *
 * Sends the site owner an email whenever a new booking arrives, using the
 * Resend REST API (https://resend.com). This is intentionally "best effort":
 * if RESEND_API_KEY is not set, or the request fails, it logs a warning and
 * resolves normally — it NEVER throws, so a booking is never blocked by an
 * email failure.
 *
 * Env:
 *   RESEND_API_KEY  (required to actually send)
 *   NOTIFY_EMAIL    (recipient; defaults to jd943791@gmail.com)
 *   NOTIFY_FROM     (sender; defaults to Resend's shared onboarding address)
 */

const escapeHtml = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export async function sendBookingNotification(booking = {}) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL || 'jd943791@gmail.com';
  const from = process.env.NOTIFY_FROM || 'JD Science Bookings <onboarding@resend.dev>';

  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping booking notification email.');
    return { sent: false, reason: 'no_api_key' };
  }

  const {
    student_name,
    student_email,
    phone,
    level,
    subject,
    session_type,
    status,
    amount,
    message,
  } = booking;

  const paid = typeof amount === 'number' && amount > 0;
  const typeLabel =
    session_type === 'trial'
      ? 'Free 30-min trial'
      : session_type === 'package'
      ? '10-session package'
      : session_type === 'single'
      ? 'Single session'
      : session_type || '—';

  const when = new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' });

  const subjectLine =
    `New booking: ${student_name || 'Unknown'} — ${level || ''} ${subject || ''} (${typeLabel})`.trim();

  const rows = [
    ['Name', student_name],
    ['Email', student_email],
    ['Phone', phone || '—'],
    ['Level', level],
    ['Subject', subject],
    ['Session type', typeLabel],
    ['Amount', paid ? `£${Number(amount).toFixed(2)}` : 'Free / no charge'],
    ['Status', status || '—'],
    ['Message', message || '—'],
    ['Received', when],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#0f172a;border-bottom:1px solid #eef2f7;">${escapeHtml(
          label
        )}</td><td style="padding:6px 12px;color:#334155;border-bottom:1px solid #eef2f7;">${escapeHtml(
          value
        )}</td></tr>`
    )
    .join('');

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#004d40,#009688);color:#fff;padding:18px 20px;border-radius:12px 12px 0 0;">
      <h2 style="margin:0;font-size:18px;">📩 New tutoring booking</h2>
      <p style="margin:4px 0 0;opacity:.9;font-size:13px;">${
        paid ? 'Paid booking (payment received)' : 'Free trial / enquiry'
      }</p>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eef2f7;border-top:none;border-radius:0 0 12px 12px;overflow:hidden;font-size:14px;">
      ${rows}
    </table>
    <p style="color:#94a3b8;font-size:12px;margin-top:12px;text-align:center;">Sent automatically from jdscience.co.uk</p>
  </div>`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject: subjectLine, html }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      console.warn('Booking notification email failed:', resp.status, detail);
      return { sent: false, reason: `http_${resp.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.warn('Booking notification email error:', err?.message || err);
    return { sent: false, reason: 'exception' };
  }
}
