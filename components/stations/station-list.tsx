import Link from "next/link";
import { Station } from "@/lib/domain/types";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

export function StationList({ stations }: { stations: Station[] }) {
  return (
    <div className="stack">
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
