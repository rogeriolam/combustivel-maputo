create extension if not exists "pgcrypto";
create extension if not exists postgis;

create type user_role as enum ('active', 'blocked', 'admin');
create type city_name as enum ('Maputo', 'Matola');
create type fuel_type as enum ('gasoline', 'diesel');
create type signal_option as enum ('available', 'unavailable');
create type fuel_status as enum ('available', 'unavailable', 'conflict', 'unknown');
create type confidence_level as enum ('low', 'medium', 'high');
create type alert_channel as enum ('browser', 'email');
create type alert_trigger as enum ('available');

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  auth_provider text not null default 'email',
  reputation_score integer not null default 0,
  reputation_weight numeric(4,2) not null default 1.00,
  role user_role not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city city_name not null,
  neighborhood text not null,
  latitude double precision not null,
  longitude double precision not null,
  geom geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(longitude, latitude), 4326)::geography
  ) stored,
  created_at timestamptz not null default now(),
  created_by uuid not null references profiles(id),
  is_active boolean not null default true,
  is_validated boolean not null default true,
  admin_notes jsonb not null default '{}'::jsonb
);

create index if not exists stations_geom_idx on stations using gist (geom);
create index if not exists stations_name_idx on stations using gin (to_tsvector('simple', name));

create table if not exists signals (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references stations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  fuel_type fuel_type not null,
  status_option signal_option not null,
  created_at timestamptz not null default now(),
  user_latitude double precision not null,
  user_longitude double precision not null,
  user_geom geography(point, 4326) generated always as (
    st_setsrid(st_makepoint(user_longitude, user_latitude), 4326)::geography
  ) stored,
  distance_meters integer not null,
  gps_validated boolean not null default false,
  reputation_weight numeric(4,2) not null default 1.00,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists signals_station_idx on signals (station_id, fuel_type, created_at desc);
create index if not exists signals_user_idx on signals (user_id, created_at desc);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  station_id uuid references stations(id) on delete cascade,
  city city_name,
  fuel_type fuel_type not null,
  trigger_status alert_trigger not null default 'available',
  channel alert_channel not null default 'browser',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint alerts_target_check check (
    station_id is not null or city is not null
  )
);

