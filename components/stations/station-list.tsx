import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Station } from "@/lib/domain/types";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

export function StationList({
  stations,
  isAuthenticated
}: {
  stations: Station[];
  isAuthenticated: boolean;
}) {
  return (
    <div className="stack">
      {!isAuthenticated ? (
        <Card className="action-card">
          <div className="section-heading">
            <h3>Quer contribuir?</h3>
            <p>Sinaliza o que viste numa bomba. Entrar só é preciso para criar bombas e alertas.</p>
          </div>
          <Link href="/auth" className="primary-button">
            Entrar para criar bombas e alertas
          </Link>
        </Card>
      ) : (
        <Card className="action-card">
          <div className="section-heading">
            <h3>Pronto para contribuir</h3>
            <p>Toca numa bomba abaixo para sinalizar rapidamente.</p>
          </div>
        </Card>
      )}
      {stations.map((station) => (
        <Link href={`/stations/${station.id}`} key={station.id}>
          <Card className="station-card">
            <div className="station-card-top">
              <div className="station-card-copy">
                <span className="station-card-label">Bomba</span>
                <h3>{station.name}</h3>
                <p className="station-card-location">
                  {station.neighborhood}, {station.municipality}, {station.province}
                </p>
              </div>
              <span className="distance-pill">{station.province}</span>
            </div>
            <div className="status-row">
              <div>
                <span className="label">Gasolina</span>
                <StatusBadge status={station.gasoline.status} />
              </div>
              <div>
                <span className="label">Diesel</span>
                <StatusBadge status={station.diesel.status} />
              </div>
            </div>
            <div className="station-card-footer">
              <span className="microcopy">Abrir detalhe para ver histórico e sinalizar.</span>
              <span className="station-card-link">
                Ver detalhe <ArrowRight size={16} />
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
