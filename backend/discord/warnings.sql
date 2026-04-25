create table if not exists warnings (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null,
  moderator_id text not null,
  guild_id text not null,
  reason text not null,
  created_at timestamptz default now()
);
