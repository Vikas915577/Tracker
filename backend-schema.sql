-- Winter Arc Tracker V15 backend
-- Supabase SQL. Run in Supabase SQL Editor.
-- Frontend uses only the public anon key. Never expose service_role in the site.

create extension if not exists pgcrypto;

create table if not exists public.community_users (
  client_id text primary key,
  display_name text not null default 'Anonymous',
  instagram_handle text,
  arc_day integer not null default 0,
  arc_progress integer not null default 0,
  today_done integer not null default 0,
  total_wins integer not null default 0,
  best_streak integer not null default 0,
  week_score integer not null default 0,
  joined_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  app_version text not null default 'V15.0'
);

create table if not exists public.creator_admins (
  email text primary key
);

alter table public.community_users enable row level security;
alter table public.creator_admins enable row level security;

create or replace function public.is_creator_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from public.creator_admins a where lower(a.email)=lower(coalesce(auth.jwt()->>'email','')));
$$;

-- Community sync is opt-in. Anonymous clients may upsert only the summary rows sent by the app.
drop policy if exists community_insert_anon on public.community_users;
create policy community_insert_anon on public.community_users
for insert to anon, authenticated
with check (
  length(client_id) between 10 and 120
  and arc_day between 0 and 92
  and arc_progress between 0 and 100
  and today_done between 0 and 100
  and total_wins between 0 and 100000
  and best_streak between 0 and 1000
  and week_score between 0 and 100
);

drop policy if exists community_update_anon on public.community_users;
create policy community_update_anon on public.community_users
for update to anon, authenticated
using (client_id is not null)
with check (
  length(client_id) between 10 and 120
  and arc_day between 0 and 92
  and arc_progress between 0 and 100
  and today_done between 0 and 100
  and total_wins between 0 and 100000
  and best_streak between 0 and 1000
  and week_score between 0 and 100
);

drop policy if exists community_select_admin on public.community_users;
create policy community_select_admin on public.community_users
for select to authenticated
using (public.is_creator_admin());

-- No public reads of creator admin emails.
drop policy if exists admin_no_public_read on public.creator_admins;
create policy admin_no_public_read on public.creator_admins
for select to authenticated
using (public.is_creator_admin());

-- After creating your Supabase Auth user, insert your email, for example:
-- insert into public.creator_admins(email) values ('you@example.com');

create table if not exists public.community_events (
  id bigint generated always as identity primary key,
  client_id text not null,
  event_type text not null,
  event_date date not null default current_date,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists community_events_type_idx on public.community_events(event_type, created_at desc);
alter table public.community_events enable row level security;

drop policy if exists events_insert_anon on public.community_events;
create policy events_insert_anon on public.community_events
for insert to anon, authenticated
with check (
  length(client_id) between 10 and 120
  and event_type in ('progress_shared','compare_created','compare_shared','compare_opened','invite_created','invite_opened')
);

drop policy if exists events_select_admin on public.community_events;
create policy events_select_admin on public.community_events
for select to authenticated
using (public.is_creator_admin());
