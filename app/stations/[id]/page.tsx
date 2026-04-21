import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
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
          <FuelStatusCard aggregate={station.gasoline} />
          <FuelStatusCard aggregate={station.diesel} />
          <Card>
            <div className="section-heading">
              <h2>Como funciona</h2>
              <p>
                O estado público olha apenas para as últimas 3 horas e usa a observação mais recente de cada pessoa
                para Gasolina e Diesel.
              </p>
            </div>
            <div className="landing-list">
              <div>
                <strong>Tem / Não tem</strong>
                <p>Já existem pessoas recentes suficientes e a maioria aponta para o mesmo resultado.</p>
              </div>
              <div>
                <strong>Em conflito</strong>
                <p>Já há pessoas suficientes, mas as observações recentes dizem coisas diferentes.</p>
              </div>
              <div>
                <strong>A aguardar mais sinais</strong>
                <p>Ainda faltam mais observações recentes para mostrar um estado público útil.</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="section-heading">
              <h2>Histórico recente da bomba</h2>
              <p>
                Guardamos utilizador, data e hora de cada sinalização. Apenas as últimas 3 horas influenciam o estado
                actual.
              </p>
            </div>
            <div className="history-list">
              {signals.map((signal) => (
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
          </Card>
          <Card>
            <ReportForm station={station} isAuthenticated={isAuthenticated} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
