do $$
begin
  create type public.queue_status_option as enum ('none', 'short', 'long');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.queue_public_status as enum ('none', 'short', 'long', 'conflict', 'unknown');
exception when duplicate_object then null;
end $$;

alter table public.signals
  add column if not exists queue_status public.queue_status_option;

create index if not exists signals_queue_station_idx
  on public.signals (station_id, queue_status, created_at desc)
  where queue_status is not null;

create or replace view public.latest_queue_signals_per_user
with (security_invoker = true) as
select distinct on (station_id, reporter_identity)
  id,
  station_id,
  user_id,
  queue_status,
  created_at,
  distance_meters,
  gps_validated,
  reporter_identity
from (
  select
    s.*,
    coalesce(s.user_id::text, s.meta->>'reporter_key', 'guest:' || s.id::text) as reporter_identity
  from public.signals s
) signals
where created_at >= now() - interval '3 hours'
  and gps_validated = true
  and queue_status is not null
order by station_id, reporter_identity, created_at desc;

create or replace function public.calculate_station_queue_status(target_station_id uuid)
returns table (
  status public.queue_public_status,
  none_count integer,
  short_count integer,
  long_count integer,
  recent_signals integer,
  last_updated_at timestamptz,
  explanation text
)
language sql
stable
as $$
with recent as (
  select *
  from public.latest_queue_signals_per_user
  where station_id = target_station_id
),
totals as (
  select
    count(*)::integer as recent_signals,
    count(*) filter (where queue_status = 'none')::integer as none_count,
    count(*) filter (where queue_status = 'short')::integer as short_count,
    count(*) filter (where queue_status = 'long')::integer as long_count,
    max(created_at) as last_updated_at
  from recent
),
resolved as (
  select
    case
      when recent_signals < 2 then 'unknown'::public.queue_public_status
      when greatest(none_count, short_count, long_count)::numeric / nullif(recent_signals, 0) >= 0.6
        and none_count = greatest(none_count, short_count, long_count) then 'none'::public.queue_public_status
      when greatest(none_count, short_count, long_count)::numeric / nullif(recent_signals, 0) >= 0.6
        and short_count = greatest(none_count, short_count, long_count) then 'short'::public.queue_public_status
      when greatest(none_count, short_count, long_count)::numeric / nullif(recent_signals, 0) >= 0.6
        and long_count = greatest(none_count, short_count, long_count) then 'long'::public.queue_public_status
      else 'conflict'::public.queue_public_status
    end as status,
    none_count,
    short_count,
    long_count,
    recent_signals,
    last_updated_at
  from totals
)
select
  resolved.status,
  resolved.none_count,
  resolved.short_count,
  resolved.long_count,
  resolved.recent_signals,
  resolved.last_updated_at,
  case
    when resolved.status = 'none' then 'As observações recentes indicam que não há fila.'
    when resolved.status = 'short' then 'As observações recentes indicam uma fila curta.'
    when resolved.status = 'long' then 'As observações recentes indicam uma fila longa.'
    when resolved.status = 'conflict' then 'Há observações recentes contraditórias sobre a fila.'
    else 'Ainda não há informação pública suficiente sobre a fila.'
  end as explanation
from resolved;
$$;

create or replace view public.stations_with_current_status
with (security_invoker = true) as
select
  s.id,
  s.name,
  s.province,
  s.municipality,
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
  diesel.explanation as diesel_explanation,
  queue.status as queue_status,
  queue.none_count as queue_none_count,
  queue.short_count as queue_short_count,
  queue.long_count as queue_long_count,
  queue.recent_signals as queue_recent_signals,
  queue.last_updated_at as queue_last_updated_at,
  queue.explanation as queue_explanation
from public.stations s
cross join lateral public.calculate_station_fuel_status(s.id, 'gasoline') gasoline
cross join lateral public.calculate_station_fuel_status(s.id, 'diesel') diesel
cross join lateral public.calculate_station_queue_status(s.id) queue;
