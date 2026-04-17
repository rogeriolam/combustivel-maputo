import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppShell } from "@/components/layout/app-shell";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { FuelStatusCard } from "@/components/stations/fuel-status-card";
import { ReportForm } from "@/components/stations/report-form";
import { getCurrentUserProfile, getSignalsForStation, getStationById } from "@/lib/supabase/repository";

export default async function StationDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const station = await getStationById(id);
  if (!station) notFound();

  const [signals, profile] = await Promise.all([getSignalsForStation(id), getCurrentUserProfile()]);
  const isAuthenticated = Boolean(profile);

  return (
    <AppShell currentPath="/map">
      <div className="page">
        <PageHeader
          backHref="/map"
          title={station.name}
          subtitle={`${station.neighborhood}, ${station.city}`}
        />
        <div className="stack">
          <FuelStatusCard aggregate={station.gasoline} />
          <FuelStatusCard aggregate={station.diesel} />
          <Card>
            <div className="section-heading">
              <h2>Confiança e leitura do estado</h2>
              <p>
                Tem: maioria recente com pelo menos 60%. Não tem: maioria recente com pelo menos 60%.
                Em conflito: sinais contraditórios sem maioria. Sem informação: menos de 2 sinais válidos.
              </p>
            </div>
          </Card>
          <Card>
            <div className="section-heading">
              <h2>Histórico recente</h2>
              <p>Guardamos todo o histórico, mas apenas as últimas 3 horas influenciam o estado actual.</p>
            </div>
            <div className="history-list">
              {signals.map((signal) => (
                <div className="history-row" key={signal.id}>
                  <strong>
                    {signal.fuelType === "gasoline" ? "Gasolina" : "Diesel"} ·{" "}
                    {signal.option === "available" ? "Tem" : "Não tem"}
                  </strong>
                  <span>
                    {format(new Date(signal.createdAt), "dd MMM yyyy, HH:mm", { locale: ptBR })} ·{" "}
                    {Math.round(signal.distanceMeters)}m
                  </span>
                </div>
              ))}
            </div>
          </Card>
          {isAuthenticated ? (
            <Card>
              <ReportForm station={station} />
            </Card>
          ) : (
            <AuthRequiredCard
              title="Entrar para actualizar esta bomba"
              body="A leitura do estado é pública, mas novas sinalizações só podem ser feitas por utilizadores autenticados e fisicamente próximos da bomba."
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
