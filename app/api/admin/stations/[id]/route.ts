import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function ensureAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, status: 500, error: "Supabase não configurado." };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: "É preciso iniciar sessão." };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    return { ok: false, status: 403, error: "Apenas administradores podem remover bombas." };
  }

  return { ok: true };
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await ensureAdmin();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return NextResponse.json({ ok: false, error: "Cliente administrativo indisponível." }, { status: 500 });
  }

  const { error } = await adminClient.from("stations").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ ok: false, error: "Não foi possível remover a bomba." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
