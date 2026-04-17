import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getAdminMetrics, getCurrentUserProfile, getStations } from "@/lib/supabase/repository";

export default async function AdminPage() {
  const profile = await getCurrentUserProfile();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const [metrics, stations] = await Promise.all([getAdminMetrics(), getStations()]);

  return (
    <AppShell currentPath="/admin">
      <div className="page">
        <PageHeader
          title="Administração"
          subtitle="Ferramentas base para gerir nomes, localizações, abuso, duplicados e histórico."
        />
        <div className="metric-grid">
          <Card>
            <strong>{metrics.totalProfiles}</strong>
            <span>Utilizadores</span>
          </Card>
          <Card>
            <strong>{metrics.recentSignals}</strong>
            <span>Sinalizações</span>
          </Card>
          <Card>
            <strong>{metrics.candidateDuplicates}</strong>
            <span>Duplicados potenciais</span>
          </Card>
          <Card>
            <strong>{metrics.blockedUsers}</strong>
            <span>Bloqueados</span>
          </Card>
        </div>
        <Card>
          <div className="section-heading">
            <h2>Fila de revisão</h2>
            <p>Preparada para editar nome, mover pino, remover spam e fundir duplicados.</p>
          </div>
          <div className="history-list">
            {stations.map((station) => (
              <div className="history-row" key={station.id}>
                <strong>{station.name}</strong>
                <span>
                  {station.isValidated ? "Activo" : "Rever duplicado"} · {station.neighborhood}, {station.city}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
