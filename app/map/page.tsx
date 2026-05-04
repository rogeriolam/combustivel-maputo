import { unstable_noStore as noStore } from "next/cache";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { FilterBar } from "@/components/stations/filter-bar";
import { StationList } from "@/components/stations/station-list";
import { MapLegend } from "@/components/map/map-legend";
import { MapView } from "@/components/map/map-view";
import { getCurrentUserProfile, getStations } from "@/lib/supabase/repository";
import { StationFilters } from "@/lib/domain/types";

export default async function MapPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  noStore();
  const params = await searchParams;
  const filters: StationFilters = {
    search: typeof params.search === "string" ? params.search : undefined,
    province: typeof params.province === "string" ? (params.province as StationFilters["province"]) : "all",
    fuelType: typeof params.fuel === "string" ? (params.fuel as StationFilters["fuelType"]) : "all",
    status: typeof params.status === "string" ? (params.status as StationFilters["status"]) : "all"
  };

  const [stations, profile] = await Promise.all([getStations(filters), getCurrentUserProfile()]);

  return (
    <AppShell currentPath="/map">
      <div className="page">
        <PageHeader
          title="Mapa em tempo quase real"
          subtitle="Consulta rapidamente o estado das bombas e abre o detalhe para sinalizar no local."
        />
        <section className="map-toolbar">
          <span className="overview-kicker">Leitura pública</span>
          <div className="map-toolbar-meta">
            <strong>{stations.length} bombas</strong>
            <span>{filters.province === "all" ? "Todo o país" : filters.province}</span>
          </div>
        </section>
        <form className="search-bar">
          <input
            defaultValue={filters.search}
            name="search"
            placeholder="Pesquisar por nome da bomba"
            type="search"
          />
          <button className="primary-button" type="submit">
            Procurar
          </button>
        </form>
        <FilterBar filters={filters} />
        <MapView stations={stations} filters={filters} />
        <StationList stations={stations} isAuthenticated={Boolean(profile)} />
        <MapLegend />
      </div>
    </AppShell>
  );
}
