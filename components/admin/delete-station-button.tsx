"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteStationButton({
  stationId,
  stationName
}: {
  stationId: string;
  stationName: string;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `Remover "${stationName}" e todo o histórico associado? Esta acção não pode ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/stations/${stationId}`, {
          method: "DELETE"
        });

        const payload = (await response.json()) as { ok?: boolean; error?: string };

        if (!response.ok || !payload.ok) {
          setFeedback(payload.error ?? "Não foi possível remover a bomba.");
          return;
        }

        setFeedback("Bomba removida com sucesso.");
        router.refresh();
      } catch {
        setFeedback("Falha de rede ao remover a bomba.");
      }
    });
  }

  return (
    <div className="stack">
      <button className="ghost-button" type="button" onClick={handleDelete} disabled={isPending}>
        {isPending ? "A remover..." : "Remover"}
      </button>
      {feedback ? <p className="microcopy">{feedback}</p> : null}
    </div>
  );
}
