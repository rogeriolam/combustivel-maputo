import { NextResponse } from "next/server";
import { GPS_RADIUS_METERS } from "@/lib/domain/config";
import { distanceMeters } from "@/lib/domain/logic";
import { buildProfilePayload } from "@/lib/supabase/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CreateStationBody = {
  name?: string;
  province?: string;
  municipality?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  initialSignals?: {
    gasoline?: "available" | "unavailable";
    diesel?: "available" | "unavailable";
  };
};

async function getOrCreateProfile() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { supabase: null, profile: null, error: "Supabase não configurado." };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, profile: null, error: "É preciso iniciar sessão para criar uma bomba." };
  }

  const payload = buildProfilePayload(user);
  await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  return {
    supabase,
    profile: payload,
    error: null
  };
}

export async function POST(request: Request) {
  const { supabase, profile, error } = await getOrCreateProfile();
  if (!supabase || !profile || error) {
    return NextResponse.json({ ok: false, error }, { status: 401 });
  }

  const body = (await request.json()) as CreateStationBody;
  const name = body.name?.trim();
  const province = body.province?.trim();
  const municipality = body.municipality?.trim();
  const neighborhood = body.neighborhood?.trim();
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  if (!name || !province || !municipality || !neighborhood) {
    return NextResponse.json({ ok: false, error: "Faltam campos obrigatórios da bomba." }, { status: 400 });
  }

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json({ ok: false, error: "Coordenadas inválidas." }, { status: 400 });
  }

  const { data: existingStations, error: stationsError } = await supabase
    .from("stations")
    .select("id,name,province,municipality,neighborhood,latitude,longitude");

  if (stationsError) {
    return NextResponse.json({ ok: false, error: "Não foi possível validar duplicados." }, { status: 500 });
  }

  const duplicate = existingStations?.find(
    (station) => distanceMeters(latitude, longitude, station.latitude, station.longitude) <= GPS_RADIUS_METERS
  );

  if (duplicate) {
    return NextResponse.json(
      {
        ok: false,
        error: `Já existe uma bomba próxima: ${duplicate.name} · ${duplicate.neighborhood}, ${duplicate.municipality}, ${duplicate.province}.`
      },
      { status: 409 }
    );
  }

  const { data: station, error: insertError } = await supabase
    .from("stations")
    .insert({
      name,
      province,
      municipality,
      neighborhood,
      latitude,
      longitude,
      created_by: profile.id
    })
    .select("id")
    .single();

  if (insertError || !station) {
    return NextResponse.json(
      {
        ok: false,
        error:
          insertError?.message === 'Já existe uma bomba registada a menos de 100 metros.'
            ? insertError.message
            : "Não foi possível criar a bomba."
      },
      { status: 400 }
    );
  }

  const signalRows = [
    body.initialSignals?.gasoline
      ? {
          station_id: station.id,
          user_id: profile.id,
          fuel_type: "gasoline",
          status_option: body.initialSignals.gasoline,
          user_latitude: latitude,
          user_longitude: longitude
        }
      : null,
    body.initialSignals?.diesel
      ? {
          station_id: station.id,
          user_id: profile.id,
          fuel_type: "diesel",
          status_option: body.initialSignals.diesel,
          user_latitude: latitude,
          user_longitude: longitude
        }
      : null
  ].filter(Boolean);

  if (signalRows.length) {
    const { error: signalError } = await supabase.from("signals").insert(signalRows);

    if (signalError) {
      return NextResponse.json(
        {
          ok: false,
          error: "A bomba foi criada, mas a primeira sinalização falhou."
        },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ ok: true, stationId: station.id });
}
