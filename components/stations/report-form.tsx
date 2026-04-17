"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { GPS_RADIUS_METERS, fuelLabels } from "@/lib/domain/config";
import { distanceMeters } from "@/lib/domain/logic";
import { FuelType, SignalOption, Station } from "@/lib/domain/types";

export function ReportForm({ station }: { station: Station }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string>("Usa a tua localização para validar a proximidade.");
  const [selection, setSelection] = useState<Record<FuelType, SignalOption | null>>({
    gasoline: null,
    diesel: null
  });
  const [isPending, startTransition] = useTransition();

  const selectedUpdates = (Object.entries(selection) as Array<[FuelType, SignalOption | null]>)
    .filter((entry): entry is [FuelType, SignalOption] => Boolean(entry[1]))
    .map(([fuelType, option]) => ({ fuelType, option }));

  async function submitReport() {
    if (!selectedUpdates.length) {
      setFeedback("Selecciona pelo menos um combustível antes de guardar.");
      return;
    }

    if (!navigator.geolocation) {
      setFeedback("O browser não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = distanceMeters(latitude, longitude, station.latitude, station.longitude);

        if (distance > GPS_RADIUS_METERS) {
          setFeedback(`Estás a ${Math.round(distance)}m da bomba. É preciso estar até ${GPS_RADIUS_METERS}m.`);
          return;
        }

        startTransition(async () => {
          const response = await fetch("/api/signals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              stationId: station.id,
              updates: selectedUpdates,
              userLatitude: latitude,
              userLongitude: longitude
            })
          });

          const payload = (await response.json()) as { ok?: boolean; error?: string };

          if (!response.ok || !payload.ok) {
            setFeedback(payload.error ?? "Não foi possível guardar a sinalização.");
            return;
          }

          setFeedback(
            `Actualização guardada para ${selectedUpdates
              .map(({ fuelType, option }) => `${fuelLabels[fuelType]} = ${option === "available" ? "Tem" : "Não tem"}`)
              .join(" · ")}. O histórico abaixo deve mostrar a tua actualização com data e hora.`
          );
          setSelection({ gasoline: null, diesel: null });
          router.refresh();
        });
      },
      () => {
        setFeedback("Não foi possível obter a localização actual.");
      }
    );
  }

  return (
    <div className="stack">
      <div className="section-heading">
        <h2>Actualizar no local</h2>
        <p>Escolhe directamente o combustível e o estado a registar. Cada toque guarda só essa opção.</p>
      </div>
      <div className="info-strip">
        <LocateFixed size={16} />
        <span>
          Cada registo guarda utilizador, data e hora. O estado público segue a regra das últimas 3 horas e precisa de
          pelo menos 2 sinais válidos.
        </span>
      </div>
      <div className="report-grid">
        {(["gasoline", "diesel"] as FuelType[]).map((fuelType) => (
          <div className="report-card" key={fuelType}>
            <div className="section-heading">
              <h2>{fuelLabels[fuelType]}</h2>
              <p>Selecciona o estado observado agora mesmo nesta bomba.</p>
            </div>
            <div className="report-actions">
              <button
                className={`secondary-button ${selection[fuelType] === "available" ? "report-choice is-selected" : "report-choice"}`}
                type="button"
                disabled={isPending}
                onClick={() =>
                  setSelection((current) => ({
                    ...current,
                    [fuelType]: "available"
                  }))
                }
              >
                Tem
              </button>
              <button
                className={`secondary-button ${selection[fuelType] === "unavailable" ? "report-choice is-selected" : "report-choice"}`}
                type="button"
                disabled={isPending}
                onClick={() =>
                  setSelection((current) => ({
                    ...current,
                    [fuelType]: "unavailable"
                  }))
                }
              >
                Não tem
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedUpdates.length ? (
        <div className="info-strip">
          <span>
            Por guardar:{" "}
            {selectedUpdates
              .map(({ fuelType, option }) => `${fuelLabels[fuelType]} = ${option === "available" ? "Tem" : "Não tem"}`)
              .join(" · ")}
          </span>
        </div>
      ) : null}
      <button className="primary-button" type="button" disabled={isPending || !selectedUpdates.length} onClick={submitReport}>
        <LocateFixed size={18} />
        {isPending ? "A guardar..." : "Guardar actualização"}
      </button>
      <p className="microcopy">{feedback}</p>
    </div>
  );
}
