drop view if exists public.stations_with_current_status;

alter table public.stations
  add column if not exists province text,
  add column if not exists municipality text;

update public.stations
set
  province = case
    when city = 'Maputo' then 'Cidade de Maputo'
    when city = 'Matola' then 'Maputo'
    else coalesce(province, 'Cidade de Maputo')
  end,
  municipality = case
    when city = 'Maputo' then 'Maputo'
    when city = 'Matola' then 'Matola'
    else coalesce(municipality, 'Maputo')
  end
where province is null or municipality is null;

alter table public.stations
  alter column province set not null,
  alter column municipality set not null;

alter table public.alerts
  add column if not exists province text;

update public.alerts
set province = case
  when city = 'Maputo' then 'Cidade de Maputo'
  when city = 'Matola' then 'Maputo'
  else coalesce(province, 'Cidade de Maputo')
end
where province is null and city is not null;

alter table public.stations drop column if exists city;
alter table public.alerts drop column if exists city;

drop type if exists city_name;

create or replace view public.stations_with_current_status as
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
