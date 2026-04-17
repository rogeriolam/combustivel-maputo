"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { GPS_RADIUS_METERS, fuelLabels } from "@/lib/domain/config";
import { distanceMeters } from "@/lib/domain/logic";
import { FuelType, Station } from "@/lib/domain/types";

export function ReportForm({ station }: { station: Station }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string>("Usa a tua localização para validar a proximidade.");

  async function handleReport(formData: FormData) {
    const fuelType = String(formData.get("fuelType")) as FuelType;
    const option = String(formData.get("option"));

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
          return;
        }

        setFeedback(
          `Sinalização guardada para ${fuelLabels[fuelType]}. Estado: ${option === "available" ? "Tem" : "Não tem"}.`
        );
        router.refresh();
      },
      () => setFeedback("Não foi possível obter a localização actual.")
    );
  }

  return (
    <form action={handleReport} className="stack">
      <div className="section-heading">
        <h2>Actualizar no local</h2>
        <p>Podes actualizar um combustível sem alterar o outro.</p>
      </div>
      <label className="field">
        <span>Combustível</span>
        <select name="fuelType" defaultValue="gasoline">
          <option value="gasoline">Gasolina</option>
          <option value="diesel">Diesel</option>
        </select>
      </label>
      <div className="segment-control">
        <label>
          <input type="radio" name="option" value="available" defaultChecked />
          <span>Tem</span>
        </label>
        <label>
          <input type="radio" name="option" value="unavailable" />
          <span>Não tem</span>
        </label>
      </div>
      <button className="primary-button" type="submit">
        <LocateFixed size={18} />
        Validar localização e sinalizar
      </button>
      <p className="microcopy">{feedback}</p>
    </form>
  );
}