create table if not exists admin_actions (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references profiles(id) on delete cascade,
  action_type text not null,
  target_station_id uuid references stations(id) on delete cascade,
  target_user_id uuid references profiles(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function update_profile_reputation_weight()
returns trigger
language plpgsql
as $$
begin
  new.reputation_weight :=
    case
      when new.reputation_score >= 80 then 1.25
      when new.reputation_score >= 40 then 1.10
      else 1.00
    end;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_reputation_trigger on profiles;
create trigger profiles_reputation_trigger
before insert or update of reputation_score on profiles
for each row
execute function update_profile_reputation_weight();

create or replace function ensure_station_not_duplicate()
returns trigger
language plpgsql
as $$
declare
  duplicate_exists boolean;
begin
  select exists (
    select 1
    from stations s
    where st_dwithin(
      s.geom,
      st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography,
      100
    )
  ) into duplicate_exists;

  if duplicate_exists then
    raise exception 'Já existe uma bomba registada a menos de 100 metros.';
  end if;

  return new;
end;
$$;

drop trigger if exists stations_duplicate_trigger on stations;
create trigger stations_duplicate_trigger
before insert on stations
for each row
execute function ensure_station_not_duplicate();

create or replace function set_signal_distance_and_validate()
returns trigger
language plpgsql
as $$
declare
  station_geom geography(point, 4326);
begin
  select geom into station_geom from stations where id = new.station_id;

  new.distance_meters := round(
    st_distance(
      station_geom,
      st_setsrid(st_makepoint(new.user_longitude, new.user_latitude), 4326)::geography
    )
  );
  new.gps_validated := new.distance_meters <= 100;
  new.reputation_weight := (select reputation_weight from profiles where id = new.user_id);

  if new.gps_validated is false then
    raise exception 'Sinalização bloqueada: utilizador fora do raio de 100 metros.';
  end if;

  return new;
end;
$$;

drop trigger if exists signals_validation_trigger on signals;
create trigger signals_validation_trigger
before insert on signals
for each row
execute function set_signal_distance_and_validate();

create or replace view latest_signals_per_user as
select distinct on (station_id, fuel_type, user_id)
  id,
  station_id,
  user_id,
  fuel_type,
  status_option,
  created_at,
  distance_meters,
  gps_validated,
  reputation_weight
from signals
where created_at >= now() - interval '3 hours'
  and gps_validated = true
order by station_id, fuel_type, user_id, created_at desc;

create or replace function calculate_station_fuel_status(
  target_station_id uuid,
  target_fuel fuel_type
)
returns table (
  status fuel_status,
  confidence confidence_level,
  available_count integer,
  unavailable_count integer,
  recent_signals integer,
  last_updated_at timestamptz,
  weighted_available numeric,
  weighted_unavailable numeric,
  explanation text
)
language sql
stable
as $$
with recent as (
  select *
  from latest_signals_per_user
  where station_id = target_station_id
    and fuel_type = target_fuel
),
totals as (
  select
    count(*)::integer as recent_signals,
    count(*) filter (where status_option = 'available')::integer as available_count,
    count(*) filter (where status_option = 'unavailable')::integer as unavailable_count,
    coalesce(sum(reputation_weight) filter (where status_option = 'available'), 0) as weighted_available,
    coalesce(sum(reputation_weight) filter (where status_option = 'unavailable'), 0) as weighted_unavailable,
    max(created_at) as last_updated_at
  from recent
),
resolved as (
  select
    case
      when recent_signals < 2 then 'unknown'::fuel_status
      when weighted_available / nullif(weighted_available + weighted_unavailable, 0) >= 0.6 then 'available'::fuel_status
      when weighted_unavailable / nullif(weighted_available + weighted_unavailable, 0) >= 0.6 then 'unavailable'::fuel_status
      else 'conflict'::fuel_status
    end as status,
    case
      when recent_signals >= 6 and greatest(weighted_available, weighted_unavailable) / nullif(weighted_available + weighted_unavailable, 0) >= 0.75 then 'high'::confidence_level
      when recent_signals >= 3 and greatest(weighted_available, weighted_unavailable) / nullif(weighted_available + weighted_unavailable, 0) >= 0.6 then 'medium'::confidence_level
      else 'low'::confidence_level
    end as confidence,
    available_count,
    unavailable_count,
    recent_signals,
    last_updated_at,
    weighted_available,
    weighted_unavailable
  from totals
)
select
  resolved.status,
  resolved.confidence,
  resolved.available_count,
  resolved.unavailable_count,
  resolved.recent_signals,
  resolved.last_updated_at,
  resolved.weighted_available,
  resolved.weighted_unavailable,
  case
    when resolved.status = 'available' then 'A maioria das sinalizações recentes indica disponibilidade.'
    when resolved.status = 'unavailable' then 'A maioria das sinalizações recentes indica indisponibilidade.'
    when resolved.status = 'conflict' then 'Existem sinalizações recentes contraditórias sem maioria clara.'
    else 'Não há sinalizações recentes suficientes para um estado confiável.'
  end as explanation
from resolved;
$$;

create or replace view stations_with_current_status as
select
  s.id,
  s.name,
  s.city,
  s.neighborhood,
  s.latitude,
  s.longitude,
  s.created_at,
  s.created_by,
  s.is_active,
  s.is_validated,
  s.admin_notes,
  gasoline.status as gasoline_status,
  gasoline.confidence as gasoline_confidence,
  gasoline.available_count as gasoline_available_count,
  gasoline.unavailable_count as gasoline_unavailable_count,
  gasoline.recent_signals as gasoline_recent_signals,
  gasoline.last_updated_at as gasoline_last_updated_at,
  gasoline.weighted_available as gasoline_weighted_available,
  gasoline.weighted_unavailable as gasoline_weighted_unavailable,
  gasoline.explanation as gasoline_explanation,
  diesel.status as diesel_status,
  diesel.confidence as diesel_confidence,
  diesel.available_count as diesel_available_count,
  diesel.unavailable_count as diesel_unavailable_count,
  diesel.recent_signals as diesel_recent_signals,
  diesel.last_updated_at as diesel_last_updated_at,
  diesel.weighted_available as diesel_weighted_available,
  diesel.weighted_unavailable as diesel_weighted_unavailable,
  diesel.explanation as diesel_explanation
from stations s
cross join lateral calculate_station_fuel_status(s.id, 'gasoline') gasoline
cross join lateral calculate_station_fuel_status(s.id, 'diesel') diesel;

alter table profiles enable row level security;
alter table stations enable row level security;
alter table signals enable row level security;
alter table alerts enable row level security;
alter table admin_actions enable row level security;

create policy "profiles_select_self" on profiles
for select using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "profiles_insert_self" on profiles
for insert with check (auth.uid() = id);

create policy "profiles_update_self" on profiles
for update using (auth.uid() = id or exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "stations_read_all" on stations for select using (true);
create policy "stations_insert_authenticated" on stations
for insert with check (auth.uid() = created_by);
create policy "stations_update_admin" on stations
for update using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "signals_read_all" on signals for select using (true);
create policy "signals_insert_authenticated" on signals
for insert with check (
  auth.uid() = user_id
  and exists (select 1 from profiles p where p.id = auth.uid() and p.role <> 'blocked')
);

create policy "alerts_select_self" on alerts for select using (auth.uid() = user_id);
create policy "alerts_insert_self" on alerts for insert with check (auth.uid() = user_id);
create policy "alerts_update_self" on alerts for update using (auth.uid() = user_id);

create policy "admin_actions_admin_only" on admin_actions
for all using (exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin'));
