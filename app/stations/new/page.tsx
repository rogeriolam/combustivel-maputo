import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { NewStationForm } from "@/components/stations/new-station-form";
import { getStations } from "@/lib/supabase/repository";

export default async function NewStationPage() {
  const stations = await getStations();

  return (
    <AppShell currentPath="/stations/new">
      <div className="page">
        <PageHeader
          title="Adicionar nova bomba"
          subtitle="Publicação aberta para utilizadores autenticados, com bloqueio de duplicados e validação de GPS."
        />
        <Card>
          <div className="section-heading">
            <h2>Regras do MVP</h2>
            <p>
              A nova bomba só deve ser criada se não existir outra a menos de 100m. A mesma validação de proximidade
              aplica-se à primeira sinalização.
            </p>
          </div>
        </Card>
        <Card>
          <NewStationForm stations={stations} />
        </Card>
      </div>
    </AppShell>
  );
}
