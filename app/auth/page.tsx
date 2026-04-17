import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LoginCard } from "@/components/auth/login-card";
import { Card } from "@/components/ui/card";

export default async function AuthPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AppShell currentPath="/auth">
      <div className="page">
        <PageHeader
          title="Onboarding e login"
          subtitle="Entra com Google, Apple ou e-mail para sinalizar combustível, criar bombas e receber alertas."
        />
        <Card>
          <div className="section-heading">
            <h2>Como funciona</h2>
            <p>
              1. Entrar na conta. 2. Confirmar localização junto da bomba. 3. Sinalizar Gasolina e/ou Diesel.
            </p>
          </div>
        </Card>
        <LoginCard next={next ?? "/profile"} />
      </div>
    </AppShell>
  );
}
