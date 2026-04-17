"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { GPS_RADIUS_METERS, fuelLabels } from "@/lib/domain/config";
import { distanceMeters } from "@/lib/domain/logic";
import { FuelType, Station } from "@/lib/domain/types";

export function ReportForm({ station }: { station: Station }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string>("Usa a tua localização para validar a proximidade.");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function submitReport(fuelType: FuelType, option: "available" | "unavailable") {
    if (!navigator.geolocation) {
      setFeedback("O browser não suporta geolocalização.");
      return;
    }

    setPendingKey(`${fuelType}:${option}`);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = distanceMeters(latitude, longitude, station.latitude, station.longitude);

        if (distance > GPS_RADIUS_METERS) {
          setFeedback(`Estás a ${Math.round(distance)}m da bomba. É preciso estar até ${GPS_RADIUS_METERS}m.`);
          setPendingKey(null);
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
              fuelType,
              option,
              userLatitude: latitude,
              userLongitude: longitude
            })
          });

          const payload = (await response.json()) as { ok?: boolean; error?: string };

          if (!response.ok || !payload.ok) {
            setFeedback(payload.error ?? "Não foi possível guardar a sinalização.");
            setPendingKey(null);
            return;
          }

          setFeedback(
            `Sinalização guardada para ${fuelLabels[fuelType]}. Estado: ${option === "available" ? "Tem" : "Não tem"}.`
          );
          setPendingKey(null);
          router.refresh();
        });
      },
      () => {
        setFeedback("Não foi possível obter a localização actual.");
        setPendingKey(null);
      }
    );
  }

  return (
    <div className="stack">
      <div className="section-heading">
        <h2>Actualizar no local</h2>
        <p>Escolhe directamente o combustível e o estado a registar. Cada toque guarda só essa opção.</p>
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
                className="primary-button"
                type="button"
                disabled={isPending}
                onClick={() => submitReport(fuelType, "available")}
              >
                <LocateFixed size={18} />
                {pendingKey === `${fuelType}:available` ? "A validar..." : "Tem"}
              </button>
              <button
                className="secondary-button"
                type="button"
                disabled={isPending}
                onClick={() => submitReport(fuelType, "unavailable")}
              >
                {pendingKey === `${fuelType}:unavailable` ? "A validar..." : "Não tem"}
              </button>
            </div>
          </div>
        ))}
      </div>
      <p className="microcopy">{feedback}</p>
    </div>
  );
}
