-- Video of the Day: featured videos managed from the admin dashboard.
--
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Until it is run, /api/featured-video and /api/admin-featured-video store the
-- same records in public.site_settings (key = 'featured_videos'). The first
-- request after this migration copies those records into the new table
-- automatically and clears the temporary site_settings entry.

create extension if not exists pgcrypto;

create table if not exists public.featured_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  video_type text not null check (video_type in ('mp4', 'youtube')),
  -- YouTube URL, or a storage path inside the featured-videos bucket (e.g. videos/1730000000-title.mp4)
  video_url text not null,
  -- Storage path inside the featured-thumbnails bucket (e.g. thumbnails/1730000000-title.jpg)
  thumbnail_url text,
  resource_link text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Only one video can be the Video of the Day at a time.
create unique index if not exists featured_videos_single_published
  on public.featured_videos (is_published)
  where is_published;

create index if not exists featured_videos_created_at_idx
  on public.featured_videos (created_at desc);

create or replace function public.featured_videos_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists featured_videos_set_updated_at on public.featured_videos;
create trigger featured_videos_set_updated_at
  before update on public.featured_videos
  for each row execute function public.featured_videos_set_updated_at();

-- Row level security -----------------------------------------------------------
alter table public.featured_videos enable row level security;

drop policy if exists "Public read published featured videos" on public.featured_videos;
create policy "Public read published featured videos"
  on public.featured_videos for select
  using (is_published = true);

drop policy if exists "Admins read all featured videos" on public.featured_videos;
create policy "Admins read all featured videos"
  on public.featured_videos for select
  to authenticated
  using ((auth.jwt() ->> 'email') = any (array['jd943791@gmail.com']));

drop policy if exists "Admins insert featured videos" on public.featured_videos;
create policy "Admins insert featured videos"
  on public.featured_videos for insert
  to authenticated
  with check ((auth.jwt() ->> 'email') = any (array['jd943791@gmail.com']));

drop policy if exists "Admins update featured videos" on public.featured_videos;
create policy "Admins update featured videos"
  on public.featured_videos for update
  to authenticated
  using ((auth.jwt() ->> 'email') = any (array['jd943791@gmail.com']))
  with check ((auth.jwt() ->> 'email') = any (array['jd943791@gmail.com']));

drop policy if exists "Admins delete featured videos" on public.featured_videos;
create policy "Admins delete featured videos"
  on public.featured_videos for delete
  to authenticated
  using ((auth.jwt() ->> 'email') = any (array['jd943791@gmail.com']));

drop policy if exists "Service role manage featured videos" on public.featured_videos;
create policy "Service role manage featured videos"
  on public.featured_videos for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

grant select on public.featured_videos to anon, authenticated;
grant insert, update, delete on public.featured_videos to authenticated;

-- Storage buckets -----------------------------------------------------------------
-- 50 MB is the maximum single-file size on the Supabase Free plan. On Pro, raise
-- featured-videos.file_size_limit (Storage → Buckets → featured-videos → Edit).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('featured-videos', 'featured-videos', true, 52428800, array['video/mp4'])
on conflict (id) do update
  set public = true,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('featured-thumbnails', 'featured-thumbnails', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read; writes come from the admin API (service role + signed upload URLs)
-- or an authenticated admin session.
drop policy if exists "Public read featured video files" on storage.objects;
create policy "Public read featured video files"
  on storage.objects for select
  using (bucket_id in ('featured-videos', 'featured-thumbnails'));

drop policy if exists "Admins upload featured video files" on storage.objects;
create policy "Admins upload featured video files"
  on storage.objects for insert
  with check (
    bucket_id in ('featured-videos', 'featured-thumbnails')
    and (auth.role() = 'service_role' or (auth.jwt() ->> 'email') = any (array['jd943791@gmail.com']))
  );

drop policy if exists "Admins update featured video files" on storage.objects;
create policy "Admins update featured video files"
  on storage.objects for update
  using (
    bucket_id in ('featured-videos', 'featured-thumbnails')
    and (auth.role() = 'service_role' or (auth.jwt() ->> 'email') = any (array['jd943791@gmail.com']))
  );

drop policy if exists "Admins delete featured video files" on storage.objects;
create policy "Admins delete featured video files"
  on storage.objects for delete
  using (
    bucket_id in ('featured-videos', 'featured-thumbnails')
    and (auth.role() = 'service_role' or (auth.jwt() ->> 'email') = any (array['jd943791@gmail.com']))
  );
