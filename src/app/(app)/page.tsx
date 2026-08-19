import Link from "next/link";
import { Plus, Video } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getRecentRoomVisits, getUpcomingScheduledRooms } from "@/lib/queries/rooms";
import { getAppSettings } from "@/lib/queries/app-settings";
import { createInstantRoomAction } from "@/lib/actions/rooms";
import { Button } from "@/components/ui/button";
import { JoinByCodeForm } from "@/components/home/join-by-code-form";
import { TimeGreeting } from "@/components/home/time-greeting";
import { ScheduleMeetingButton } from "@/components/home/schedule-meeting-dialog";
import { LiveStatusProvider } from "@/components/home/live-status-context";
import { LiveBadge } from "@/components/home/live-badge";
import { formatLastSeen, formatScheduled } from "@/lib/utils";

export const dynamic = "force-dynamic";

function RoomIcon() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600">
      <Video className="size-4 text-white" />
    </span>
  );
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [recentVisits, scheduledRooms, settings] = await Promise.all([
    getRecentRoomVisits(user.id),
    getUpcomingScheduledRooms(user.id),
    getAppSettings(),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Bem-vindo(a) ao {settings.brandName} 👋</p>
        <h1 className="mt-0.5 text-2xl font-semibold">
          <TimeGreeting name={user.name.split(" ")[0]} />
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Câmera, áudio, compartilhamento de tela e diversão. Tudo em um lugar só.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="glass-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground">Ações rápidas</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form action={createInstantRoomAction}>
              <button
                type="submit"
                className="flex w-full flex-col items-start gap-2 rounded-xl bg-gradient-to-br from-violet-600 to-purple-800 p-4 text-left shadow-md shadow-black/20 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-white/20">
                  <Plus className="size-4 text-white" />
                </span>
                <span className="font-semibold text-white">Nova reunião</span>
                <span className="text-xs text-white/80">Inicie uma sala instantânea</span>
              </button>
            </form>
            <ScheduleMeetingButton />
          </div>
        </div>

        <div className="rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-purple-950 to-fuchsia-950/70 p-5">
          <h2 className="flex items-center gap-1.5 text-sm font-medium">
            <Video className="size-4" />
            Entrar com um código
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Digite o código da sala compartilhado com você.
          </p>
          <div className="mt-4">
            <JoinByCodeForm />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Últimas reuniões</h2>
          {recentVisits.length === 0 ? (
            <div className="glass-card p-6 text-center text-sm text-muted-foreground">
              Você ainda não participou de nenhuma reunião.
            </div>
          ) : (
            <LiveStatusProvider slugs={recentVisits.map(({ room }) => room.slug)}>
              <div className="glass-card divide-y divide-border">
                {recentVisits.map(({ room, joinedAt }) => (
                  <div key={room.id} className="flex items-center gap-3 p-3">
                    <RoomIcon />
                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                      <span className="flex items-center gap-2 truncate font-medium">
                        {room.name}
                        <LiveBadge slug={room.slug} color={settings.primaryColor} />
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {formatLastSeen(joinedAt)} · {room.hostName}
                      </span>
                    </div>
                    <Button size="sm" render={<Link href={`/sala/${room.slug}`} />}>
                      Entrar
                    </Button>
                  </div>
                ))}
              </div>
            </LiveStatusProvider>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Reuniões agendadas</h2>
          </div>
          {scheduledRooms.length === 0 ? (
            <div className="glass-card p-6 text-center text-sm text-muted-foreground">
              Nenhuma reunião agendada.
            </div>
          ) : (
            <div className="glass-card divide-y divide-border">
              {scheduledRooms.map((room) => (
                <div key={room.id} className="flex items-center gap-3 p-3">
                  <RoomIcon />
                  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <span className="truncate font-medium">{room.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {room.scheduledAt ? formatScheduled(room.scheduledAt) : ""}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" render={<Link href={`/sala/${room.slug}`} />}>
                    Entrar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
