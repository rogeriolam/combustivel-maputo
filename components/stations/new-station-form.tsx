"use client";

import { useMemo, useState } from "react";
import { GPS_RADIUS_METERS } from "@/lib/domain/config";
import { getDuplicateCandidates } from "@/lib/domain/logic";
import { Station } from "@/lib/domain/types";

export function NewStationForm({ stations }: { stations: Station[] }) {
  const [latitude, setLatitude] = useState("-25.9453");
  const [longitude, setLongitude] = useState("32.5892");
  const [statusMessage, setStatusMessage] = useState(
    "Confirma a tua localização actual e o nome da bomba para publicar já no mapa."
  );

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

  return (
    <form className="stack">
      <label className="field">
        <span>Nome da bomba</span>
        <input placeholder="Ex.: Petromoc Costa do Sol" />
      </label>
      <label className="field">
        <span>Cidade / zona</span>
        <select defaultValue="Maputo">
          <option value="Maputo">Maputo</option>
          <option value="Matola">Matola</option>
        </select>
      </label>
      <label className="field">
        <span>Bairro / referência</span>
        <input placeholder="Ex.: Av. Julius Nyerere" />
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
              {station.name} · {station.neighborhood}, {station.city}
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
          <select defaultValue="">
            <option value="">Sem actualizar</option>
            <option value="available">Tem</option>
            <option value="unavailable">Não tem</option>
          </select>
        </label>
        <label className="field">
          <span>Diesel</span>
          <select defaultValue="">
            <option value="">Sem actualizar</option>
            <option value="available">Tem</option>
            <option value="unavailable">Não tem</option>
          </select>
        </label>
      </div>
      <button className="primary-button" type="button">
        Publicar bomba
      </button>
      <p className="microcopy">{statusMessage}</p>
    </form>
  );
}
