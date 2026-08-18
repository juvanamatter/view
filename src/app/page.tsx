import Link from "next/link";
import { Video, Settings } from "lucide-react";
import { JoinByLinkForm } from "@/components/home/join-by-link-form";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-4 mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="size-5 text-primary" />
          <span className="font-semibold">Reunião</span>
        </div>
        <Button variant="ghost" size="sm" render={<Link href="/salas" />}>
          <Settings className="size-4" />
          Área administrativa
        </Button>
      </header>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">Reuniões por vídeo, sem complicação</h1>
            <p className="text-muted-foreground">
              Câmera, áudio e compartilhamento de tela em um link só.
            </p>
          </div>
          <JoinByLinkForm />
        </div>
      </div>
    </div>
  );
}
