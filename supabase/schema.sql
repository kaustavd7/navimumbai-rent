-- navimumbai.rent — Supabase schema
-- Run inside the Supabase SQL editor against a fresh project.

create extension if not exists "uuid-ossp";

create table if not exists pins (
  id uuid primary key default uuid_generate_v4(),
  type text not null check (type in ('lister', 'seeker')),
  lat double precision not null,
  lng double precision not null,
  node text,
  sector text,
  society text,
  bhk text not null,
  rent integer not null check (rent between 1000 and 1000000),
  furnishing text,
  gated boolean,
  parking integer,
  deposit_months integer,
  pet_ok boolean,
  gender_pref text,
  diet_pref text,
  smoking_pref text,
  notes text,
  contact_email text,
  contact_phone text,
  ip_hash text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  hidden boolean not null default false
);

create index if not exists pins_geo_idx on pins (lat, lng);
create index if not exists pins_node_idx on pins (node);
create index if not exists pins_created_idx on pins (created_at desc);

create table if not exists pin_reports (
  pin_id uuid not null references pins(id) on delete cascade,
  ip_hash text not null,
  reason text,
  created_at timestamptz not null default now(),
  primary key (pin_id, ip_hash)
);

-- Public read view: never expose contact info or ip_hash to the anon client.
create or replace view pins_public as
  select
    id, type, lat, lng, node, sector, society, bhk, rent,
    furnishing, gated, parking, deposit_months, pet_ok,
    gender_pref, diet_pref, smoking_pref, notes,
    created_at, expires_at, hidden
  from pins
  where hidden = false
    and (expires_at is null or expires_at > now());

alter table pins enable row level security;
alter table pin_reports enable row level security;

-- Anon can SELECT only via the public view; direct table reads are blocked.
revoke all on pins from anon;
grant select on pins_public to anon;

-- Inserts always go through the service-role API route, never directly.
revoke all on pin_reports from anon;
