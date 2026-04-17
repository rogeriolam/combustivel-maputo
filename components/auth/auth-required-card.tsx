import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AuthRequiredCard({
  title,
  body
}: {
  title: string;
  body: string;
}) {
  return (
    <Card className="stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Contribuição protegida</p>
          <h2>{title}</h2>
        </div>
        <div className="icon-badge">
          <LockKeyhole size={20} />
        </div>
      </div>
      <p className="muted">{body}</p>
      <div className="hero-cta-row">
        <Link className="primary-button" href="/auth">
          Entrar para continuar
        </Link>
        <Link className="ghost-button" href="/map">
          Voltar ao mapa
        </Link>
      </div>
      <div className="info-strip">
        <ShieldCheck size={16} />
        <span>O mapa continua público, mas criar conteúdo e alertas exige sessão activa.</span>
      </div>
    </Card>
  );
}
