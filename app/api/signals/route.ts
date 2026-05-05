import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type CreateSignalBody = {
  stationId?: string;
  fuelType?: "gasoline" | "diesel";
  option?: "available" | "unavailable";
  queueStatus?: "none" | "short" | "long" | null;
  updates?: Array<{
    fuelType: "gasoline" | "diesel";
    option: "available" | "unavailable";
  }>;
  guestReporterKey?: string;
  userLatitude?: number;
  userLongitude?: number;
};

async function getReporterContext() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { supabase: null, profile: null, error: "Supabase não configurado." };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, profile: null, error: null };
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return {
    supabase,
    profile,
    error: null
  };
}

export async function POST(request: Request) {
  const { supabase, profile, error } = await getReporterContext();
  if (!supabase || error) {
    return NextResponse.json({ ok: false, error }, { status: 401 });
  }

  const body = (await request.json()) as CreateSignalBody;
  const stationId = body.stationId?.trim();
  const guestReporterKey = body.guestReporterKey?.trim();
  const userLatitude = Number(body.userLatitude);
  const userLongitude = Number(body.userLongitude);
  const queueStatus = body.queueStatus ?? null;
  const updates =
    body.updates?.length
      ? body.updates
      : body.fuelType && body.option
        ? [{ fuelType: body.fuelType, option: body.option }]
        : [];

  if (!stationId || !updates.length) {
    return NextResponse.json({ ok: false, error: "Faltam dados da sinalização." }, { status: 400 });
  }

  if (queueStatus && !["none", "short", "long"].includes(queueStatus)) {
    return NextResponse.json({ ok: false, error: "Informação de fila inválida." }, { status: 400 });
  }

  if (Number.isNaN(userLatitude) || Number.isNaN(userLongitude)) {
    return NextResponse.json({ ok: false, error: "Localização inválida." }, { status: 400 });
  }

  const rows = updates.map((update) => ({
    station_id: stationId,
    user_id: profile?.id ?? null,
    fuel_type: update.fuelType,
    status_option: update.option,
    queue_status: queueStatus,
    user_latitude: userLatitude,
    user_longitude: userLongitude,
    meta: {
      reporter_name: profile?.full_name ?? "Visitante",
      reporter_email: profile?.email ?? null,
      reporter_kind: profile ? "authenticated" : "guest",
      reporter_key: profile?.id ?? guestReporterKey ?? null
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

  revalidatePath("/map");
  revalidatePath(`/stations/${stationId}`);

  return NextResponse.json({ ok: true });
}
