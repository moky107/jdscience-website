-- Run this in the Supabase SQL editor so homepage advice, exam tips and
-- education news can be saved from the admin dashboard.

create table if not exists public.education_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('revision-advice', 'exam-tips', 'education-news')),
  summary text not null,
  body text not null,
  published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.education_posts enable row level security;

drop policy if exists "public can read published education posts" on public.education_posts;
create policy "public can read published education posts"
  on public.education_posts
  for select
  using (published = true);

create index if not exists education_posts_published_at_idx
  on public.education_posts (published_at desc);
