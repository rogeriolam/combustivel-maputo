"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { GPS_RADIUS_METERS, fuelLabels } from "@/lib/domain/config";
import { distanceMeters } from "@/lib/domain/logic";
import { FuelType, SignalOption, Station } from "@/lib/domain/types";

export function ReportForm({
  station,
  isAuthenticated
}: {
  station: Station;
  isAuthenticated: boolean;
}) {
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
  const isCompleteSelection = selectedUpdates.length === 2;

  async function submitReport() {
    if (!isCompleteSelection) {
      setFeedback("Indica obrigatoriamente o estado de Gasolina e Diesel antes de guardar.");
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
          const guestReporterKey =
            isAuthenticated
              ? null
              : (() => {
                  const storageKey = "combustivel-maputo-guest-key";
                  const current = window.localStorage.getItem(storageKey);
                  if (current) return current;
                  const created = crypto.randomUUID();
                  window.localStorage.setItem(storageKey, created);
                  return created;
                })();

          const response = await fetch("/api/signals", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              stationId: station.id,
              updates: selectedUpdates,
              guestReporterKey,
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
      <div className="report-header">
        <div>
          <h2>Actualizar no local</h2>
          <p>Indica o estado observado agora mesmo para Gasolina e Diesel.</p>
        </div>
        <span className="report-step-pill">2 combustíveis → 1 gravação</span>
      </div>
      <div className="info-strip">
        <LocateFixed size={16} />
        <span>
          Cada registo guarda utilizador, data e hora. O estado público segue a regra das últimas 3 horas e precisa de
          pelo menos 2 sinais válidos.
        </span>
      </div>
      <p className="microcopy">
        {isAuthenticated
          ? "Estás a sinalizar com a tua conta. A tua actualização ficará associada ao teu perfil."
          : "Podes sinalizar como visitante. Para criar bombas e gerir alertas, continua a ser preciso iniciar sessão."}
      </p>
      <div className="report-grid">
        {(["gasoline", "diesel"] as FuelType[]).map((fuelType) => (
          <div className="report-card" key={fuelType}>
            <div className="report-card-head">
              <div>
                <span className="label">Combustível</span>
                <h3>{fuelLabels[fuelType]}</h3>
              </div>
              <span className="microcopy">
                {selection[fuelType]
                  ? `Seleccionado: ${selection[fuelType] === "available" ? "Tem" : "Não tem"}`
                  : "Sem escolha"}
              </span>
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
        <div className="report-review-card">
          <span className="label">Por guardar</span>
          <strong>
            {selectedUpdates
              .map(({ fuelType, option }) => `${fuelLabels[fuelType]} = ${option === "available" ? "Tem" : "Não tem"}`)
              .join(" · ")}
          </strong>
          {!isCompleteSelection ? (
            <span className="microcopy">Falta escolher um dos combustíveis antes de guardar.</span>
          ) : null}
        </div>
      ) : null}
      <button
        className="primary-button report-save-button"
        type="button"
        disabled={isPending || !isCompleteSelection}
        onClick={submitReport}
      >
        <LocateFixed size={18} />
        {isPending ? "A guardar..." : "Guardar actualização"}
      </button>
      <p className="microcopy">{feedback}</p>
    </div>
  );
}
