import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildProfilePayload } from "@/lib/supabase/profile";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") ?? "/profile";
  const next = rawNext.startsWith("/") ? rawNext : "/profile";
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth`);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(`${origin}/auth`);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("profiles").upsert(buildProfilePayload(user), {
      onConflict: "id"
    });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
