import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar, userPhotoProps } from "@/components/shared/user-avatar";
import { logoutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { OnlineBar } from "@/components/presence/online-bar";
import { getAppSettings } from "@/lib/queries/app-settings";
import { SidebarNav } from "./sidebar-nav";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getAppSettings()]);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="flex flex-1">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 p-4 md:flex">
        <Link href="/" className="flex items-center px-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={settings.logoUrl ?? "/matter-logo.png"} alt={settings.brandName} className="h-9 w-auto" />
        </Link>
        <div className="mt-8">
          <SidebarNav isAdmin={isAdmin} colors={settings} />
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-end gap-3 border-b border-white/10 px-6 py-3">
          {user && (
            <div className="flex items-center gap-2">
              <UserAvatar name={user.name} {...userPhotoProps(user)} className="size-7" />
              <span className="hidden text-sm sm:inline">{user.name}</span>
              <form action={logoutAction}>
                <Button variant="ghost" size="icon-sm" type="submit" title="Sair">
                  <LogOut className="size-4" />
                </Button>
              </form>
            </div>
          )}
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>

      {user && (
        <>
          <PresenceHeartbeat />
          <OnlineBar />
        </>
      )}
    </div>
  );
}
