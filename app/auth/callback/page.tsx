"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { buildProfilePayload } from "@/lib/supabase/profile";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [message, setMessage] = useState("A concluir o login...");

  useEffect(() => {
    async function finishOAuth() {
      const code = searchParams.get("code");
      const next = (searchParams.get("next") ?? "/profile") as Route;

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

      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Login concluído, mas não foi possível obter a sessão do utilizador.");
        return;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(buildProfilePayload(user), {
        onConflict: "id"
      });

      if (profileError) {
        setMessage(`Sessão criada, mas houve falha ao criar o perfil: ${profileError.message}`);
        return;
      }

      setMessage("Login concluído. A redireccionar...");
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

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
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
            <p style={{ margin: 0 }}>A preparar a sessão...</p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
