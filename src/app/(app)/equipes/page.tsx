import Link from "next/link";
import { Video } from "lucide-react";
import { getTeamRooms } from "@/lib/queries/rooms";
import { countActiveParticipants } from "@/lib/livekit";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function EquipesPage() {
  const rooms = await getTeamRooms();
  const liveCounts = await Promise.all(
    rooms.map(async (room) => [room.slug, await countActiveParticipants(room.slug)] as const)
  );
  const liveBySlug = new Map(liveCounts);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Equipes</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Salas fixas de cada time. Entre a qualquer momento.
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="glass-card p-6 text-center text-sm text-muted-foreground">
          Nenhuma sala de equipe criada ainda. Peça a um admin para marcar uma sala como
          &quot;Sala de equipe&quot; em Salas.
        </div>
      ) : (
        <div className="glass-card divide-y divide-border">
          {rooms.map((room) => {
            const isLive = (liveBySlug.get(room.slug) ?? 0) > 0;
            return (
              <div key={room.id} className="flex items-center gap-3 p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600">
                  <Video className="size-4 text-white" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span className="flex items-center gap-2 truncate font-medium">
                    {room.name}
                    {isLive && (
                      <span className="shrink-0 rounded-full bg-fuchsia-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        Ao vivo
                      </span>
                    )}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    até {room.maxParticipants} participantes
                  </span>
                </div>
                <Button
                  size="sm"
                  className={isLive ? "bg-gradient-to-br from-fuchsia-500 to-purple-600" : undefined}
                  render={<Link href={`/sala/${room.slug}`} />}
                >
                  Entrar
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
