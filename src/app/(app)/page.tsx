import Link from "next/link";
import { Plus, Video } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getRoomsByCreator, getRecentRoomVisits } from "@/lib/queries/rooms";
import { getAppSettings } from "@/lib/queries/app-settings";
import { createInstantRoomAction } from "@/lib/actions/rooms";
import { countActiveParticipants } from "@/lib/livekit";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "@/components/home/copy-link-button";
import { JoinByCodeForm } from "@/components/home/join-by-code-form";
import { formatLastSeen } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getGreeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date())
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [rooms, recentVisits, settings] = await Promise.all([
    getRoomsByCreator(user.id),
    getRecentRoomVisits(user.id),
    getAppSettings(),
  ]);

  const uniqueSlugs = Array.from(
    new Set([...rooms.map((r) => r.slug), ...recentVisits.map((v) => v.room.slug)])
  );
  const liveCounts = await Promise.all(
    uniqueSlugs.map(async (slug) => [slug, await countActiveParticipants(slug)] as const)
  );
  const liveBySlug = new Map(liveCounts);

  const liveOwnedCount = rooms.filter((r) => (liveBySlug.get(r.slug) ?? 0) > 0).length;
  const subtitle =
    rooms.length === 0
      ? "Crie sua primeira sala para começar."
      : liveOwnedCount > 0
        ? `${liveOwnedCount} das suas salas está${liveOwnedCount === 1 ? "" : "ão"} ao vivo agora.`
        : `Você tem ${rooms.length} sala${rooms.length === 1 ? "" : "s"} criada${rooms.length === 1 ? "" : "s"}.`;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {getGreeting()}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="glass-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground">Ações rápidas</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form action={createInstantRoomAction}>
              <button
                type="submit"
                className="flex w-full flex-col items-start gap-2 rounded-xl border border-white/10 p-4 text-left transition-colors hover:bg-white/5"
              >
                <span
                  className="flex size-9 items-center justify-center rounded-lg"
                  style={{ background: settings.primaryColor }}
                >
                  <Plus className="size-4 text-white" />
                </span>
                <span className="font-medium">Nova reunião</span>
                <span className="text-xs text-muted-foreground">Inicie uma sala instantânea</span>
              </button>
            </form>
            <Link
              href="#suas-salas"
              className="flex flex-col items-start gap-2 rounded-xl border border-white/10 p-4 text-left transition-colors hover:bg-white/5"
            >
              <span
                className="flex size-9 items-center justify-center rounded-lg"
                style={{ background: settings.salasColor }}
              >
                <Video className="size-4 text-white" />
              </span>
              <span className="font-medium">Suas salas</span>
              <span className="text-xs text-muted-foreground">Veja e compartilhe seus links</span>
            </Link>
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-medium text-muted-foreground">Entrar com um link</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Cole o link ou código de uma sala compartilhada com você.
          </p>
          <div className="mt-4">
            <JoinByCodeForm />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section id="suas-salas" className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Suas salas</h2>
          {rooms.length === 0 ? (
            <div className="glass-card p-6 text-center text-sm text-muted-foreground">
              Você ainda não criou nenhuma sala.
            </div>
          ) : (
            <div className="glass-card divide-y divide-border">
              {rooms.map((room) => {
                const isLive = (liveBySlug.get(room.slug) ?? 0) > 0;
                return (
                  <div key={room.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Video className="size-4 shrink-0 text-primary" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="flex items-center gap-2 truncate font-medium">
                          {room.name}
                          {isLive && (
                            <span
                              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                              style={{ background: settings.primaryColor }}
                            >
                              Ao vivo
                            </span>
                          )}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          /sala/{room.slug} · até {room.maxParticipants} participantes
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <CopyLinkButton slug={room.slug} />
                      <Button size="sm" render={<Link href={`/sala/${room.slug}`} />}>
                        Entrar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Últimas reuniões</h2>
          {recentVisits.length === 0 ? (
            <div className="glass-card p-6 text-center text-sm text-muted-foreground">
              Você ainda não participou de nenhuma reunião.
            </div>
          ) : (
            <div className="glass-card divide-y divide-border">
              {recentVisits.map(({ room, joinedAt }) => (
                <div key={room.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Video className="size-4 shrink-0 text-primary" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate font-medium">{room.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {formatLastSeen(joinedAt)}
                      </span>
                    </div>
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
