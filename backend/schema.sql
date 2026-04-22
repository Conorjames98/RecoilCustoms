-- ─── USERS ───────────────────────────────────────────────────────────────────
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  discord_id text unique not null,
  username text not null,
  avatar text,
  is_platform_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── COMMUNITIES ─────────────────────────────────────────────────────────────
create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  description text,
  banner text,
  logo text,
  rules text,
  discord_url text,
  twitter_url text,
  visibility text default 'private', -- private | public | featured
  featured boolean default false,
  created_at timestamptz default now()
);

-- ─── COMMUNITY MEMBERS ───────────────────────────────────────────────────────
create table if not exists community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text default 'member', -- owner | moderator | member
  joined_at timestamptz default now(),
  unique(community_id, user_id)
);

-- ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  author_id uuid references users(id) on delete set null,
  content text not null,
  pinned boolean default false,
  created_at timestamptz default now()
);

-- ─── SESSIONS ────────────────────────────────────────────────────────────────
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  community_id uuid references communities(id) on delete cascade,
  created_by uuid references users(id) on delete set null,
  title text not null,
  description text,
  status text default 'draft', -- draft | open | filling | ready | in_progress | ended | archived
  scheduled_at timestamptz,
  promote boolean default false,
  promote_until text default 'full', -- full | minimum | manual
  created_at timestamptz default now()
);

-- ─── SESSION ROUNDS ──────────────────────────────────────────────────────────
create table if not exists session_rounds (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  round_number int not null,
  title text,
  game_mode text default 'Warzone',
  map text,
  rules_presets text[] default '{}', -- array of preset keys
  custom_rules_text text,
  join_code text,
  status text default 'draft', -- draft | open | code_live | starting | in_progress | ended
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz default now()
);

-- ─── TEAMS ───────────────────────────────────────────────────────────────────
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  team_number int not null,
  name text,
  locked boolean default false,
  created_at timestamptz default now()
);

-- ─── TEAM MEMBERS (slots) ────────────────────────────────────────────────────
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  slot_number int,
  is_captain boolean default false,
  joined_at timestamptz default now(),
  unique(team_id, user_id),
  unique(team_id, slot_number)
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  type text not null,
  payload jsonb default '{}',
  read boolean default false,
  created_at timestamptz default now()
);
