import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildProfilePayload } from "@/lib/supabase/profile";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase?.auth.exchangeCodeForSession(code);

    const {
      data: { user }
    } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

    if (supabase && user) {
      await supabase.from("profiles").upsert(buildProfilePayload(user), {
        onConflict: "id"
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
