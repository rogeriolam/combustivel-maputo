import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowRight, Fuel, MapPinned, ShieldCheck, Users } from "lucide-react";
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

  async function skipLandingAction() {
    "use server";

    const actionCookies = await cookies();
    actionCookies.set(SKIP_LANDING_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    });

    redirect("/map");
  }

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
            <h1>Descobre quais bombas têm combustível em Moçambique e ajuda a comunidade com informação útil.</h1>
            <p className="hero-text">
              A app nasceu num contexto nacional de escassez, em que encontrar Gasolina ou Diesel pode significar
              perder horas, quilómetros e oportunidades. O mapa ajuda a ver rapidamente o estado das bombas, mas só
              funciona bem quando as pessoas partilham observações reais no local.
            </p>
            <div className="hero-cta-row">
              <Link className="primary-button" href="/map">
                Abrir mapa público
                <ArrowRight size={18} />
              </Link>
              <Link className="secondary-button" href="/auth">
                Entrar para contribuir
              </Link>
            </div>
            <form action={skipLandingAction} className="hero-skip-form">
              <button className="ghost-button" type="submit">
                Não mostrar novamente
              </button>
            </form>
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
            <div className="hero-panel-map">
              <div className="map-swatch map-swatch-available">Tem</div>
              <div className="map-swatch map-swatch-conflict">Em conflito</div>
              <div className="map-swatch map-swatch-unavailable">Não tem</div>
            </div>
            <div className="stack">
              <div className="section-heading">
                <h2>Como funciona</h2>
            <p>Leitura pública, contribuição opcional com conta.</p>
              </div>
              <div className="landing-list">
                <div>
                  <strong>1. Ver mapa</strong>
                  <p>Qualquer pessoa pode consultar o estado das bombas no país sem criar conta.</p>
                </div>
                <div>
                  <strong>2. Entrar para contribuir</strong>
                  <p>Login por Google ou e-mail para sinalizar combustível, criar bombas e guardar histórico.</p>
                </div>
                <div>
                  <strong>3. Confirmar no local</strong>
                  <p>A app só aceita contribuições quando a pessoa está perto da bomba.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2>Porque esta app importa</h2>
          <p>
            Em períodos de escassez, a informação certa no momento certo poupa tempo, deslocações e filas
            desnecessárias.
          </p>
        </div>
        <div className="landing-card-grid">
          <Card>
            <div className="icon-badge">
              <MapPinned size={20} />
            </div>
            <h3>Mapa público e rápido</h3>
            <p>Consulta imediata de bombas em várias províncias, com leitura simples por combustível e estado.</p>
          </Card>
          <Card>
            <div className="icon-badge">
              <Users size={20} />
            </div>
            <h3>Informação comunitária</h3>
            <p>O valor da app cresce quando mais pessoas registam o que viram no local.</p>
          </Card>
          <Card>
            <div className="icon-badge">
              <ShieldCheck size={20} />
            </div>
            <h3>Confiança nos dados</h3>
            <p>As leituras usam janela de 3 horas, maioria simples e validação por GPS para reduzir ruído.</p>
          </Card>
        </div>
      </section>

      <section className="landing-section">
        <Card className="community-card">
          <div className="community-copy">
            <p className="eyebrow">Importante</p>
            <h2>A app só funciona se for alimentada pela comunidade.</h2>
            <p>
              Se ninguém actualizar, o mapa perde utilidade. Se cada pessoa que passa por uma bomba registar o que viu,
              a cidade ganha uma ferramenta realmente útil.
            </p>
          </div>
          <div className="community-actions">
            <Link className="primary-button" href="/auth">
              Criar conta e contribuir
            </Link>
            <Link className="ghost-button" href="/map">
              Continuar como visitante
            </Link>
          </div>
        </Card>
      </section>
    </main>
  );
}
