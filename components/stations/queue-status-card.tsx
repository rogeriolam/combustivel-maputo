import { QueueAggregate } from "@/lib/domain/types";
import { queueLabels } from "@/lib/domain/config";
import { Card } from "@/components/ui/card";
import { formatMaputoDateTime, formatMaputoRelative } from "@/lib/formatting/date";

export function QueueStatusCard({ aggregate }: { aggregate: QueueAggregate }) {
  const participationLabel =
    aggregate.recentSignals === 0
      ? "Sem dados recentes"
      : aggregate.recentSignals === 1
        ? "1 pessoa recente"
        : `${aggregate.recentSignals} pessoas recentes`;

  return (
    <Card className="queue-status-card">
      <div className="fuel-card-header">
        <div>
          <p className="eyebrow">Fila</p>
          <span className={`badge queue-badge queue-badge-${aggregate.status}`}>
            {queueLabels[aggregate.status]}
          </span>
        </div>
        <span className="badge badge-neutral">{participationLabel}</span>
      </div>
      <div className="stats-grid queue-stats-grid">
        <div>
          <strong>{aggregate.noneCount}</strong>
          <span>Sem fila</span>
        </div>
        <div>
          <strong>{aggregate.shortCount}</strong>
          <span>Fila curta</span>
        </div>
        <div>
          <strong>{aggregate.longCount}</strong>
          <span>Fila longa</span>
        </div>
      </div>
      <p className="muted fuel-card-summary">{aggregate.explanation}</p>
      <p className="microcopy fuel-card-updated">
        Última informação de fila: {" "}
        {aggregate.lastUpdatedAt
          ? `${formatMaputoDateTime(aggregate.lastUpdatedAt)} (${formatMaputoRelative(aggregate.lastUpdatedAt)})`
          : "sem dados recentes"}
      </p>
    </Card>
  );
}
