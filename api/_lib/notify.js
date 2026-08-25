/**
 * Best-effort owner email alerts via the Resend REST API (https://resend.com).
 *
 * Sends jd943791@gmail.com a message when a booking or tutor application arrives.
 * If RESEND_API_KEY is not set, or the request fails, this logs a warning and
 * resolves normally — it NEVER throws, so bookings and applications are never
 * blocked by an email failure.
 *
 * Env:
 *   RESEND_API_KEY  (required to actually send)
 *   NOTIFY_EMAIL    (recipient; defaults to jd943791@gmail.com)
 *   NOTIFY_FROM     (sender; defaults to Resend's shared onboarding address)
 */

const OWNER_EMAIL = "jd943791@gmail.com";

const escapeHtml = (value) =>
  String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

function formatValue(value) {
  if (Array.isArray(value)) {
    const joined = value.map((item) => String(item || "").trim()).filter(Boolean).join(", ");
    return joined || "—";
  }
  const text = String(value == null ? "" : value).trim();
  return text || "—";
}

export function ownerNotificationRows(pairs) {
  return pairs
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#0f172a;border-bottom:1px solid #eef2f7;">${escapeHtml(
          label
        )}</td><td style="padding:6px 12px;color:#334155;border-bottom:1px solid #eef2f7;">${escapeHtml(
          formatValue(value)
        )}</td></tr>`
    )
    .join("");
}

export function bookingNotificationContent(booking = {}) {
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

  const paid = typeof amount === "number" && amount > 0;
  const typeLabel =
    session_type === "trial"
      ? "Free 30-min trial"
      : session_type === "package"
      ? "10-session package"
      : session_type === "single"
      ? "Single session"
      : session_type || "—";

  const when = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
  const subjectLine =
    `New booking: ${student_name || "Unknown"} — ${level || ""} ${subject || ""} (${typeLabel})`.trim();

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#004d40,#009688);color:#fff;padding:18px 20px;border-radius:12px 12px 0 0;">
      <h2 style="margin:0;font-size:18px;">New tutoring booking</h2>
      <p style="margin:4px 0 0;opacity:.9;font-size:13px;">${
        paid ? "Paid booking (payment received)" : "Free trial / enquiry"
      }</p>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eef2f7;border-top:none;border-radius:0 0 12px 12px;overflow:hidden;font-size:14px;">
      ${ownerNotificationRows([
        ["Name", student_name],
        ["Email", student_email],
        ["Phone", phone],
        ["Level", level],
        ["Subject", subject],
        ["Session type", typeLabel],
        ["Amount", paid ? `£${Number(amount).toFixed(2)}` : "Free / no charge"],
        ["Status", status],
        ["Message", message],
        ["Received", when],
      ])}
    </table>
    <p style="color:#94a3b8;font-size:12px;margin-top:12px;text-align:center;">Sent automatically from jdscience.co.uk</p>
  </div>`;

  return {
    subject: subjectLine,
    html,
    replyTo: student_email || undefined,
  };
}

export function tutorApplicationNotificationContent(application = {}) {
  const when = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
  const subjects = formatValue(application.subjects_taught);
  const subjectLine = `New tutor application: ${application.tutor_name || "Unknown"} — ${subjects}`;

  const html = `
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;">
    <div style="background:linear-gradient(135deg,#004d40,#009688);color:#fff;padding:18px 20px;border-radius:12px 12px 0 0;">
      <h2 style="margin:0;font-size:18px;">New tutor application</h2>
      <p style="margin:4px 0 0;opacity:.9;font-size:13px;">Pending review in the admin dashboard</p>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eef2f7;border-top:none;border-radius:0 0 12px 12px;overflow:hidden;font-size:14px;">
      ${ownerNotificationRows([
        ["Name", application.tutor_name],
        ["Email", application.email_address],
        ["Phone", application.telephone_number],
        ["Location", application.location],
        ["Subjects", application.subjects_taught],
        ["Other subject", application.subjects_other],
        ["Levels", application.levels_taught],
        ["Exam boards", application.exam_boards_taught],
        ["Qualification", application.highest_relevant_qualification],
        ["Experience", application.years_experience],
        ["Current role", application.current_professional_role],
        ["Teaching mode", application.teaching_mode],
        ["Availability", application.availability_summary],
        ["Rate", application.rate_display],
        ["Status", application.profile_status || "pending"],
        ["Received", when],
      ])}
    </table>
    <p style="color:#94a3b8;font-size:12px;margin-top:12px;text-align:center;">Open /?admin=1 on jdscience.co.uk to review this application.</p>
  </div>`;

  return {
    subject: subjectLine,
    html,
    replyTo: application.email_address || undefined,
  };
}

async function sendOwnerEmail({ subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL || OWNER_EMAIL;
  const from = process.env.NOTIFY_FROM || "JD Science <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping owner notification email.");
    return { sent: false, reason: "no_api_key" };
  }

  const payload = { from, to, subject, html };
  if (replyTo) payload.reply_to = replyTo;

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => "");
      console.warn("Owner notification email failed:", resp.status, detail);
      return { sent: false, reason: `http_${resp.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.warn("Owner notification email error:", err?.message || err);
    return { sent: false, reason: "exception" };
  }
}

export async function sendBookingNotification(booking = {}) {
  return sendOwnerEmail(bookingNotificationContent(booking));
}

export async function sendTutorApplicationNotification(application = {}) {
  return sendOwnerEmail(tutorApplicationNotificationContent(application));
}
