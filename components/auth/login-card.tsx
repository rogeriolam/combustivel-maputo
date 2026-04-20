"use client";

import { Mail, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";

export function LoginCard({
  compact = false,
  next = "/profile"
}: {
  compact?: boolean;
  next?: string;
}) {
  const supabase = createSupabaseBrowserClient();

  async function handleOAuth(provider: "google" | "apple") {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    });
  }

  async function handleEmailLogin(formData: FormData) {
    if (!supabase) return;
    const email = String(formData.get("email") ?? "");
    if (!email) return;

    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      }
    });
  }

  return (
    <Card className="stack">
      <div className="section-heading">
        <h2>{compact ? "Entrar ou registar" : "Entrar"}</h2>
        <p>
          {compact
            ? "Podes continuar como visitante, ou entrar com Google ou e-mail para guardar histórico e criar bombas e alertas."
            : "Associamos cada sinalização ao utilizador autenticado para guardar histórico e contribuições."}
        </p>
      </div>
      <button className="primary-button" type="button" onClick={() => handleOAuth("google")}>
        Entrar com Google
      </button>
      <form action={handleEmailLogin} className="stack">
        <label className="field">
          <span>E-mail</span>
          <div className="input-with-icon">
            <Mail size={16} />
            <input name="email" placeholder="nome@exemplo.com" type="email" required />
          </div>
        </label>
        <button className="secondary-button" type="submit">
          Receber link mágico
        </button>
      </form>
      <div className="info-strip">
        <ShieldCheck size={16} />
        <span>Apenas utilizadores próximos da bomba podem sinalizar ou criar novas bombas.</span>
      </div>
    </Card>
  );
}
