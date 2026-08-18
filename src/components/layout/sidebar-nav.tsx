"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Users, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: typeof Home; color: string };

export function SidebarNav({
  isAdmin,
  colors,
}: {
  isAdmin: boolean;
  colors: { primaryColor: string; salasColor: string; usuariosColor: string; configuracoesColor: string };
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/", label: "Início", icon: Home, color: colors.primaryColor },
    ...(isAdmin
      ? [
          { href: "/salas", label: "Salas", icon: Video, color: colors.salasColor },
          { href: "/usuarios", label: "Usuários", icon: Users, color: colors.usuariosColor },
          { href: "/configuracoes", label: "Configurações", icon: Settings, color: colors.configuracoesColor },
        ]
      : []),
  ];

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white/10 text-foreground"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <Icon className="size-4" style={{ color: active ? item.color : undefined }} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
