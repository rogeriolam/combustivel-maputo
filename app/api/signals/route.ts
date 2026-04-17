import { NextResponse } from "next/server";
import { buildProfilePayload } from "@/lib/supabase/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CreateSignalBody = {
  stationId?: string;
  fuelType?: "gasoline" | "diesel";
  option?: "available" | "unavailable";
  updates?: Array<{
    fuelType: "gasoline" | "diesel";
    option: "available" | "unavailable";
  }>;
  userLatitude?: number;
  userLongitude?: number;
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
    return { supabase, profile: null, error: "É preciso iniciar sessão para sinalizar." };
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

  const body = (await request.json()) as CreateSignalBody;
  const stationId = body.stationId?.trim();
  const userLatitude = Number(body.userLatitude);
  const userLongitude = Number(body.userLongitude);
  const updates =
    body.updates?.length
      ? body.updates
      : body.fuelType && body.option
        ? [{ fuelType: body.fuelType, option: body.option }]
        : [];

  if (!stationId || !updates.length) {
    return NextResponse.json({ ok: false, error: "Faltam dados da sinalização." }, { status: 400 });
  }

  if (Number.isNaN(userLatitude) || Number.isNaN(userLongitude)) {
    return NextResponse.json({ ok: false, error: "Localização inválida." }, { status: 400 });
  }

  const rows = updates.map((update) => ({
    station_id: stationId,
    user_id: profile.id,
    fuel_type: update.fuelType,
    status_option: update.option,
    user_latitude: userLatitude,
    user_longitude: userLongitude,
    meta: {
      reporter_name: profile.full_name,
      reporter_email: profile.email
    }
  }));

  const { error: insertError } = await supabase.from("signals").insert(rows);

  if (insertError) {
    return NextResponse.json(
      {
        ok: false,
        error: insertError.message || "Não foi possível guardar a sinalização."
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
