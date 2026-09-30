-- Winter Arc Tracker V19 — Supabase backend / community league
-- The public leaderboard exposes only users who explicitly enable public_profile.
-- Private habit names, journal, sleep, mood, PIN and local history are never public.

create table if not exists public.arc_users (
  id uuid primary key,
  display_name text not null default 'Anonymous Hustler',
  instagram_handle text default '',
  goal text default 'Overall',
  arc_day integer not null default 0,
  total_arc_days integer not null default 92,
  arc_progress integer not null default 0,
  today_completed integer not null default 0,
  total_habits integer not null default 0,
  total_wins integer not null default 0,
  best_streak integer not null default 0,
  consistency_pct integer not null default 0,
  eligible_checks integer not null default 0,
  recovery_count integer not null default 0,
  arc_score integer not null default 0,
  league text not null default 'Bronze',
  arc_started_at date,
  public_habits jsonb not null default '[]'::jsonb,
  last_seen timestamptz not null default now(),
  public_profile boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.arc_users add column if not exists goal text default 'Overall';
alter table public.arc_users add column if not exists consistency_pct integer not null default 0;
alter table public.arc_users add column if not exists eligible_checks integer not null default 0;
alter table public.arc_users add column if not exists recovery_count integer not null default 0;
alter table public.arc_users add column if not exists arc_score integer not null default 0;
alter table public.arc_users add column if not exists league text not null default 'Bronze';
alter table public.arc_users add column if not exists arc_started_at date;
alter table public.arc_users add column if not exists public_habits jsonb not null default '[]'::jsonb;

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

alter table public.arc_users enable row level security;
alter table public.arc_daily enable row level security;

drop policy if exists arc_users_insert on public.arc_users;
create policy arc_users_insert on public.arc_users for insert to anon, authenticated with check (true);
drop policy if exists arc_users_update on public.arc_users;
create policy arc_users_update on public.arc_users for update to anon, authenticated using (id = id) with check (id = id);
drop policy if exists arc_daily_insert on public.arc_daily;
create policy arc_daily_insert on public.arc_daily for insert to anon, authenticated with check (true);

grant insert, update on public.arc_users to anon, authenticated;
grant insert on public.arc_daily to anon, authenticated;

-- Public leaderboard RPC. RLS SELECT remains closed; this function exposes only public_profile=true rows.
create or replace function public.public_leaderboard()
returns table(
  id uuid,
  display_name text,
  instagram_handle text,
  goal text,
  arc_day integer,
  total_arc_days integer,
  arc_progress integer,
  today_completed integer,
  total_habits integer,
  total_wins integer,
  best_streak integer,
  consistency_pct integer,
  eligible_checks integer,
  recovery_count integer,
  arc_score integer,
  league text,
  arc_started_at date,
  public_habits jsonb,
  last_seen timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select u.id,u.display_name,u.instagram_handle,u.goal,
         u.arc_day,u.total_arc_days,u.arc_progress,u.today_completed,
         u.total_habits,u.total_wins,u.best_streak,u.consistency_pct,
         u.eligible_checks,u.recovery_count,u.arc_score,u.league,
         u.arc_started_at,
         case when jsonb_typeof(u.public_habits)='array' then u.public_habits else '[]'::jsonb end,
         u.last_seen
  from public.arc_users u
  where u.public_profile = true
  order by u.arc_score desc,u.consistency_pct desc,u.best_streak desc,u.total_wins desc,u.last_seen desc
  limit 500;
$$;

grant execute on function public.public_leaderboard() to anon, authenticated;

-- Creator-only dashboard RPC.
create or replace function public.creator_dashboard()
returns table(
  id uuid,
  display_name text,
  instagram_handle text,
  goal text,
  arc_day integer,
  total_arc_days integer,
  arc_progress integer,
  today_completed integer,
  total_habits integer,
  total_wins integer,
  best_streak integer,
  consistency_pct integer,
  recovery_count integer,
  arc_score integer,
  league text,
  arc_started_at date,
  public_profile boolean,
  last_seen timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
  select u.id,u.display_name,u.instagram_handle,u.goal,u.arc_day,u.total_arc_days,
         u.arc_progress,u.today_completed,u.total_habits,u.total_wins,
         u.best_streak,u.consistency_pct,u.recovery_count,u.arc_score,u.league,
         u.arc_started_at,u.public_profile,u.last_seen
  from public.arc_users u
  where (select email from auth.users where id = auth.uid()) = 'YOUR_CREATOR_EMAIL'
  order by u.last_seen desc;
$$;

grant execute on function public.creator_dashboard() to authenticated;

-- Production note:
-- The prototype accepts aggregate upserts from the public client. For a production launch,
-- move writes behind an authenticated/Edge Function boundary and calculate the score server-side.
