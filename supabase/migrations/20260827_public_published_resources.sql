-- Public resource library access (run in the Supabase SQL editor).
-- The app filters catalogue rows with published = true (boolean), not a status text column.
-- Anonymous visitors may SELECT published rows and READ files in the resources storage bucket.
-- They must not INSERT / UPDATE / DELETE resources or storage objects.

-- ---------------------------------------------------------------------------
-- 1) resources table RLS
-- ---------------------------------------------------------------------------
alter table if exists public.resources enable row level security;

drop policy if exists "public can read published resources" on public.resources;
create policy "public can read published resources"
  on public.resources
  for select
  using (published = true);

drop policy if exists "authenticated can read all resources" on public.resources;
create policy "authenticated can read all resources"
  on public.resources
  for select
  to authenticated
  using (true);

drop policy if exists "authenticated can insert resources" on public.resources;
create policy "authenticated can insert resources"
  on public.resources
  for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update resources" on public.resources;
create policy "authenticated can update resources"
  on public.resources
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated can delete resources" on public.resources;
create policy "authenticated can delete resources"
  on public.resources
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 2) storage bucket: resources
-- Ensure the bucket exists and is public for published file URLs.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read resources bucket" on storage.objects;
create policy "Public read resources bucket"
  on storage.objects
  for select
  using (bucket_id = 'resources');

drop policy if exists "Authenticated upload resources bucket" on storage.objects;
create policy "Authenticated upload resources bucket"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'resources');

drop policy if exists "Authenticated update resources bucket" on storage.objects;
create policy "Authenticated update resources bucket"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'resources')
  with check (bucket_id = 'resources');

drop policy if exists "Authenticated delete resources bucket" on storage.objects;
create policy "Authenticated delete resources bucket"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'resources');
