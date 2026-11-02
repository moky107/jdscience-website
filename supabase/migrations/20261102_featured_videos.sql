-- Video of the Day: featured_videos table, storage buckets and policies.
-- Run once in the Supabase SQL editor (safe to re-run).
--
-- * Exactly one row may have is_published = true (enforced by a partial unique index).
-- * public.publish_featured_video(uuid) swaps the live video atomically
--   (unpublishes every other row, then publishes the chosen one).
-- * Admin writes go through the server API (service role + signed upload URLs);
--   the homepage only needs public read access to the published row and the media files.

create extension if not exists pgcrypto;

create table if not exists public.featured_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_type text not null check (video_type in ('mp4', 'youtube')),
  video_url text not null,
  thumbnail_url text,
  video_storage_path text,
  thumbnail_storage_path text,
  resource_url text,
  resource_label text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- Columns added after the first version of this migration (no-ops on a fresh install).
alter table public.featured_videos add column if not exists video_storage_path text;
alter table public.featured_videos add column if not exists thumbnail_storage_path text;
alter table public.featured_videos add column if not exists resource_url text;
alter table public.featured_videos add column if not exists resource_label text;

-- Only ONE featured video can be live at any time.
create unique index if not exists featured_videos_single_published
  on public.featured_videos (is_published)
  where is_published;

create index if not exists featured_videos_created_at_idx
  on public.featured_videos (created_at desc);

create or replace function public.featured_videos_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists featured_videos_touch_updated_at on public.featured_videos;
create trigger featured_videos_touch_updated_at
  before update on public.featured_videos
  for each row execute function public.featured_videos_touch_updated_at();

-- Atomically make one video the Video of the Day.
create or replace function public.publish_featured_video(target_id uuid)
returns public.featured_videos
language plpgsql
security definer
set search_path = public
as $$
declare
  published_row public.featured_videos;
begin
  if not exists (select 1 from public.featured_videos where id = target_id) then
    raise exception 'Featured video % not found', target_id using errcode = 'P0002';
  end if;

  update public.featured_videos
     set is_published = false
   where is_published = true
     and id <> target_id;

  update public.featured_videos
     set is_published = true,
         published_at = now()
   where id = target_id
  returning * into published_row;

  return published_row;
end;
$$;

revoke all on function public.publish_featured_video(uuid) from public;
revoke all on function public.publish_featured_video(uuid) from anon, authenticated;
grant execute on function public.publish_featured_video(uuid) to service_role;

alter table public.featured_videos enable row level security;

drop policy if exists "Public read published featured video" on public.featured_videos;
create policy "Public read published featured video"
  on public.featured_videos for select
  using (is_published = true);

drop policy if exists "Service role manage featured videos" on public.featured_videos;
create policy "Service role manage featured videos"
  on public.featured_videos for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Storage buckets (public read). The video bucket has no per-bucket size cap so the
-- project-wide upload limit (Storage settings) applies; raise that limit for long Full HD files.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('featured-videos', 'featured-videos', true, null, array['video/mp4'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('featured-thumbnails', 'featured-thumbnails', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read featured video media" on storage.objects;
create policy "Public read featured video media"
  on storage.objects for select
  using (bucket_id in ('featured-videos', 'featured-thumbnails'));

drop policy if exists "Service role write featured video media" on storage.objects;
create policy "Service role write featured video media"
  on storage.objects for insert
  with check (bucket_id in ('featured-videos', 'featured-thumbnails') and auth.role() = 'service_role');

drop policy if exists "Service role update featured video media" on storage.objects;
create policy "Service role update featured video media"
  on storage.objects for update
  using (bucket_id in ('featured-videos', 'featured-thumbnails') and auth.role() = 'service_role');

drop policy if exists "Service role delete featured video media" on storage.objects;
create policy "Service role delete featured video media"
  on storage.objects for delete
  using (bucket_id in ('featured-videos', 'featured-thumbnails') and auth.role() = 'service_role');

-- Import videos saved before this table existed. Until the migration is run, the API keeps
-- the library as JSON in public.site_settings (key 'featured_videos'); copy it across once.
do $$
declare
  raw_value text;
begin
  if to_regclass('public.site_settings') is null then
    return;
  end if;

  select value into raw_value from public.site_settings where key = 'featured_videos';
  if raw_value is null or btrim(raw_value) = '' then
    return;
  end if;

  insert into public.featured_videos (
    id, title, description, video_type, video_url, thumbnail_url,
    video_storage_path, thumbnail_storage_path, resource_url, resource_label,
    is_published, created_at, updated_at, published_at
  )
  select
    coalesce(nullif(item->>'id', '')::uuid, gen_random_uuid()),
    coalesce(nullif(item->>'title', ''), 'Video of the Day'),
    nullif(item->>'description', ''),
    item->>'video_type',
    item->>'video_url',
    nullif(item->>'thumbnail_url', ''),
    nullif(item->>'video_storage_path', ''),
    nullif(item->>'thumbnail_storage_path', ''),
    nullif(item->>'resource_url', ''),
    nullif(item->>'resource_label', ''),
    -- Keep every video, but only the most recently published one stays live.
    coalesce((item->>'is_published')::boolean, false)
      and row_number() over (
        order by coalesce((item->>'is_published')::boolean, false) desc,
                 nullif(item->>'published_at', '')::timestamptz desc nulls last
      ) = 1
      and not exists (select 1 from public.featured_videos fv where fv.is_published),
    coalesce(nullif(item->>'created_at', '')::timestamptz, now()),
    coalesce(nullif(item->>'updated_at', '')::timestamptz, now()),
    nullif(item->>'published_at', '')::timestamptz
  from jsonb_array_elements(raw_value::jsonb) as item
  where item->>'video_type' in ('mp4', 'youtube')
    and coalesce(item->>'video_url', '') <> ''
  on conflict do nothing;
exception
  when others then
    raise notice 'Skipped importing featured videos from site_settings: %', sqlerrm;
end;
$$;

notify pgrst, 'reload schema';
