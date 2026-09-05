# JDScience Analytics Event Schema

First-party analytics for the admin dashboard at `/admin/analytics`.

## Privacy

- Anonymous visitor ID and session ID only (localStorage / sessionStorage).
- No passwords, payment card details, emails, phone numbers, messages, or precise location.
- Admin activity is flagged with `is_admin=true` and excluded from public aggregates.
- Tracking failures never block page navigation, downloads, checkout, bookings, or forms.
- GA4 loads only when `VITE_GA_MEASUREMENT_ID` or `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set.

## Transport

`POST /api/analytics-event`

Body: single event object, or `{ "events": [ ... ] }` (max 20).

Inserts use the Supabase service role. Direct table SELECT/UPDATE/DELETE is denied by RLS.

## Common fields

| Field | Type | Notes |
| --- | --- | --- |
| `event_name` | string | Required. One of the names below. |
| `anonymous_visitor_id` | string | Required. UUID-like. |
| `session_id` | string | Required. UUID-like. ~30 min TTL. |
| `page_path` | string | Path + query, max 300 chars. |
| `referrer` | string | Document referrer. |
| `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` | string | Captured from URL and retained for the session. |
| `resource_id` / `product_id` / `tutor_id` | string | Optional entity IDs. |
| `device_category` | string | `mobile` / `tablet` / `desktop`. |
| `engagement_ms` | number | Used by `page_engagement`. |
| `is_admin` | boolean | Admin shell / authorised admin browsing. |
| `metadata` | object | Non-sensitive extras (title, level, subject, revenue_pence, …). |

## Events

| Event | When |
| --- | --- |
| `page_view` | SPA route change / first load |
| `page_engagement` | Time spent on a page (visibility / navigation) |
| `resource_view` | Resource row opened |
| `resource_download` | Resource PDF / file opened |
| `resource_preview` | Video / preview style open |
| `product_view` | Shop product detail |
| `product_preview` | Product has a preview asset |
| `add_to_cart` | Add to basket |
| `checkout_started` | Checkout form / Stripe redirect start |
| `purchase_completed` | Shop success return + Stripe webhook |
| `tutor_page_view` | Tutors listing / tutoring surfaces |
| `tutor_profile_view` | Tutor profile modal |
| `tutor_enquiry_started` | Paid booking flow started |
| `tutor_booking_submitted` | Trial booked / tutoring checkout success |
| `tutor_booking_confirmed` | Stripe webhook or admin confirms booking |
| `amazon_book_click` | Amazon / Chemistry Companion outbound click |
| `contact_form_submitted` | Contact form success |
| `signup_completed` | Visitor account registration |

## Database

Run once in Supabase SQL editor:

`supabase/migrations/20260905_analytics_events.sql`
