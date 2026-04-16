import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { getAlerts, getStations } from "@/lib/supabase/repository";
import { fuelLabels } from "@/lib/domain/config";

export default async function AlertsPage() {
  const [alerts, stations] = await Promise.all([getAlerts(), getStations()]);

  return (
    <AppShell currentPath="/alerts">
      <div className="page">
        <PageHeader
          title="Alertas e notificações"
          subtitle="Primeira versão do MVP com preferência por browser notifications e fallback para e-mail."
        />
        <Card>
          <div className="section-heading">
            <h2>Criar alerta</h2>
            <p>
              Estrutura pronta para seguir uma bomba específica ou uma cidade e disparar aviso quando um combustível
              passar a Tem.
            </p>
          </div>
          <form className="stack">
            <label className="field">
              <span>Bomba</span>
              <select defaultValue="">
                <option value="">Escolher bomba</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Combustível</span>
              <select defaultValue="gasoline">
                <option value="gasoline">Gasolina</option>
                <option value="diesel">Diesel</option>
              </select>
            </label>
            <label className="field">
              <span>Canal</span>
              <select defaultValue="browser">
                <option value="browser">Browser notification</option>
                <option value="email">E-mail</option>
              </select>
            </label>
            <button className="primary-button" type="button">
              Guardar alerta
            </button>
          </form>
        </Card>
        <Card>
          <div className="section-heading">
            <h2>Alertas activos</h2>
            <p>O backend fica preparado para um cron simples em Supabase Edge Functions ou Vercel Cron.</p>
          </div>
          <div className="history-list">
            {alerts.map((alert) => (
              <div className="history-row" key={alert.id}>
                <strong>
                  {alert.stationId
                    ? stations.find((station) => station.id === alert.stationId)?.name ?? "Bomba"
                    : alert.city}
                </strong>
                <span>
                  Avisar quando {fuelLabels[alert.fuelType]} tiver stock via {alert.channel}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
