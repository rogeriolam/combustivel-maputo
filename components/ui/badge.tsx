import clsx from "clsx";
import { statusColors, statusLabels, confidenceLabels } from "@/lib/domain/config";
import { ConfidenceLevel, FuelStatus } from "@/lib/domain/types";

export function StatusBadge({ status }: { status: FuelStatus }) {
  return (
    <span
      className="badge"
      style={{
        backgroundColor: `${statusColors[status]}20`,
        color: statusColors[status],
        borderColor: `${statusColors[status]}55`
      }}
    >
      {statusLabels[status]}
    </span>
  );
}

export function ConfidenceBadge({ confidence }: { confidence: ConfidenceLevel }) {
  return (
    <span className={clsx("badge", "badge-neutral")}>
      Confiança {confidenceLabels[confidence]}
    </span>
  );
}
