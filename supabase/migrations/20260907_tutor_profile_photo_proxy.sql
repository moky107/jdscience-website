-- Keep the tutor-applications bucket private (CVs / evidence stay protected).
-- Published profile photographs are served through the stable /api/tutor-photo
-- proxy, which uses the service role. This migration documents the intended
-- storage layout and does not open anonymous object reads.

-- Ensure the private applications bucket exists.
insert into storage.buckets (id, name, public)
values ('tutor-applications', 'tutor-applications', false)
on conflict (id) do update set public = false;

-- Optional helper comment for operators: profile photos live under
-- applications/profile-photo/* and must remain reachable by the service role.
