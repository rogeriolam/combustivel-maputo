import { fuelLegend } from "@/lib/domain/logic";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function MapLegend() {
  const legend = fuelLegend();

  return (
    <Card className="legend-card">
      <details>
        <summary className="legend-summary">
          <div>
            <h2>Legenda e regras</h2>
            <p>Os estados consideram apenas as últimas 3 horas.</p>
          </div>
        </summary>
        <div className="legend-list">
          {legend.map((item) => (
            <div className="legend-row" key={item.title}>
              <StatusBadge
                status={
                  item.title === "Tem"
                    ? "available"
                    : item.title === "Não tem"
                      ? "unavailable"
                      : item.title === "Em conflito"
                        ? "conflict"
                        : "unknown"
                }
              />
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </details>
    </Card>
  );
}
