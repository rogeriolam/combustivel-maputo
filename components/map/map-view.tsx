"use client";

import dynamic from "next/dynamic";
import { Station, StationFilters } from "@/lib/domain/types";

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="map-fallback">
      <p>A carregar mapa nacional...</p>
    </div>
  )
});

export function MapView({
  stations,
  filters
}: {
  stations: Station[];
  filters?: StationFilters;
}) {
  return (
    <div className="map-frame">
      <LeafletMap stations={stations} selectedProvince={filters?.province} />
    </div>
  );
}
