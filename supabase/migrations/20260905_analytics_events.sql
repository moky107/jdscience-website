-- JDScience first-party analytics events.
-- Run once in the Supabase SQL editor (or via supabase db push).
-- Public visitors must NOT read analytics rows. Inserts go through the
-- /api/analytics-event serverless function using the service role key.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  anonymous_visitor_id text,
  session_id text,
  page_path text,
  referrer text,
  source text,
  medium text,
  campaign text,
  content text,
  resource_id text,
  product_id text,
  tutor_id text,
  device_category text,
  engagement_ms integer,
  is_admin boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_name_idx
  on public.analytics_events (event_name);

create index if not exists analytics_events_created_at_idx
  on public.analytics_events (created_at desc);

create index if not exists analytics_events_product_id_idx
  on public.analytics_events (product_id)
  where product_id is not null;

create index if not exists analytics_events_resource_id_idx
  on public.analytics_events (resource_id)
  where resource_id is not null;

create index if not exists analytics_events_session_idx
  on public.analytics_events (session_id, created_at desc)
  where session_id is not null;

create index if not exists analytics_events_visitor_idx
  on public.analytics_events (anonymous_visitor_id, created_at desc)
  where anonymous_visitor_id is not null;

create index if not exists analytics_events_name_created_idx
  on public.analytics_events (event_name, created_at desc);

create index if not exists analytics_events_source_created_idx
  on public.analytics_events (source, created_at desc)
  where source is not null;

alter table public.analytics_events enable row level security;

-- Deny all direct client access. The Vercel API uses the service role key,
-- which bypasses RLS. This keeps aggregates admin-only.
drop policy if exists "analytics events deny all" on public.analytics_events;
create policy "analytics events deny all"
  on public.analytics_events
  for all
  using (false)
  with check (false);

comment on table public.analytics_events is
  'First-party JDScience analytics. No PII. Insert via /api/analytics-event only.';
