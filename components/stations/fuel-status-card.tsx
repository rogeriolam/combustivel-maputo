import { FuelAggregate } from "@/lib/domain/types";
import { fuelLabels } from "@/lib/domain/config";
import { getParticipationHint } from "@/lib/domain/logic";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatMaputoDateTime, formatMaputoRelative } from "@/lib/formatting/date";

export function FuelStatusCard({ aggregate }: { aggregate: FuelAggregate }) {
  const participationLabel =
    aggregate.recentSignals === 0
      ? "Sem contribuições recentes"
      : aggregate.recentSignals === 1
        ? "1 pessoa recente"
        : `${aggregate.recentSignals} pessoas recentes`;

  return (
    <Card className="fuel-card">
      <div className="fuel-card-header">
        <div>
          <p className="eyebrow">{fuelLabels[aggregate.fuelType]}</p>
          <StatusBadge status={aggregate.status} />
        </div>
        <span className="badge badge-neutral">{participationLabel}</span>
      </div>
      <div className="stats-grid">
        <div>
          <strong>{aggregate.availableCount}</strong>
          <span>Tem</span>
        </div>
        <div>
          <strong>{aggregate.unavailableCount}</strong>
          <span>Não tem</span>
        </div>
        <div>
          <strong>{aggregate.recentSignals}</strong>
          <span>Pessoas</span>
        </div>
      </div>
      <p className="muted fuel-card-summary">{getParticipationHint(aggregate)}</p>
      <p className="microcopy fuel-card-updated">
        Última actualização:{" "}
        {aggregate.lastUpdatedAt
          ? `${formatMaputoDateTime(aggregate.lastUpdatedAt)} (${formatMaputoRelative(aggregate.lastUpdatedAt)})`
          : "sem registos recentes"}
      </p>
    </Card>
  );
}
