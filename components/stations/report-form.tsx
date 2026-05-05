"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { Toast, ToastType } from "@/components/ui/toast";
import { GPS_RADIUS_METERS, fuelLabels } from "@/lib/domain/config";
import { distanceMeters } from "@/lib/domain/logic";
import { FuelType, QueueOption, SignalOption, Station } from "@/lib/domain/types";

const GUEST_REPORTER_COOKIE = "cm_guest_reporter_key";

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function ensureGuestReporterKey() {
  const current = getCookieValue(GUEST_REPORTER_COOKIE);
  if (current) return current;

  const created = crypto.randomUUID();
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${GUEST_REPORTER_COOKIE}=${encodeURIComponent(created)}; Max-Age=${oneYear}; Path=/; SameSite=Lax; Secure`;
  return created;
}

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
  const [queueStatus, setQueueStatus] = useState<QueueOption | null>(null);
  const [gpsState, setGpsState] = useState<"checking" | "inside" | "outside" | "unsupported" | "error">("checking");
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const selectedUpdates = (Object.entries(selection) as Array<[FuelType, SignalOption | null]>)
    .filter((entry): entry is [FuelType, SignalOption] => Boolean(entry[1]))
    .map(([fuelType, option]) => ({ fuelType, option }));
  const isCompleteSelection = selectedUpdates.length === 2;
  const canSave = isCompleteSelection && gpsState === "inside" && !isPending;

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsState("unsupported");
      setFeedback("O browser não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = distanceMeters(latitude, longitude, station.latitude, station.longitude);
        setCurrentCoords({ latitude, longitude });

        if (distance > GPS_RADIUS_METERS) {
          setGpsState("outside");
          setFeedback(`Estás a ${Math.round(distance)}m da bomba. É preciso estar até ${GPS_RADIUS_METERS}m.`);
          return;
        }

        setGpsState("inside");
        setFeedback("Localização validada. Já podes guardar a actualização depois de escolher os dois combustíveis.");
      },
      () => {
        setGpsState("error");
        setFeedback("Não foi possível obter a localização actual.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 8_000
      }
    );
  }, [station.latitude, station.longitude]);

  async function submitReport() {
    if (!isCompleteSelection) {
      setFeedback("Indica obrigatoriamente o estado de Gasolina e Diesel antes de guardar.");
      return;
    }

    if (gpsState !== "inside" || !currentCoords) {
      setFeedback("Primeiro é preciso validar a tua localização junto da bomba.");
      return;
    }

    startTransition(async () => {
      const guestReporterKey =
        isAuthenticated
          ? null
          : ensureGuestReporterKey();

      const response = await fetch("/api/signals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stationId: station.id,
          updates: selectedUpdates,
          queueStatus,
          guestReporterKey,
          userLatitude: currentCoords.latitude,
          userLongitude: currentCoords.longitude
        })
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        setFeedback(payload.error ?? "Não foi possível guardar a sinalização.");
        setToast({ message: payload.error ?? "Não foi possível guardar a sinalização.", type: "error" });
        return;
      }

      setFeedback("Sinalização guardada. O histórico e o estado da bomba foram actualizados.");
      setToast({ message: "✓ Sinalização registada! Obrigado.", type: "success" });
      setSelection({ gasoline: null, diesel: null });
      setQueueStatus(null);
      router.refresh();
    });
  }

  return (
    <div className="stack">
      {toast ? <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} /> : null}
      <div className="report-header">
        <div>
          <h2>Actualizar no local</h2>
          <p>Escolhe o estado observado agora mesmo.</p>
        </div>
        <span className="report-step-pill">2 combustíveis → 1 gravação</span>
      </div>
      <div className="info-strip">
        <LocateFixed size={16} />
        <span>
          Cada registo guarda utilizador, data e hora. O estado público usa pessoas recentes nas últimas 3 horas.
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
      <div className="queue-report-card">
        <div className="report-card-head">
          <div>
            <span className="label">Fila</span>
            <h3>Fila agora?</h3>
          </div>
          <span className="microcopy">
            {queueStatus
              ? queueStatus === "none"
                ? "Sem fila"
                : queueStatus === "short"
                  ? "Fila curta"
                  : "Fila longa"
              : "Opcional"}
          </span>
        </div>
        <div className="queue-actions">
          <button
            className={`secondary-button ${queueStatus === null ? "report-choice is-selected" : "report-choice"}`}
            type="button"
            disabled={isPending}
            onClick={() => setQueueStatus(null)}
          >
            Não sei
          </button>
          <button
            className={`secondary-button ${queueStatus === "none" ? "report-choice is-selected" : "report-choice"}`}
            type="button"
            disabled={isPending}
            onClick={() => setQueueStatus("none")}
          >
            Sem fila
          </button>
          <button
            className={`secondary-button ${queueStatus === "short" ? "report-choice is-selected" : "report-choice"}`}
            type="button"
            disabled={isPending}
            onClick={() => setQueueStatus("short")}
          >
            Fila curta
          </button>
          <button
            className={`secondary-button ${queueStatus === "long" ? "report-choice is-selected" : "report-choice"}`}
            type="button"
            disabled={isPending}
            onClick={() => setQueueStatus("long")}
          >
            Fila longa
          </button>
        </div>
      </div>
      {selectedUpdates.length ? (
        <div className="report-review-card">
          <span className="label">Por guardar</span>
          <strong>
            {selectedUpdates
              .map(({ fuelType, option }) => `${fuelLabels[fuelType]} = ${option === "available" ? "Tem" : "Não tem"}`)
              .join(" · ")}
            {queueStatus
              ? ` · Fila = ${queueStatus === "none" ? "Sem fila" : queueStatus === "short" ? "Fila curta" : "Fila longa"}`
              : ""}
          </strong>
          {!isCompleteSelection ? (
            <span className="microcopy">Falta escolher um dos combustíveis antes de guardar.</span>
          ) : null}
        </div>
      ) : null}
      <button
        className="primary-button report-save-button"
        type="button"
        disabled={!canSave}
        aria-disabled={!canSave}
        onClick={submitReport}
      >
        <LocateFixed size={18} />
        {isPending ? "A guardar..." : "Guardar actualização"}
      </button>
      <p className="microcopy">{feedback}</p>
    </div>
  );
}
