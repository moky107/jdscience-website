import assert from "node:assert/strict";
import {
  bookingNotificationContent,
  sendBookingNotification,
  sendTutorApplicationNotification,
  tutorApplicationNotificationContent,
} from "../api/_lib/notify.js";

const booking = bookingNotificationContent({
  student_name: "Amina Khan",
  student_email: "amina@example.com",
  phone: "07123456789",
  level: "GCSE",
  subject: "Biology",
  session_type: "trial",
  status: "confirmed",
  amount: 0,
  message: "Need help with cells <script>",
});
assert.match(booking.subject, /New booking: Amina Khan/);
assert.match(booking.subject, /Biology/);
assert.equal(booking.replyTo, "amina@example.com");
assert.match(booking.html, /Free 30-min trial/);
assert.match(booking.html, /Need help with cells &lt;script&gt;/);
assert.doesNotMatch(booking.html, /<script>/);

const paid = bookingNotificationContent({
  student_name: "Alex",
  student_email: "alex@example.com",
  level: "A-Level",
  subject: "Chemistry",
  session_type: "single",
  amount: 45,
});
assert.match(paid.html, /Paid booking/);
assert.match(paid.html, /£45.00/);

const application = tutorApplicationNotificationContent({
  tutor_name: "Sam Reed",
  email_address: "sam@example.com",
  telephone_number: "07911112222",
  location: "London",
  subjects_taught: ["Biology", "Chemistry"],
  subjects_other: "",
  levels_taught: ["GCSE"],
  exam_boards_taught: "AQA",
  highest_relevant_qualification: "MSc Biology",
  years_experience: "6 years",
  current_professional_role: "Teacher",
  teaching_mode: "online",
  availability_summary: "Weekday evenings",
  rate_display: "£35/hour",
  profile_status: "pending",
});
assert.equal(application.subject, "New tutor application: Sam Reed — Biology, Chemistry");
assert.equal(application.replyTo, "sam@example.com");
assert.match(application.html, /New tutor application/);
assert.match(application.html, /Weekday evenings/);
assert.match(application.html, /admin=1/);

const previousKey = process.env.RESEND_API_KEY;
delete process.env.RESEND_API_KEY;
const skipped = await sendTutorApplicationNotification({ tutor_name: "Sam Reed" });
assert.deepEqual(skipped, { sent: false, reason: "no_api_key" });

process.env.RESEND_API_KEY = "re_test";
const originalFetch = globalThis.fetch;
let captured;
globalThis.fetch = async (url, options) => {
  captured = { url, options };
  return { ok: true, status: 200, text: async () => "" };
};
const sent = await sendBookingNotification({
  student_name: "Amina Khan",
  student_email: "amina@example.com",
  level: "GCSE",
  subject: "Biology",
  session_type: "trial",
  amount: 0,
});
assert.equal(sent.sent, true);
assert.equal(captured.url, "https://api.resend.com/emails");
const payload = JSON.parse(captured.options.body);
assert.equal(payload.to, "jd943791@gmail.com");
assert.equal(payload.reply_to, "amina@example.com");
assert.match(payload.subject, /New booking: Amina Khan/);

let attempts = 0;
globalThis.fetch = async () => {
  attempts += 1;
  if (attempts === 1) return { ok: false, status: 500, text: async () => "temporary" };
  return { ok: true, status: 200, text: async () => "" };
};
const retried = await sendTutorApplicationNotification({
  tutor_name: "Sam Reed",
  email_address: "sam@example.com",
  subjects_taught: ["Biology"],
});
assert.equal(retried.sent, true);
assert.equal(retried.attempt, 2);
assert.equal(attempts, 2);

globalThis.fetch = originalFetch;
if (previousKey == null) delete process.env.RESEND_API_KEY;
else process.env.RESEND_API_KEY = previousKey;

console.log("notify tests passed");
