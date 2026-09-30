-- Winter Arc Tracker V14.1 — Supabase backend
-- 1) Create a Supabase project.
-- 2) Replace YOUR_CREATOR_EMAIL below with the email you use for the creator dashboard.
-- 3) Run this SQL in Supabase SQL Editor.
-- 4) Enable Email/Password Auth for the creator dashboard.

create table if not exists public.arc_users (
  id uuid primary key,
  display_name text not null default 'Anonymous Hustler',
  instagram_handle text default '',
  arc_day integer not null default 0,
  total_arc_days integer not null default 92,
  arc_progress integer not null default 0,
  today_completed integer not null default 0,
  total_habits integer not null default 0,
  total_wins integer not null default 0,
  best_streak integer not null default 0,
  last_seen timestamptz not null default now(),
  public_profile boolean not null default false,
  week_score integer not null default 0,
  rank_score integer not null default 0,
  league text not null default 'Starter',
  week_key date,
  created_at timestamptz not null default now()
);

create table if not exists public.arc_daily (
  user_id uuid not null references public.arc_users(id) on delete cascade,
  progress_date date not null,
  completed integer not null default 0,
  total_habits integer not null default 0,
  progress_pct integer not null default 0,
  best_streak integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id, progress_date)
);

-- V19 migration for an existing V14/V18 table.
alter table public.arc_users add column if not exists week_score integer not null default 0;
alter table public.arc_users add column if not exists rank_score integer not null default 0;
alter table public.arc_users add column if not exists league text not null default 'Starter';
alter table public.arc_users add column if not exists week_key date;

alter table public.arc_users enable row level security;
alter table public.arc_daily enable row level security;

-- The app currently uses a random device id for opt-in aggregate sync.
-- For a production deployment, move writes behind an Edge Function or authenticated user flow.
-- These policies intentionally allow INSERT/UPDATE but do NOT allow public SELECT.
drop policy if exists arc_users_insert on public.arc_users;
create policy arc_users_insert on public.arc_users for insert to anon, authenticated with check (true);
drop policy if exists arc_users_update on public.arc_users;
create policy arc_users_update on public.arc_users for update to anon, authenticated using (id = id) with check (id = id);
drop policy if exists arc_daily_insert on public.arc_daily;
create policy arc_daily_insert on public.arc_daily for insert to anon, authenticated with check (true);

drop policy if exists arc_users_public_select on public.arc_users;
create policy arc_users_public_select on public.arc_users for select to anon, authenticated using (public_profile = true);

grant select, insert, update on public.arc_users to anon, authenticated;
grant insert on public.arc_daily to anon, authenticated;

-- Creator-only dashboard RPC.
create or replace function public.creator_dashboard()
returns table(
  id uuid,
  display_name text,
  instagram_handle text,
  arc_day integer,
  total_arc_days integer,
  arc_progress integer,
  today_completed integer,
  total_habits integer,
  total_wins integer,
  best_streak integer,
  last_seen timestamptz,
  public_profile boolean
)
language sql
security definer
set search_path = public, auth
as $$
  select u.id,u.display_name,u.instagram_handle,u.arc_day,u.total_arc_days,
         u.arc_progress,u.today_completed,u.total_habits,u.total_wins,
         u.best_streak,u.last_seen,u.public_profile
  from public.arc_users u
  where (select email from auth.users where id = auth.uid()) = 'YOUR_CREATOR_EMAIL'
  order by u.last_seen desc;
$$;

grant execute on function public.creator_dashboard() to authenticated;


-- V19 Arc League challenges (lightweight public challenge metadata + member snapshots).
create table if not exists public.arc_challenges (
  code text primary key,
  title text not null,
  description text default '',
  days integer not null default 7,
  start_date date not null,
  creator_id uuid,
  creator_name text not null default 'Anonymous',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.arc_challenge_members (
  challenge_code text not null references public.arc_challenges(code) on delete cascade,
  user_id uuid not null,
  display_name text not null default 'Anonymous',
  progress integer not null default 0,
  progress_pct integer not null default 0,
  last_seen timestamptz not null default now(),
  primary key(challenge_code,user_id)
);

alter table public.arc_challenges enable row level security;
alter table public.arc_challenge_members enable row level security;

drop policy if exists arc_challenges_public_select on public.arc_challenges;
create policy arc_challenges_public_select on public.arc_challenges for select to anon, authenticated using (active = true);
drop policy if exists arc_challenges_insert on public.arc_challenges;
create policy arc_challenges_insert on public.arc_challenges for insert to anon, authenticated with check (true);
drop policy if exists arc_challenge_members_public_select on public.arc_challenge_members;
create policy arc_challenge_members_public_select on public.arc_challenge_members for select to anon, authenticated using (true);
drop policy if exists arc_challenge_members_insert on public.arc_challenge_members;
create policy arc_challenge_members_insert on public.arc_challenge_members for insert to anon, authenticated with check (true);
drop policy if exists arc_challenge_members_update on public.arc_challenge_members;
create policy arc_challenge_members_update on public.arc_challenge_members for update to anon, authenticated using (true) with check (true);

grant select, insert on public.arc_challenges to anon, authenticated;
grant select, insert, update on public.arc_challenge_members to anon, authenticated;
