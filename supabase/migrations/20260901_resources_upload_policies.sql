-- Resources storage bucket and RLS policies for JDScience past-paper uploads.
-- Public reads stay open; admin writes go through the server API (service role + signed upload URLs).

insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public read resources bucket" on storage.objects;
create policy "Public read resources bucket"
  on storage.objects for select
  using (bucket_id = 'resources');

drop policy if exists "Service role write resources bucket" on storage.objects;
create policy "Service role write resources bucket"
  on storage.objects for insert
  with check (bucket_id = 'resources' and auth.role() = 'service_role');

drop policy if exists "Service role update resources bucket" on storage.objects;
create policy "Service role update resources bucket"
  on storage.objects for update
  using (bucket_id = 'resources' and auth.role() = 'service_role');

drop policy if exists "Service role delete resources bucket" on storage.objects;
create policy "Service role delete resources bucket"
  on storage.objects for delete
  using (bucket_id = 'resources' and auth.role() = 'service_role');

alter table if exists public.resources enable row level security;

drop policy if exists "Public read published resources" on public.resources;
create policy "Public read published resources"
  on public.resources for select
  using (published = true);

drop policy if exists "Service role manage resources" on public.resources;
create policy "Service role manage resources"
  on public.resources for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
