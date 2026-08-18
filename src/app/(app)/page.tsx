import Link from "next/link";
import { Plus, Video } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getRoomsByCreator } from "@/lib/queries/rooms";
import { createInstantRoomAction } from "@/lib/actions/rooms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CopyLinkButton } from "@/components/home/copy-link-button";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const rooms = await getRoomsByCreator(user.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Olá, {user.name.split(" ")[0]}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Crie uma sala agora mesmo ou entre em uma que você já criou.
        </p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Nova sala instantânea</CardTitle>
          <CardDescription>Cria um link novo na hora, com as configurações padrão.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createInstantRoomAction}>
            <Button type="submit">
              <Plus className="size-4" />
              Criar sala agora
            </Button>
          </form>
        </CardContent>
      </Card>

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
  );
}
