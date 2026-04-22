create or replace view public.latest_signals_per_user
with (security_invoker = true) as
select distinct on (station_id, fuel_type, reporter_identity)
  id,
  station_id,
  user_id,
  fuel_type,
  status_option,
  created_at,
  distance_meters,
  gps_validated,
  reputation_weight,
  reporter_identity
from (
  select
    s.*,
    coalesce(s.user_id::text, s.meta->>'reporter_key', 'guest:' || s.id::text) as reporter_identity
  from public.signals s
) signals
where created_at >= now() - interval '3 hours'
  and gps_validated = true
order by station_id, fuel_type, reporter_identity, created_at desc;

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
  diesel.explanation as diesel_explanation
from public.stations s
cross join lateral public.calculate_station_fuel_status(s.id, 'gasoline') gasoline
cross join lateral public.calculate_station_fuel_status(s.id, 'diesel') diesel;
