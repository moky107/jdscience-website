# JDScience Analytics Event Schema

First-party analytics for the admin dashboard at `/admin/analytics`, with an optional Google Analytics 4 bridge for same-day / real-time traffic.

## Privacy

- Anonymous visitor ID and session ID only (localStorage / sessionStorage).
- No passwords, payment card details, emails, phone numbers, messages, or precise location.
- Admin activity is flagged with `is_admin=true` and excluded from public aggregates.
- Tracking failures never block page navigation, downloads, checkout, bookings, or forms.
- GA4 loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` (or `VITE_GA_MEASUREMENT_ID`) is set **and** the visitor accepts analytics cookies.
- Localhost / private-network hosts never load GA4.
- Admin paths never send events to GA4 (first-party ingest still records them with `is_admin`).

## Google Analytics 4

1. Create a GA4 property + Web data stream for `https://www.jdscience.co.uk` in [Google Analytics](https://analytics.google.com/).
2. Copy the Measurement ID (`G-XXXXXXXX`).
3. Set it in Vercel (Production, Preview, Development) as:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` (required by this project)
   - optionally also `VITE_GA_MEASUREMENT_ID` with the same value
4. Redeploy so the Vite build inlines the public ID.
5. On the live site, accept analytics cookies once, then confirm `page_view` in GA4 Realtime / DebugView.

### Content Security Policy

The production site currently does **not** ship a `Content-Security-Policy` header. If one is added later, allow:

- `script-src`: `https://www.googletagmanager.com`
- `connect-src`: `https://www.google-analytics.com` `https://analytics.google.com` `https://*.google-analytics.com` `https://*.analytics.google.com` `https://*.googletagmanager.com`
- `img-src`: `https://www.google-analytics.com` `https://www.googletagmanager.com`

Do not relax unrelated CSP directives when adding these hosts.

### Linking GA4 to Search Console / GSC Wizard

Repository code cannot complete Google account authorisation. After the Measurement ID is live:

1. Open [Google Search Console](https://search.google.com/search-console) for `sc-domain:jdscience.co.uk`.
2. Settings → Associations → Google Analytics (or associate from the GA4 Admin → Product links → Search Console).
3. Choose the JD Science GA4 property and confirm.
4. In GSC Wizard, refresh the property connection so it detects the linked GA4 property.

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

| Event | When | GA4 mapping (when consent granted) |
| --- | --- | --- |
| `page_view` | SPA route change / first load | `page_view` |
| `page_engagement` | Time spent on a page (visibility / navigation) | (first-party only) |
| `resource_view` | Resource row opened | `resource_view` |
| `resource_download` | Resource PDF / file opened | `file_download` |
| `resource_preview` | Video / preview style open | (first-party only) |
| `product_view` | Shop product detail | `view_item` |
| `product_preview` | Product has a preview asset | `view_item` |
| `add_to_cart` | Add to basket | `add_to_cart` |
| `checkout_started` | Checkout form / Stripe redirect start | `begin_checkout` |
| `purchase_completed` | Shop success return + Stripe webhook | `purchase` |
| `tutor_page_view` | Tutors listing / tutoring surfaces | (first-party only) |
| `tutor_profile_view` | Tutor profile modal | (first-party only) |
| `tutor_enquiry_started` | Paid booking flow started | `generate_lead` |
| `tutor_booking_submitted` | Trial booked / tutoring checkout success | `generate_lead` |
| `tutor_booking_confirmed` | Stripe webhook or admin confirms booking | (first-party / server) |
| `tutor_application_started` | Become-a-tutor form opened | `tutor_application_start` |
| `tutor_application_submitted` | Tutor application saved successfully | `tutor_application_submit` |
| `amazon_book_click` | Amazon / Chemistry Companion outbound click | `outbound_click` |
| `contact_form_submitted` | Contact form success | `generate_lead` |
| `signup_completed` | Visitor account registration | `sign_up` |

## Database

Run once in Supabase SQL editor:

`supabase/migrations/20260905_analytics_events.sql`
