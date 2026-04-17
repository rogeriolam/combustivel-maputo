import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LoginCard } from "@/components/auth/login-card";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { getAlerts, getCurrentUserProfile } from "@/lib/supabase/repository";

export default async function ProfilePage() {
  const [profile, alerts] = await Promise.all([getCurrentUserProfile(), getAlerts()]);
  const isAuthenticated = Boolean(profile);
  const currentProfile = profile;

  return (
    <AppShell currentPath="/profile">
      <div className="page">
        <PageHeader
          title="Perfil"
          subtitle={
            isAuthenticated
              ? "Reputação simples no MVP, preparada para ponderação futura das sinalizações."
              : "Podes usar a app como visitante. O login por Google ou e-mail é opcional e útil para histórico, alertas e contribuições associadas à tua conta."
          }
        />
        {isAuthenticated && currentProfile ? (
          <>
            <Card>
              <div className="section-heading">
                <h2>{currentProfile.fullName}</h2>
                <p>{currentProfile.email}</p>
              </div>
              <div className="stats-grid">
                <div>
                  <strong>{currentProfile.reputationScore}</strong>
                  <span>Pontuação</span>
                </div>
                <div>
                  <strong>{currentProfile.reputationWeight}x</strong>
                  <span>Peso actual</span>
                </div>
                <div>
                  <strong>{alerts.length}</strong>
                  <span>Alertas activos</span>
                </div>
              </div>
              <p className="muted">
                Sessão activa. As tuas contribuições podem ficar associadas à tua conta e evoluir em reputação.
              </p>
              <div style={{ marginTop: 16 }}>
                <LogoutButton />
              </div>
            </Card>
            <Card>
              <div className="section-heading">
                <h2>Como a reputação evolui</h2>
                <p>
                  O sistema já guarda o peso aplicado em cada sinalização, permitindo migrar facilmente para cálculos
                  totalmente ponderados sem mexer na experiência do utilizador.
                </p>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <div className="section-heading">
                <h2>Modo visitante</h2>
                <p>Estás a usar a app sem autenticação. Podes consultar o mapa anonimamente.</p>
              </div>
              <div className="stats-grid">
                <div>
                  <strong>Mapa</strong>
                  <span>Acesso livre</span>
                </div>
                <div>
                  <strong>Login</strong>
                  <span>Opcional</span>
                </div>
                <div>
                  <strong>Histórico</strong>
                  <span>Disponível após login</span>
                </div>
              </div>
              <p className="muted">
                Entra com Google ou e-mail se quiseres associar actualizações à tua conta, gerir alertas e ter um
                histórico pessoal.
              </p>
            </Card>
            <LoginCard compact />
          </>
        )}
      </div>
    </AppShell>
  );
}
