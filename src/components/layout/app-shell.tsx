import Link from "next/link";
import { LogOut, Settings, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import { logoutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-1 flex-col">
      <header className="glass-panel mx-4 mt-4 flex items-center justify-between rounded-2xl px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Video className="size-5 text-primary" />
          <span className="font-semibold">Reunião</span>
        </Link>
        <nav className="flex items-center gap-1">
          {isAdmin && (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/salas" />}>
                Salas
              </Button>
              <Button variant="ghost" size="sm" render={<Link href="/usuarios" />}>
                <Users className="size-4" />
                Usuários
              </Button>
              <Button variant="ghost" size="sm" render={<Link href="/configuracoes" />}>
                <Settings className="size-4" />
                Configurações
              </Button>
            </>
          )}
          {user && (
            <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
              <UserAvatar name={user.name} photoUrl={user.photoUrl} className="size-7 text-xs" />
              <span className="hidden text-sm sm:inline">{user.name}</span>
              <form action={logoutAction}>
                <Button variant="ghost" size="icon-sm" type="submit" title="Sair">
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
          )}
        </nav>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
