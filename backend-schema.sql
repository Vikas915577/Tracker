-- Winter Arc Tracker V25 backend.
-- This file preserves the V24.1 public model but uses authenticated owner RLS.
-- Enable Supabase Anonymous Sign-Ins before Community Sync is used.
-- Never expose a service-role key in the client.

create table if not exists public.arc_users (
  id uuid primary key,
  display_name text not null default 'Anonymous',
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
  community_opt_in boolean not null default false,
  week_score integer not null default 0,
  rank_score integer not null default 0,
  league text not null default 'Starter',
  week_key date,
  created_at timestamptz not null default now()
);

create table if not exists public.arc_challenges (
  code text primary key,
  title text not null,
  description text not null default '',
  days integer not null default 7,
  start_date date not null,
  creator_id uuid references auth.users(id) on delete set null,
  creator_name text not null default 'Anonymous',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.arc_challenge_members (
  challenge_code text not null references public.arc_challenges(code) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Anonymous',
  progress integer not null default 0,
  progress_pct integer not null default 0,
  last_seen timestamptz not null default now(),
  primary key(challenge_code, user_id)
);

alter table public.arc_users enable row level security;
alter table public.arc_challenges enable row level security;
alter table public.arc_challenge_members enable row level security;

drop policy if exists arc_users_insert on public.arc_users;
drop policy if exists arc_users_update on public.arc_users;
drop policy if exists arc_users_delete on public.arc_users;
drop policy if exists arc_users_public_select on public.arc_users;

drop policy if exists arc_challenges_public_select on public.arc_challenges;
drop policy if exists arc_challenges_insert on public.arc_challenges;
drop policy if exists arc_challenge_members_public_select on public.arc_challenge_members;
drop policy if exists arc_challenge_members_insert on public.arc_challenge_members;
drop policy if exists arc_challenge_members_update on public.arc_challenge_members;

create policy arc_users_owner_insert on public.arc_users
  for insert to authenticated
  with check (id = auth.uid());

create policy arc_users_owner_update on public.arc_users
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy arc_users_owner_delete on public.arc_users
  for delete to authenticated
  using (id = auth.uid());

create policy arc_users_public_select on public.arc_users
  for select to anon, authenticated
  using (public_profile = true and community_opt_in = true);

create policy arc_challenges_public_select on public.arc_challenges
  for select to anon, authenticated
  using (active = true);

create policy arc_challenges_owner_insert on public.arc_challenges
  for insert to authenticated
  with check (creator_id = auth.uid());

create policy arc_challenge_members_public_select on public.arc_challenge_members
  for select to anon, authenticated
  using (true);

create policy arc_challenge_members_owner_insert on public.arc_challenge_members
  for insert to authenticated
  with check (user_id = auth.uid());

create policy arc_challenge_members_owner_update on public.arc_challenge_members
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select on public.arc_users to anon, authenticated;
grant insert, update, delete on public.arc_users to authenticated;
grant select on public.arc_challenges to anon, authenticated;
grant insert on public.arc_challenges to authenticated;
grant select on public.arc_challenge_members to anon, authenticated;
grant insert, update on public.arc_challenge_members to authenticated;

create or replace function public.get_public_leaderboard(p_limit integer default 20)
returns table(
  rank bigint,
  id uuid,
  display_name text,
  total_wins integer,
  best_streak integer,
  rank_score integer,
  week_score integer,
  league text,
  last_seen timestamptz
)
language sql stable security definer set search_path = public as $$
  with ranked as (
    select row_number() over (
      order by u.rank_score desc, u.best_streak desc, u.total_wins desc, u.id asc
    ) as rank,
    u.id,u.display_name,u.total_wins,u.best_streak,u.rank_score,u.week_score,u.league,u.last_seen
    from public.arc_users u
    where u.public_profile = true and u.community_opt_in = true
  )
  select rank,id,display_name,total_wins,best_streak,rank_score,week_score,league,last_seen
  from ranked
  where rank <= greatest(1,least(coalesce(p_limit,20),100))
  order by rank;
$$;

create or replace function public.get_public_rank(p_user_id uuid)
returns table(
  rank bigint,
  id uuid,
  display_name text,
  rank_score integer,
  best_streak integer,
  total_wins integer,
  league text
)
language sql stable security definer set search_path = public as $$
  with ranked as (
    select row_number() over (
      order by u.rank_score desc, u.best_streak desc, u.total_wins desc, u.id asc
    ) as rank,
    u.id,u.display_name,u.rank_score,u.best_streak,u.total_wins,u.league
    from public.arc_users u
    where u.public_profile = true and u.community_opt_in = true
  )
  select rank,id,display_name,rank_score,best_streak,total_wins,league
  from ranked
  where id = p_user_id
  limit 1;
$$;

create or replace function public.get_public_active_members(p_minutes integer default 15, p_limit integer default 6)
returns table(
  rank bigint,
  id uuid,
  display_name text,
  rank_score integer,
  best_streak integer,
  total_wins integer,
  last_seen timestamptz
)
language sql stable security definer set search_path = public as $$
  with ranked as (
    select row_number() over (
      order by u.rank_score desc, u.best_streak desc, u.total_wins desc, u.id asc
    ) as rank,
    u.id,u.display_name,u.rank_score,u.best_streak,u.total_wins,u.last_seen
    from public.arc_users u
    where u.public_profile = true and u.community_opt_in = true
  )
  select rank,id,display_name,rank_score,best_streak,total_wins,last_seen
  from ranked
  where last_seen >= now() - make_interval(mins => greatest(1,least(coalesce(p_minutes,15),1440)))
  order by last_seen desc, rank asc
  limit greatest(1,least(coalesce(p_limit,6),20));
$$;

grant execute on function public.get_public_leaderboard(integer) to anon, authenticated;
grant execute on function public.get_public_rank(uuid) to anon, authenticated;
grant execute on function public.get_public_active_members(integer, integer) to anon, authenticated;

-- Creator dashboard: replace the placeholder before production use.
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
language sql security definer set search_path = public, auth as $$
  select u.id,u.display_name,u.instagram_handle,u.arc_day,u.total_arc_days,u.arc_progress,
         u.today_completed,u.total_habits,u.total_wins,u.best_streak,u.last_seen,u.public_profile
  from public.arc_users u
  where (select email from auth.users where id = auth.uid()) = 'YOUR_CREATOR_EMAIL'
  order by u.last_seen desc;
$$;

grant execute on function public.creator_dashboard() to authenticated;
