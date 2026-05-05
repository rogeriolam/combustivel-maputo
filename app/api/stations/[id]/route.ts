import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { GPS_RADIUS_METERS, provinceOptions } from "@/lib/domain/config";
import { distanceMeters } from "@/lib/domain/logic";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildProfilePayload } from "@/lib/supabase/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type UpdateStationBody = {
  name?: string;
  province?: string;
  municipality?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
};

async function getAuthenticatedProfile() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { profile: null, error: "Supabase não configurado.", status: 500 };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { profile: null, error: "É preciso iniciar sessão para editar uma bomba.", status: 401 };
  }

  const payload = buildProfilePayload(user);
  await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  const { data: profile } = await supabase.from("profiles").select("id,role").eq("id", user.id).single();

  if (profile?.role === "blocked") {
    return { profile: null, error: "Utilizador bloqueado.", status: 403 };
  }

  return { profile: { id: user.id, role: profile?.role ?? payload.role }, error: null, status: 200 };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedProfile();
  if (!auth.profile) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const body = (await request.json()) as UpdateStationBody;
  const name = body.name?.trim();
  const province = body.province?.trim();
  const municipality = body.municipality?.trim();
  const neighborhood = body.neighborhood?.trim();
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  if (!name || !province || !municipality || !neighborhood) {
    return NextResponse.json({ ok: false, error: "Faltam campos obrigatórios da bomba." }, { status: 400 });
  }

  if (!provinceOptions.includes(province as (typeof provinceOptions)[number])) {
    return NextResponse.json({ ok: false, error: "Província inválida." }, { status: 400 });
  }

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return NextResponse.json({ ok: false, error: "Coordenadas inválidas." }, { status: 400 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ ok: false, error: "Cliente administrativo indisponível." }, { status: 500 });
  }

  const { data: currentStation } = await adminClient
    .from("stations")
    .select("id,name,province,municipality,neighborhood,latitude,longitude")
    .eq("id", id)
    .single();

  if (!currentStation) {
    return NextResponse.json({ ok: false, error: "Bomba não encontrada." }, { status: 404 });
  }

  const { data: existingStations, error: stationListError } = await adminClient
    .from("stations")
    .select("id,name,province,municipality,neighborhood,latitude,longitude");

  if (stationListError) {
    return NextResponse.json({ ok: false, error: "Não foi possível validar duplicados." }, { status: 500 });
  }

  const duplicate = existingStations?.find(
    (station) => station.id !== id && distanceMeters(latitude, longitude, station.latitude, station.longitude) <= GPS_RADIUS_METERS
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

  const nextStation = {
    name,
    province,
    municipality,
    neighborhood,
    latitude,
    longitude
  };

  const { error: updateError } = await adminClient
    .from("stations")
    .update(nextStation)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ ok: false, error: "Não foi possível actualizar a bomba." }, { status: 400 });
  }

  revalidatePath("/map");
  revalidatePath(`/stations/${id}`);

  await adminClient.from("admin_actions").insert({
    actor_id: auth.profile.id,
    action_type: "station_update",
    target_station_id: id,
    payload: {
      before: currentStation,
      after: nextStation,
      actor_role: auth.profile.role
    }
  });

  return NextResponse.json({ ok: true });
}
