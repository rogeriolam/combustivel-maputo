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
  const [showProvinces, setShowProvinces] = useState(false);
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
    <div className="filter-bar">
      <details open={showProvinces} onToggle={(event) => setShowProvinces((event.currentTarget as HTMLDetailsElement).open)}>
        <summary className="filter-toggle">
          Províncias <ChevronDown size={16} />
        </summary>
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
      </details>
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
