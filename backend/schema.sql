-- ─── PROFILES ─────────────────────────────────────────────────────────────────
-- id matches auth.users.id (Supabase manages the UUID)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  discord_id text unique,
  username text,
  avatar text,
  is_platform_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, discord_id, username, avatar)
  values (
    new.id,
    new.raw_user_meta_data->>'provider_id',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    discord_id = excluded.discord_id,
    username   = excluded.username,
    avatar     = excluded.avatar,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute procedure handle_new_user();

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
create policy "profiles viewable by authenticated" on profiles for select using (auth.uid() is not null);
create policy "users can update own profile" on profiles for update using (auth.uid() = id);

-- ─── COMMUNITIES ─────────────────────────────────────────────────────────────
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  banner text,
  logo text,
  rules text,
  discord_url text,
  twitter_url text,
  visibility text default 'private',
  featured boolean default false,
  discord_guild_id text,
  bot_installed boolean default false,
  created_at timestamptz default now()
);

alter table communities enable row level security;
create policy "public communities viewable" on communities for select using (visibility in ('public','featured') or owner_id = auth.uid());
create policy "members can view their communities" on communities for select using (
  exists (select 1 from community_members where community_id = id and user_id = auth.uid())
);
create policy "owners can update" on communities for update using (owner_id = auth.uid());
create policy "authenticated can create" on communities for insert with check (auth.uid() is not null);

-- ─── COMMUNITY MEMBERS ───────────────────────────────────────────────────────
create table if not exists community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(community_id, user_id)
);

alter table community_members enable row level security;
create policy "members viewable by community members" on community_members for select using (auth.uid() = user_id or exists (select 1 from community_members cm2 where cm2.community_id = community_id and cm2.user_id = auth.uid()));
create policy "users can join" on community_members for insert with check (auth.uid() = user_id);
create policy "users can leave" on community_members for delete using (auth.uid() = user_id);

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  content text not null,
  pinned boolean default false,
  created_at timestamptz default now()
);

alter table announcements enable row level security;
create policy "announcements viewable by all" on announcements for select using (true);
create policy "mods can post" on announcements for insert with check (
  exists (select 1 from community_members where community_id = announcements.community_id and user_id = auth.uid() and role in ('owner','moderator'))
);

-- ─── SESSIONS ────────────────────────────────────────────────────────────────
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  created_by uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  status text default 'draft',
  scheduled_at timestamptz,
  promote boolean default false,
  promote_until text default 'full',
  created_at timestamptz default now()
);

alter table sessions enable row level security;
create policy "sessions viewable by members or public" on sessions for select using (
  exists (select 1 from communities where id = sessions.community_id and visibility in ('public','featured'))
  or exists (select 1 from community_members where community_id = sessions.community_id and user_id = auth.uid())
);
create policy "mods can manage sessions" on sessions for all using (
  exists (select 1 from community_members where community_id = sessions.community_id and user_id = auth.uid() and role in ('owner','moderator'))
);

-- ─── SESSION ROUNDS ──────────────────────────────────────────────────────────
create table if not exists session_rounds (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  round_number int not null,
  title text,
  game_mode text default 'Warzone',
  map text,
  rules_presets text[] default '{}',
  custom_rules_text text,
  join_code text,
  status text default 'draft',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

alter table session_rounds enable row level security;
create policy "rounds viewable by members" on session_rounds for select using (
  exists (
    select 1 from sessions s
    join community_members cm on cm.community_id = s.community_id
    where s.id = session_rounds.session_id and cm.user_id = auth.uid()
  )
);
create policy "mods can manage rounds" on session_rounds for all using (
  exists (
    select 1 from sessions s
    join community_members cm on cm.community_id = s.community_id
    where s.id = session_rounds.session_id and cm.user_id = auth.uid() and cm.role in ('owner','moderator')
  )
);

-- ─── TEAMS ───────────────────────────────────────────────────────────────────
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  team_number int not null,
  name text,
  locked boolean default false,
  max_size int default 4,
  created_at timestamptz default now()
);

alter table teams enable row level security;
create policy "teams viewable by members" on teams for select using (
  exists (
    select 1 from sessions s
    join community_members cm on cm.community_id = s.community_id
    where s.id = teams.session_id and cm.user_id = auth.uid()
  )
  or exists (
    select 1 from sessions s
    join communities c on c.id = s.community_id
    where s.id = teams.session_id and c.visibility in ('public','featured')
  )
);
create policy "mods can manage teams" on teams for all using (
  exists (
    select 1 from sessions s
    join community_members cm on cm.community_id = s.community_id
    where s.id = teams.session_id and cm.user_id = auth.uid() and cm.role in ('owner','moderator')
  )
);

-- ─── TEAM MEMBERS ────────────────────────────────────────────────────────────
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  slot_number int,
  is_captain boolean default false,
  joined_at timestamptz default now(),
  unique(team_id, user_id),
  unique(team_id, slot_number)
);

alter table team_members enable row level security;
create policy "team members viewable by session members" on team_members for select using (
  exists (
    select 1 from teams t
    join sessions s on s.id = t.session_id
    join community_members cm on cm.community_id = s.community_id
    where t.id = team_members.team_id and cm.user_id = auth.uid()
  )
);
create policy "members can join teams" on team_members for insert with check (auth.uid() = user_id);
create policy "members can leave teams" on team_members for delete using (auth.uid() = user_id);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  payload jsonb default '{}',
  read boolean default false,
  created_at timestamptz default now()
);

alter table notifications enable row level security;
create policy "users see own notifications" on notifications for select using (auth.uid() = user_id);

-- ─── BOT SETTINGS ────────────────────────────────────────────────────────────
create table if not exists bot_settings (
  guild_id text primary key,
  xp_enabled boolean default true,
  xp_per_message integer default 10,
  xp_cooldown_seconds integer default 60,
  welcome_enabled boolean default true,
  welcome_channel_id text,
  welcome_message text default 'Welcome {user} to {server}! 🎮',
  automod_bad_words text[] default '{}',
  automod_spam_enabled boolean default true,
  automod_spam_threshold integer default 5,
  automod_invite_links_enabled boolean default true,
  mod_role_id text,
  log_channel_id text,
  updated_at timestamptz default now()
);

-- ─── DISCORD OAUTH FIELDS ON PROFILES ────────────────────────────────────────
alter table profiles add column if not exists discord_access_token text;
alter table profiles add column if not exists discord_guilds jsonb default '[]';

-- ─── LFG ─────────────────────────────────────────────────────────────────────
create table if not exists lfg_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  mode text not null,
  platform text not null default 'Any',
  slots_needed integer not null default 1,
  slots_filled integer not null default 0,
  mic_required boolean default false,
  note text,
  status text not null default 'open',
  created_at timestamptz default now(),
  expires_at timestamptz default now() + interval '2 hours'
);

create table if not exists lfg_members (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references lfg_posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  unique(post_id, user_id)
);

alter table lfg_posts enable row level security;
alter table lfg_members enable row level security;
create policy "anyone can view open lfg" on lfg_posts for select using (true);
create policy "auth users can create lfg" on lfg_posts for insert with check (auth.uid() = user_id);
create policy "owners can update lfg" on lfg_posts for update using (auth.uid() = user_id);
create policy "anyone can view lfg members" on lfg_members for select using (true);
create policy "auth users can join lfg" on lfg_members for insert with check (auth.uid() = user_id);
create policy "auth users can leave lfg" on lfg_members for delete using (auth.uid() = user_id);
alter table bot_settings add column if not exists lfg_channel_id text;
