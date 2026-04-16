import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import { getAlerts, getCurrentUserProfile } from "@/lib/supabase/repository";

export default async function ProfilePage() {
  const [profile, alerts] = await Promise.all([getCurrentUserProfile(), getAlerts()]);

  return (
    <AppShell currentPath="/profile">
      <div className="page">
        <PageHeader
          title="Perfil"
          subtitle="Reputação simples no MVP, preparada para ponderação futura das sinalizações."
        />
        <Card>
          <div className="section-heading">
            <h2>{profile?.fullName ?? "Convidado"}</h2>
            <p>{profile?.email ?? "Sem sessão Supabase configurada"}</p>
          </div>
          <div className="stats-grid">
            <div>
              <strong>{profile?.reputationScore ?? 0}</strong>
              <span>Pontuação</span>
            </div>
            <div>
              <strong>{profile?.reputationWeight ?? 1}x</strong>
              <span>Peso actual</span>
            </div>
            <div>
              <strong>{alerts.length}</strong>
              <span>Alertas activos</span>
            </div>
          </div>
          <p className="muted">
            Regra inicial: todos começam com peso base 1. Actividade consistente pode subir para 1.1 ou 1.25.
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
      </div>
    </AppShell>
  );
}
