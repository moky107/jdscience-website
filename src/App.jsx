create table if not exists videos (
  id bigint generated always as identity primary key,
  subject text, topic text, title text, url text,
  created_at timestamptz default now()
);
create table if not exists tutors (
  id bigint generated always as identity primary key,
  name text, subject text, bio text, rate text, photo text, payment_link text,
  created_at timestamptz default now()
);
alter table videos enable row level security;
alter table tutors enable row level security;
create policy "public read videos" on videos for select using (true);
create policy "admin write videos" on videos for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
create policy "public read tutors" on tutors for select using (true);
create policy "admin write tutors" on tutors for all using (auth.role()='authenticated') with check (auth.role()='authenticated');
