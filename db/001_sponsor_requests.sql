-- Sponsor requests submitted from /partners. Run once in the Neon SQL Editor.
create table sponsor_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  company      text not null,
  email        text not null,
  contact_name text,
  role         text,
  phone        text,
  sector       text,
  interests    text[] not null default '{}',
  track        text,
  message      text,
  ip_hash      text,
  notified     boolean not null default false
);
create index on sponsor_requests (ip_hash, created_at);
