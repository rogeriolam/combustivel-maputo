import { formatDistanceToNowStrict } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FuelAggregate } from "@/lib/domain/types";
import { fuelLabels } from "@/lib/domain/config";
import { Card } from "@/components/ui/card";
import { ConfidenceBadge, StatusBadge } from "@/components/ui/badge";

export function FuelStatusCard({ aggregate }: { aggregate: FuelAggregate }) {
  return (
    <Card className="fuel-card">
      <div className="fuel-card-header">
        <div>
          <p className="eyebrow">{fuelLabels[aggregate.fuelType]}</p>
          <StatusBadge status={aggregate.status} />
        </div>
        <ConfidenceBadge confidence={aggregate.confidence} />
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
          <span>Sinais válidos</span>
        </div>
      </div>
      <p className="muted">{aggregate.explanation}</p>
      <p className="microcopy">
        Última actualização:{" "}
        {aggregate.lastUpdatedAt
          ? formatDistanceToNowStrict(new Date(aggregate.lastUpdatedAt), {
              addSuffix: true,
              locale: ptBR
            })
          : "sem registos recentes"}
      </p>
    </Card>
  );
}
