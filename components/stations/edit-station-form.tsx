"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { provinceOptions } from "@/lib/domain/config";
import { Province, Station } from "@/lib/domain/types";

export function EditStationForm({ station }: { station: Station }) {
  const router = useRouter();
  const [name, setName] = useState(station.name);
  const [province, setProvince] = useState<Province>(station.province);
  const [municipality, setMunicipality] = useState(station.municipality);
  const [neighborhood, setNeighborhood] = useState(station.neighborhood);
  const [latitude, setLatitude] = useState(String(station.latitude));
  const [longitude, setLongitude] = useState(String(station.longitude));
  const [message, setMessage] = useState("Utilizadores autenticados podem corrigir dados da bomba. Remoção continua reservada ao Admin.");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!name.trim() || !municipality.trim() || !neighborhood.trim()) {
      setMessage("Preenche nome, localidade e referência.");
      return;
    }

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setMessage("Latitude e longitude têm de ser números válidos.");
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/stations/${station.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          province,
          municipality: municipality.trim(),
          neighborhood: neighborhood.trim(),
          latitude: lat,
          longitude: lng
        })
      });

      const payload = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !payload.ok) {
        setMessage(payload.error ?? "Não foi possível actualizar a bomba.");
        return;
      }

      setMessage("Dados da bomba actualizados.");
      router.refresh();
    });
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="grid-two">
        <label className="field">
          <span>Nome</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="field">
          <span>Província</span>
          <select value={province} onChange={(event) => setProvince(event.target.value as Province)}>
            {provinceOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid-two">
        <label className="field">
          <span>Cidade / distrito / localidade</span>
          <input value={municipality} onChange={(event) => setMunicipality(event.target.value)} />
        </label>
        <label className="field">
          <span>Bairro / referência</span>
          <input value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} />
        </label>
      </div>
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
      <button className="secondary-button" type="submit" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar dados da bomba"}
      </button>
      <p className="microcopy">{message}</p>
    </form>
  );
}
