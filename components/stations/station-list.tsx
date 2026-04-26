"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Station } from "@/lib/domain/types";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

const INITIAL_VISIBLE_STATIONS = 8;

export function StationList({
  stations,
  isAuthenticated
}: {
  stations: Station[];
  isAuthenticated: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const hasOverflow = stations.length > INITIAL_VISIBLE_STATIONS;
  const visibleStations = showAll ? stations : stations.slice(0, INITIAL_VISIBLE_STATIONS);

  return (
    <div className="stack">
      <div className="station-list-header">
        <div>
          <p className="eyebrow">Bombas</p>
          <h2>Lista na vista actual</h2>
        </div>
        <span className="badge badge-neutral">{stations.length} resultados</span>
      </div>
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
      {visibleStations.map((station) => (
        <Link href={`/stations/${station.id}`} key={station.id}>
          <Card className="station-card station-card-compact">
            <div className="station-card-top">
              <div className="station-card-copy">
                <h3>{station.name}</h3>
                <p className="station-card-location">
                  {station.neighborhood}, {station.municipality}
                </p>
              </div>
              <span className="distance-pill">{station.province}</span>
            </div>
            <div className="status-row status-row-compact">
              <div>
                <span className="label label-inline">Gasolina</span>
                <StatusBadge status={station.gasoline.status} />
              </div>
              <div>
                <span className="label label-inline">Diesel</span>
                <StatusBadge status={station.diesel.status} />
              </div>
            </div>
            <div className="station-card-footer">
              <span className="microcopy">Histórico e sinalização</span>
              <span className="station-card-link">
                Ver detalhe <ArrowRight size={16} />
              </span>
            </div>
          </Card>
        </Link>
      ))}
      {hasOverflow ? (
        <button
          type="button"
          className="secondary-button station-list-toggle"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? "Mostrar menos" : `Mostrar mais ${stations.length - INITIAL_VISIBLE_STATIONS} bombas`}
        </button>
      ) : null}
    </div>
  );
}
