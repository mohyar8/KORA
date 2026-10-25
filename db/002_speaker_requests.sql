-- Speaker applications and nominations submitted from /speakers. Run once in the Neon SQL Editor.
create table speaker_requests (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  mode              text not null,               -- 'self' | 'nominate'
  name              text not null,
  role              text not null,
  bio               text not null,
  email             text,
  phone             text,
  link              text,
  topic             text,
  track             text,
  formats           text[] not null default '{}',
  nominator_name    text,
  nominator_contact text,
  ip_hash           text,
  notified          boolean not null default false
);
create index on speaker_requests (ip_hash, created_at);
