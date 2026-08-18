import Link from "next/link";
import { LogOut, Settings, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminLogoutAction } from "@/lib/actions/admin-auth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="glass-panel mx-4 mt-4 flex items-center justify-between rounded-2xl px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Video className="size-5 text-primary" />
          <span className="font-semibold">Reunião</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href="/salas" />}>
            Salas
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/configuracoes" />}>
            <Settings className="size-4" />
            Configurações
          </Button>
          <form action={adminLogoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="size-4" />
              Sair
            </Button>
          </form>
        </nav>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
