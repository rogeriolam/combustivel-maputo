"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [message, setMessage] = useState("A concluir o login...");

  useEffect(() => {
    async function finishOAuth() {
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? "/profile";

      if (!supabase) {
        setMessage("Supabase não está configurado nesta sessão.");
        return;
      }

      if (!code) {
        setMessage("Código de autenticação em falta.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        setMessage(`Falha no login: ${error.message}`);
        return;
      }

      router.replace(next);
      router.refresh();
    }

    finishOAuth();
  }, [router, searchParams, supabase]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        textAlign: "center"
      }}
    >
      <div>
        <p style={{ margin: 0, fontWeight: 700 }}>Combustível Maputo</p>
        <h1 style={{ marginBottom: 8 }}>A processar autenticação</h1>
        <p style={{ margin: 0 }}>{message}</p>
      </div>
    </main>
  );
}
