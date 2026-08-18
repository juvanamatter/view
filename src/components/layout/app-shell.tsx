import Link from "next/link";
import { LogOut, Settings, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar, userPhotoProps } from "@/components/shared/user-avatar";
import { logoutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { OnlineBar } from "@/components/presence/online-bar";
import { getAppSettings } from "@/lib/queries/app-settings";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getAppSettings()]);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-1 flex-col">
      <header className="glass-panel mx-4 mt-4 flex items-center justify-between rounded-2xl px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.logoUrl ?? "/matter-logo.png"} alt={settings.brandName} className="h-6 w-auto" />
          <span className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">{settings.brandName}</span>
        </Link>
        <nav className="flex items-center gap-1">
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold transition-opacity hover:opacity-80"
                style={{ color: settings.salasColor }}
                render={<Link href="/salas" />}
              >
                <Video className="size-4" />
                Salas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold transition-opacity hover:opacity-80"
                style={{ color: settings.usuariosColor }}
                render={<Link href="/usuarios" />}
              >
                <Users className="size-4" />
                Usuários
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="font-semibold transition-opacity hover:opacity-80"
                style={{ color: settings.configuracoesColor }}
                render={<Link href="/configuracoes" />}
              >
                <Settings className="size-4" />
                Configurações
              </Button>
            </>
          )}
          {user && (
            <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
              <UserAvatar name={user.name} {...userPhotoProps(user)} className="size-7" />
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
      {user && (
        <>
          <PresenceHeartbeat />
          <OnlineBar />
        </>
      )}
    </div>
  );
}
