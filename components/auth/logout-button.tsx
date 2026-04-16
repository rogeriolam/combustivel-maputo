"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const supabase = createSupabaseBrowserClient();

  async function handleLogout() {
    await supabase?.auth.signOut();
    window.location.href = "/";
  }

  return (
    <button className="secondary-button" type="button" onClick={handleLogout}>
      Terminar sessão
    </button>
  );
}
