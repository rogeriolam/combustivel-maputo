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
