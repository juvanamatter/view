import Link from "next/link";
import { Video } from "lucide-react";
import { getTeamRooms } from "@/lib/queries/rooms";
import { Button } from "@/components/ui/button";
import { LiveStatusProvider } from "@/components/home/live-status-context";
import { LiveBadge } from "@/components/home/live-badge";

export const dynamic = "force-dynamic";

export default async function EquipesPage() {
  const rooms = await getTeamRooms();

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
        <LiveStatusProvider slugs={rooms.map((room) => room.slug)}>
          <div className="glass-card divide-y divide-border">
            {rooms.map((room) => (
              <div key={room.id} className="flex items-center gap-3 p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600">
                  <Video className="size-4 text-white" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span className="flex items-center gap-2 truncate font-medium">
                    {room.name}
                    <LiveBadge slug={room.slug} color="#d946ef" />
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    até {room.maxParticipants} participantes
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
    </div>
  );
}
