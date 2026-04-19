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
          subtitle="Consulta rapidamente onde há combustível e abre o detalhe de cada bomba para ver estado, confiança e histórico recente."
        />
        <section className="map-overview-card">
          <div className="map-overview-copy">
            <span className="overview-kicker">Leitura pública</span>
            <h2>Vê o mapa primeiro, contribui depois</h2>
            <p>
              A comunidade alimenta o estado das bombas. Usa os filtros para afinar a zona e toca numa bomba para ver
              detalhe, histórico e a última actualização válida.
            </p>
          </div>
          <div className="map-overview-stats">
            <div className="overview-pill">
              <strong>{stations.length}</strong>
              <span>bombas na vista actual</span>
            </div>
            <div className="overview-pill">
              <strong>{filters.province === "all" ? "País" : filters.province}</strong>
              <span>zona activa</span>
            </div>
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
        <MapLegend />
        <section className="stack">
          <div className="section-heading">
            <h2>Bombas no mapa</h2>
            <p>{stations.length} resultados na vista actual.</p>
          </div>
          <StationList stations={stations} isAuthenticated={Boolean(profile)} />
        </section>
      </div>
    </AppShell>
  );
}
