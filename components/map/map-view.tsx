"use client";

import dynamic from "next/dynamic";
import { Station } from "@/lib/domain/types";

const LeafletMap = dynamic(() => import("@/components/map/leaflet-map-canvas"), {
  ssr: false,
  loading: () => (
    <div className="map-fallback">
      <p>A carregar mapa nacional...</p>
    </div>
  )
});

export function MapView({ stations }: { stations: Station[] }) {
  return (
    <div className="map-frame">
      <LeafletMap stations={stations} />
    </div>
  );
}
