import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { AuthRequiredCard } from "@/components/auth/auth-required-card";
import { Card } from "@/components/ui/card";
import { NewStationForm } from "@/components/stations/new-station-form";
import { getCurrentUserProfile, getStations } from "@/lib/supabase/repository";

export default async function NewStationPage() {
  const [stations, profile] = await Promise.all([getStations(), getCurrentUserProfile()]);
  const isAuthenticated = Boolean(profile);

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
        {isAuthenticated ? (
          <Card>
            <NewStationForm stations={stations} />
          </Card>
        ) : (
          <AuthRequiredCard
            title="Entrar para adicionar novas bombas"
            body="Para reduzir abuso e duplicados, a criação de bombas e a primeira sinalização exigem uma conta autenticada."
            nextHref="/stations/new"
          />
        )}
      </div>
    </AppShell>
  );
}
