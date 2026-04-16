import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  backHref
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="page-header">
      <div className="page-header-row">
        {backHref ? (
          <Link className="icon-button" href={backHref}>
            <ChevronLeft size={18} />
          </Link>
        ) : null}
        <div>
          <p className="eyebrow">Combustível Maputo</p>
          <h1>{title}</h1>
        </div>
      </div>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </header>
  );
}
