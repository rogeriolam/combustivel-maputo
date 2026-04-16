import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { getDashboardSummary, getStations } from "@/lib/supabase/repository";

export default async function DashboardPage() {
  const [summary, stations] = await Promise.all([getDashboardSummary(), getStations()]);

  return (
    <AppShell currentPath="/dashboard">
      <div className="page">
        <PageHeader
          title="Dashboard"
          subtitle="Leitura rápida das bombas registadas e do estado actual por combustível."
        />
        <div className="metric-grid">
          <Card>
            <strong>{summary.totalStations}</strong>
            <span>Total de bombas</span>
          </Card>
          <Card>
            <strong>{summary.gasolineAvailable}</strong>
            <span>Gasolina = Tem</span>
          </Card>
          <Card>
            <strong>{summary.gasolineUnavailable}</strong>
            <span>Gasolina = Não tem</span>
          </Card>
          <Card>
            <strong>{summary.dieselAvailable}</strong>
            <span>Diesel = Tem</span>
          </Card>
          <Card>
            <strong>{summary.dieselUnavailable}</strong>
            <span>Diesel = Não tem</span>
          </Card>
          <Card>
            <strong>{summary.conflict}</strong>
            <span>Em conflito</span>
          </Card>
          <Card>
            <strong>{summary.unknown}</strong>
            <span>Sem informação recente</span>
          </Card>
        </div>
        <Card>
          <div className="section-heading">
            <h2>Vista rápida por bomba</h2>
            <p>Preparado para filtros por cidade, combustível e estado directamente a partir de query params.</p>
          </div>
          <div className="history-list">
            {stations.map((station) => (
              <div className="history-row" key={station.id}>
                <strong>{station.name}</strong>
                <span>
                  <StatusBadge status={station.gasoline.status} /> <StatusBadge status={station.diesel.status} />
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
