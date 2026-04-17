import Link from "next/link";
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
            <p>Sinaliza o combustível que viste junto de uma bomba.</p>
          </div>
          <Link href="/auth" className="primary-button">
            Entrar para sinalizar
          </Link>
        </Card>
      ) : (
        <Card className="action-card">
          <div className="section-heading">
            <h3>Pronto para contribuir</h3>
            <p>Clica numa bomba abaixo para sinalizar combustível.</p>
          </div>
        </Card>
      )}
      {stations.map((station) => (
        <Link href={`/stations/${station.id}`} key={station.id}>
          <Card className="station-card">
            <div className="section-heading">
              <div>
                <h3>{station.name}</h3>
                <p>
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
          </Card>
        </Link>
      ))}
    </div>
  );
}
