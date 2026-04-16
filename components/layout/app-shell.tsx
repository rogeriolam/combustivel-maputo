import Link from "next/link";
import { Bell, Gauge, MapPinned, PlusSquare, Settings, UserRound } from "lucide-react";
import { PropsWithChildren } from "react";

const navItems = [
  { href: "/", label: "Mapa", icon: MapPinned },
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/stations/new", label: "Adicionar", icon: PlusSquare },
  { href: "/alerts", label: "Alertas", icon: Bell },
  { href: "/profile", label: "Perfil", icon: UserRound }
];

export function AppShell({
  children,
  currentPath
}: PropsWithChildren<{ currentPath: string }>) {
  return (
    <div className="shell">
      <main className="shell-main">{children}</main>
      <nav className="bottom-nav" aria-label="Navegação principal">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item ${currentPath === href ? "is-active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
        <Link
          href="/admin"
          className={`bottom-nav-item admin-shortcut ${currentPath === "/admin" ? "is-active" : ""}`}
        >
          <Settings size={18} />
          <span>Admin</span>
        </Link>
      </nav>
    </div>
  );
}
