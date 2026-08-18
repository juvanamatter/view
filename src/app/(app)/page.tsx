import Link from "next/link";
import { MonitorUp, Mic, PartyPopper, Plus, Video } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getRoomsByCreator, getRecentRoomVisits } from "@/lib/queries/rooms";
import { getAppSettings } from "@/lib/queries/app-settings";
import { createInstantRoomAction } from "@/lib/actions/rooms";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "@/components/home/copy-link-button";
import { formatLastSeen } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [rooms, recentVisits, settings] = await Promise.all([
    getRoomsByCreator(user.id),
    getRecentRoomVisits(user.id),
    getAppSettings(),
  ]);

  const features = [
    { icon: Video, label: "Câmera", color: settings.salasColor },
    { icon: Mic, label: "Áudio", color: settings.usuariosColor },
    { icon: MonitorUp, label: "Compartilhamento de tela", color: settings.configuracoesColor },
    { icon: PartyPopper, label: "Diversão", color: settings.primaryColor },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 border-b border-white/10 pb-8">
        <p
          className="animate-fade-in-up text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
          style={{ animationDelay: "0ms" }}
        >
          {settings.brandName}
        </p>
        <h1
          className="animate-fade-in-up mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight font-medium italic sm:text-5xl"
          style={{ animationDelay: "60ms" }}
        >
          Olá, {user.name.split(" ")[0]}
        </h1>
        <p
          className="animate-fade-in-up mt-3 max-w-md text-base text-muted-foreground"
          style={{ animationDelay: "120ms" }}
        >
          Câmera, áudio, compartilhamento de tela e diversão. Tudo em um lugar só.
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {features.map(({ icon: Icon, label, color }, i) => (
            <span
              key={label}
              className="animate-fade-in-up flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
              style={{ animationDelay: `${160 + i * 60}ms` }}
            >
              <Icon className="size-3.5" style={{ color }} />
              {label}
            </span>
          ))}
        </div>

        <div className="animate-fade-in-up mt-6" style={{ animationDelay: "420ms" }}>
          <div className="animate-float-button inline-block">
            <form action={createInstantRoomAction}>
              <Button type="submit" size="lg" className="rounded-full">
                <Plus className="size-4" />
                Criar sala agora
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
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
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Suas salas</h2>
          {rooms.length === 0 ? (
            <div className="glass-card p-6 text-center text-sm text-muted-foreground">
              Você ainda não criou nenhuma sala.
            </div>
          ) : (
            <div className="glass-card divide-y divide-border">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Video className="size-4 shrink-0 text-primary" />
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate font-medium">{room.name}</span>
                      <span className="truncate text-xs text-muted-foreground">/sala/{room.slug}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <CopyLinkButton slug={room.slug} />
                    <Button size="sm" render={<Link href={`/sala/${room.slug}`} />}>
                      Entrar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
