"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { provinceOptions } from "@/lib/domain/config";
import { FuelStatus, FuelType, StationFilters } from "@/lib/domain/types";

export function FilterBar({
  filters
}: {
  filters: StationFilters;
}) {
  const hasActiveFilters =
    (filters.province && filters.province !== "all") ||
    (filters.fuelType && filters.fuelType !== "all") ||
    (filters.status && filters.status !== "all");
  const [isOpen, setIsOpen] = useState(Boolean(hasActiveFilters));
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);

  const linkFor = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    return `/map?${next.toString()}`;
  };

  const provinceValues = ["all", ...provinceOptions] as const;
  const fuelValues: Array<"all" | FuelType> = ["all", "gasoline", "diesel"];
  const statusValues: Array<"all" | FuelStatus> = ["all", "available", "unavailable", "conflict", "unknown"];

  return (
    <div className="filter-panel">
      <details open={isOpen} onToggle={(event) => setIsOpen((event.currentTarget as HTMLDetailsElement).open)}>
        <summary className="filter-toggle">
          <span>Filtros</span>
          <span className="filter-toggle-meta">
            {hasActiveFilters ? "Activos" : "Todos"}
            <ChevronDown size={16} />
          </span>
        </summary>
        <div className="filter-groups">
          <section className="filter-group">
            <span className="label">Província</span>
            <div className="chip-row">
              {provinceValues.map((province) => (
                <a
                  key={province}
                  href={linkFor("province", province)}
                  className={`chip ${filters.province === province || (!filters.province && province === "all") ? "is-active" : ""}`}
                >
                  {province === "all" ? "Todo o país" : province}
                </a>
              ))}
            </div>
          </section>
          <section className="filter-group">
            <span className="label">Combustível</span>
            <div className="chip-row">
              {fuelValues.map((fuel) => (
                <a
                  key={fuel}
                  href={linkFor("fuel", fuel)}
                  className={`chip ${filters.fuelType === fuel || (!filters.fuelType && fuel === "all") ? "is-active" : ""}`}
                >
                  {fuel === "all" ? "Todos" : fuel === "gasoline" ? "Gasolina" : "Diesel"}
                </a>
              ))}
            </div>
          </section>
          <section className="filter-group">
            <span className="label">Estado</span>
            <div className="chip-row">
              {statusValues.map((status) => (
                <a
                  key={status}
                  href={linkFor("status", status)}
                  className={`chip ${filters.status === status || (!filters.status && status === "all") ? "is-active" : ""}`}
                >
                  {status === "all"
                    ? "Todos"
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
          </section>
        </div>
      </details>
    </div>
  );
}
