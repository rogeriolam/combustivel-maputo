import { NextResponse } from "next/server";

const SKIP_LANDING_COOKIE = "cm_skip_landing";

export async function POST() {
  const response = NextResponse.redirect(new URL("/map", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));

  response.cookies.set(SKIP_LANDING_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  return response;
}
