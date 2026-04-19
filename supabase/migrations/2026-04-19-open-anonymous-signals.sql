alter table public.signals
  alter column user_id drop not null;

drop policy if exists "signals_insert_authenticated" on public.signals;

create policy "signals_insert_public" on public.signals
for insert
with check (
  (
    user_id is null
    and gps_validated = false
  )
  or (
    auth.uid() = user_id
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role <> 'blocked'
    )
  )
);

create or replace function public.set_signal_distance_and_validate()
returns trigger
language plpgsql
as $$
declare
  station_geom geography(point, 4326);
begin
  select geom into station_geom from public.stations where id = new.station_id;

  new.distance_meters := round(
    st_distance(
      station_geom,
      st_setsrid(st_makepoint(new.user_longitude, new.user_latitude), 4326)::geography
    )
  );
  new.gps_validated := new.distance_meters <= 100;
  new.reputation_weight :=
    case
      when new.user_id is null then 1.00
      else coalesce((select reputation_weight from public.profiles where id = new.user_id), 1.00)
    end;

  if new.gps_validated is false then
    raise exception 'Sinalização bloqueada: utilizador fora do raio de 100 metros.';
  end if;

  return new;
end;
$$;
