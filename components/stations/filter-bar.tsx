import { FuelStatus, FuelType, StationFilters } from "@/lib/domain/types";

export function FilterBar({
  filters
}: {
  filters: StationFilters;
}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);

  const linkFor = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    return `/map?${next.toString()}`;
  };

  const cityValues = ["all", "Maputo", "Matola"] as const;
  const fuelValues: Array<"all" | FuelType> = ["all", "gasoline", "diesel"];
  const statusValues: Array<"all" | FuelStatus> = ["all", "available", "unavailable", "conflict", "unknown"];

  return (
    <div className="filter-bar">
      <div className="chip-row">
        {cityValues.map((city) => (
          <a
            key={city}
            href={linkFor("city", city)}
            className={`chip ${filters.city === city || (!filters.city && city === "all") ? "is-active" : ""}`}
          >
            {city === "all" ? "Toda a área" : city}
          </a>
        ))}
      </div>
      <div className="chip-row">
        {fuelValues.map((fuel) => (
          <a
            key={fuel}
            href={linkFor("fuel", fuel)}
            className={`chip ${filters.fuelType === fuel || (!filters.fuelType && fuel === "all") ? "is-active" : ""}`}
          >
            {fuel === "all" ? "Todos os combustíveis" : fuel === "gasoline" ? "Gasolina" : "Diesel"}
          </a>
        ))}
      </div>
      <div className="chip-row">
        {statusValues.map((status) => (
          <a
            key={status}
            href={linkFor("status", status)}
            className={`chip ${filters.status === status || (!filters.status && status === "all") ? "is-active" : ""}`}
          >
            {status === "all"
              ? "Todos os estados"
              : status === "available"
                ? "Tem"
                : status === "unavailable"
                  ? "Não tem"
                  : status === "conflict"
                    ? "Em conflito"
                    : "Sem informação"}
          </a>
        ))}
      </div>
    </div>
  );
}
