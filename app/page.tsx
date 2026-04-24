import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, Fuel, MapPinned, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCurrentUserProfile, getStations } from "@/lib/supabase/repository";

const SKIP_LANDING_COOKIE = "cm_skip_landing";

type LandingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LandingPage({ searchParams }: LandingPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const forceLanding = resolvedSearchParams.landing === "1";
  const cookieStore = await cookies();

  if (!forceLanding && cookieStore.get(SKIP_LANDING_COOKIE)?.value === "1") {
    redirect("/map");
  }

  const [profile, stations] = await Promise.all([getCurrentUserProfile(), getStations()]);

  return (
    <main className="landing">
      <section className="hero-shell">
        <div className="hero-topbar">
          <p className="brand-mark">Combustível Moçambique</p>
          <div className="hero-actions">
            <Link className="ghost-button" href="/map">
              Ver mapa
            </Link>
            <Link className="primary-button" href={profile ? "/profile" : "/auth"}>
              {profile ? "Abrir perfil" : "Entrar"}
            </Link>
          </div>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Crise de combustível em Moçambique</p>
            <h1>Descobre rapidamente quais bombas têm combustível.</h1>
            <p className="hero-text">
              A comunidade actualiza o estado das bombas em tempo quase real. O mapa mostra o que as pessoas viram no
              local e ajuda a evitar deslocações e filas desnecessárias.
            </p>
            <div className="hero-cta-row">
              <Link className="primary-button" href="/map">
                Ver mapa
                <ArrowRight size={18} />
              </Link>
              <Link className="secondary-button" href="/auth">
                Entrar
              </Link>
            </div>
            <div className="hero-pill-row">
              <span className="hero-pill">
                <MapPinned size={16} />
                {stations.length} bombas visíveis
              </span>
              <span className="hero-pill">
                <Fuel size={16} />
                Gasolina e Diesel
              </span>
              <span className="hero-pill">
                <ShieldCheck size={16} />
                Validação por proximidade GPS
              </span>
            </div>
          </div>

          <Card className="hero-panel">
            <p className="eyebrow">Leitura pública</p>
            <h2>A informação melhora à medida que mais pessoas sinalizam no local.</h2>
            <p className="hero-text compact-copy">
              Qualquer pessoa pode consultar o mapa. Quem entra pode criar bombas, guardar alertas e contribuir com
              histórico associado à conta.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
