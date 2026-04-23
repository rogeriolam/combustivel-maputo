import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { PageToast } from "@/components/ui/page-toast";
import { FuelStatusCard } from "@/components/stations/fuel-status-card";
import { ReportForm } from "@/components/stations/report-form";
import { getCurrentUserProfile, getSignalsForStation, getStationById } from "@/lib/supabase/repository";
import { formatMaputoDateTime } from "@/lib/formatting/date";

export default async function StationDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  noStore();
  const { id } = await params;
  const station = await getStationById(id);
  if (!station) notFound();

  const [signals, profile] = await Promise.all([getSignalsForStation(id), getCurrentUserProfile()]);
  const isAuthenticated = Boolean(profile);

  return (
    <AppShell currentPath="/map">
      <div className="page">
        <PageToast />
        <PageHeader
          backHref="/map"
          title={station.name}
          subtitle={`${station.neighborhood}, ${station.municipality}, ${station.province}`}
        />
        <div className="stack">
          <Card className="station-summary-card">
            <div className="station-summary-grid">
              <div>
                <span className="label">Localização</span>
                <strong>
                  {station.neighborhood}, {station.municipality}
                </strong>
                <p className="microcopy">{station.province}</p>
              </div>
              <div>
                <span className="label">Leitura rápida</span>
                <strong>
                  Gasolina: {station.gasoline.status === "available"
                    ? "Tem"
                    : station.gasoline.status === "unavailable"
                      ? "Não tem"
                      : station.gasoline.status === "conflict"
                        ? "Em conflito"
                        : "A aguardar mais sinais"}
                </strong>
                <p className="microcopy">
                  Diesel: {station.diesel.status === "available"
                    ? "Tem"
                    : station.diesel.status === "unavailable"
                      ? "Não tem"
                      : station.diesel.status === "conflict"
                        ? "Em conflito"
                        : "A aguardar mais sinais"}
                </p>
              </div>
            </div>
          </Card>
          <Card className="station-action-card">
            <div className="section-heading compact-heading">
              <h2>Sinalizar agora</h2>
              <p>Indica o que viste nesta bomba para Gasolina e Diesel.</p>
            </div>
            <ReportForm station={station} isAuthenticated={isAuthenticated} />
          </Card>
          <FuelStatusCard aggregate={station.gasoline} />
          <FuelStatusCard aggregate={station.diesel} />
          <Card className="history-card">
            <div className="section-heading compact-heading">
              <h2>Histórico recente</h2>
              <p>As últimas 3 horas influenciam o estado actual.</p>
            </div>
            <div className="history-list">
              {signals.slice(0, 8).map((signal) => (
                <div className="history-row" key={signal.id}>
                  <div>
                    <strong>
                      {signal.fuelType === "gasoline" ? "Gasolina" : "Diesel"} ·{" "}
                      {signal.option === "available" ? "Tem" : "Não tem"}
                    </strong>
                    <span>
                      {signal.userName ?? signal.userEmail ?? "Utilizador"} · {formatMaputoDateTime(signal.createdAt)} ·{" "}
                      {Math.round(signal.distanceMeters)}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {signals.length > 8 ? (
              <p className="microcopy">Mostramos as 8 observações mais recentes nesta bomba.</p>
            ) : null}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
