"use client";

import L from "leaflet";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import { MAPUTO_CENTER, provinceMapView, statusColors, statusLabels } from "@/lib/domain/config";
import { Province, Station } from "@/lib/domain/types";

const defaultIcon = L.divIcon({
  className: "fuel-marker",
  html: `<div class="fuel-marker-pin"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
  popupAnchor: [0, -20]
});

function markerIcon(color: string) {
  return L.divIcon({
    className: "fuel-marker",
    html: `<div class="fuel-marker-pin" style="background:${color}"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -20]
  });
}

function ProvinceViewport({ selectedProvince }: { selectedProvince?: Province | "all" }) {
  const map = useMap();

  useEffect(() => {
    if (!selectedProvince || selectedProvince === "all") {
      map.setView([MAPUTO_CENTER.latitude, MAPUTO_CENTER.longitude], MAPUTO_CENTER.zoom);
      return;
    }

    const nextView = provinceMapView[selectedProvince];

    if (nextView) {
      map.setView([nextView.latitude, nextView.longitude], nextView.zoom, {
        animate: true
      });
    }
  }, [map, selectedProvince]);

  return null;
}

export default function LeafletMapCanvas({
  stations,
  selectedProvince
}: {
  stations: Station[];
  selectedProvince?: Province | "all";
}) {
  const [selectedId, setSelectedId] = useState<string | null>(stations[0]?.id ?? null);

  const selected = useMemo(
    () => stations.find((station) => station.id === selectedId) ?? null,
    [selectedId, stations]
  );

  return (
    <MapContainer
      center={[MAPUTO_CENTER.latitude, MAPUTO_CENTER.longitude]}
      zoom={MAPUTO_CENTER.zoom}
      zoomControl={false}
      scrollWheelZoom
      style={{ width: "100%", height: "100%" }}
    >
      <ZoomControl position="topright" />
      <ProvinceViewport selectedProvince={selectedProvince} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={markerIcon(statusColors[station.gasoline.status]) || defaultIcon}
          eventHandlers={{
            click: () => setSelectedId(station.id)
          }}
        >
          {selected?.id === station.id ? (
            <Popup>
              <div className="popup-content">
                <strong>{station.name}</strong>
                <span>
                  {station.neighborhood}, {station.municipality}, {station.province}
                </span>
                <span>
                  Gasolina: {statusLabels[station.gasoline.status]} · Diesel: {statusLabels[station.diesel.status]}
                </span>
                <span title="Última actualização recente considerada para o estado">
                  Última actualização:{" "}
                  {station.gasoline.lastUpdatedAt || station.diesel.lastUpdatedAt
                    ? format(
                        new Date(
                          [station.gasoline.lastUpdatedAt, station.diesel.lastUpdatedAt]
                            .filter(Boolean)
                            .sort()
                            .at(-1) as string
                        ),
                        "dd MMM yyyy, HH:mm",
                        { locale: ptBR }
                      )
                    : "sem registos"}
                </span>
                <Link href={`/stations/${station.id}`}>Ver detalhe</Link>
              </div>
            </Popup>
          ) : null}
        </Marker>
      ))}
    </MapContainer>
  );
}
