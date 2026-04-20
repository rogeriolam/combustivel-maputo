import { format, formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FuelAggregate } from "@/lib/domain/types";
import { fuelLabels } from "@/lib/domain/config";
import { getParticipationHint } from "@/lib/domain/logic";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

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
      <p className="muted">{getParticipationHint(aggregate)}</p>
      <p className="microcopy">
        Última actualização:{" "}
        {aggregate.lastUpdatedAt
          ? `${format(new Date(aggregate.lastUpdatedAt), "dd MMM yyyy, HH:mm", { locale: ptBR })} (${formatDistanceToNowStrict(
              new Date(aggregate.lastUpdatedAt),
              {
                addSuffix: true,
                locale: ptBR
              }
            )})`
          : "sem registos recentes"}
      </p>
    </Card>
  );
}
