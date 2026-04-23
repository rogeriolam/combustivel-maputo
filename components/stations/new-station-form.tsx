"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { queuePendingToast } from "@/components/ui/page-toast";
import { GPS_RADIUS_METERS, provinceOptions } from "@/lib/domain/config";
import { getDuplicateCandidates } from "@/lib/domain/logic";
import { Province, Station } from "@/lib/domain/types";

export function NewStationForm({ stations }: { stations: Station[] }) {
  const router = useRouter();
  const [latitude, setLatitude] = useState("-25.9453");
  const [longitude, setLongitude] = useState("32.5892");
  const [name, setName] = useState("");
  const [province, setProvince] = useState<Province>("Cidade de Maputo");
  const [municipality, setMunicipality] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [gasolineOption, setGasolineOption] = useState("");
  const [dieselOption, setDieselOption] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Confirma a tua localização actual e o nome da bomba para publicar já no mapa."
  );
  const [isPending, startTransition] = useTransition();

  const duplicates = useMemo(() => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return [];
    }

    return getDuplicateCandidates(stations, lat, lng);
  }, [latitude, longitude, stations]);

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setStatusMessage("O browser não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setStatusMessage("Localização preenchida. Verifica se não existe duplicado num raio de 100m.");
      },
      () => setStatusMessage("Não foi possível obter a localização actual.")
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!name.trim() || !municipality.trim() || !neighborhood.trim()) {
      setStatusMessage("Preenche nome, município/localidade e bairro/referência.");
      return;
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setStatusMessage("Latitude e longitude têm de ser números válidos.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/stations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.trim(),
            province,
            municipality: municipality.trim(),
            neighborhood: neighborhood.trim(),
            latitude: lat,
            longitude: lng,
            initialSignals: {
              gasoline: gasolineOption || undefined,
              diesel: dieselOption || undefined
            }
          })
        });

        const payload = (await response.json()) as { ok?: boolean; error?: string; stationId?: string };

        if (!response.ok || !payload.ok || !payload.stationId) {
          setStatusMessage(payload.error ?? "Não foi possível publicar a bomba.");
          return;
        }

        queuePendingToast({
          message: "✓ Bomba adicionada! Agora outros podem sinalizar aqui.",
          type: "success"
        });
        setStatusMessage("Bomba publicada com sucesso. A abrir detalhe...");
        router.push(`/stations/${payload.stationId}`);
        router.refresh();
      } catch {
        setStatusMessage("Falha de rede ao publicar a bomba.");
      }
    });
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <label className="field">
        <span>Nome da bomba</span>
        <input placeholder="Ex.: Petromoc Costa do Sol" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>Província</span>
        <select value={province} onChange={(event) => setProvince(event.target.value as Province)}>
          {provinceOptions.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        <span>Cidade / distrito / localidade</span>
        <input
          placeholder="Ex.: Matola, Beira, Nampula, Chimoio"
          value={municipality}
          onChange={(event) => setMunicipality(event.target.value)}
        />
      </label>
      <label className="field">
        <span>Bairro / referência</span>
        <input
          placeholder="Ex.: Av. Julius Nyerere"
          value={neighborhood}
          onChange={(event) => setNeighborhood(event.target.value)}
        />
      </label>
      <div className="grid-two">
        <label className="field">
          <span>Latitude</span>
          <input value={latitude} onChange={(event) => setLatitude(event.target.value)} />
        </label>
        <label className="field">
          <span>Longitude</span>
          <input value={longitude} onChange={(event) => setLongitude(event.target.value)} />
        </label>
      </div>
      <button className="secondary-button" type="button" onClick={useCurrentLocation}>
        Usar GPS actual
      </button>
      {duplicates.length ? (
        <div className="warning-box">
          <strong>Possível duplicado dentro de {GPS_RADIUS_METERS}m</strong>
          {duplicates.map((station) => (
            <a key={station.id} href={`/stations/${station.id}`}>
              {station.name} · {station.neighborhood}, {station.municipality}, {station.province}
            </a>
          ))}
        </div>
      ) : null}
      <div className="section-heading">
        <h2>Primeira sinalização opcional</h2>
        <p>Podes publicar a bomba e registar logo Gasolina e/ou Diesel.</p>
      </div>
      <div className="grid-two">
        <label className="field">
          <span>Gasolina</span>
          <select value={gasolineOption} onChange={(event) => setGasolineOption(event.target.value)}>
            <option value="">Sem actualizar</option>
            <option value="available">Tem</option>
            <option value="unavailable">Não tem</option>
          </select>
        </label>
        <label className="field">
          <span>Diesel</span>
          <select value={dieselOption} onChange={(event) => setDieselOption(event.target.value)}>
            <option value="">Sem actualizar</option>
            <option value="available">Tem</option>
            <option value="unavailable">Não tem</option>
          </select>
        </label>
      </div>
      <button className="primary-button" type="submit" disabled={isPending}>
        {isPending ? "A publicar..." : "Publicar bomba"}
      </button>
      <p className="microcopy">{statusMessage}</p>
    </form>
  );
}
