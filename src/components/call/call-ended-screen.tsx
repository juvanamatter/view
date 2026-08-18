"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { downloadTranscript, type TranscriptEntry } from "./transcription-context";

export function CallEndedScreen({
  roomName,
  entries,
  onBack,
}: {
  roomName: string;
  entries: TranscriptEntry[];
  onBack: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="glass-card w-full max-w-sm">
        <CardHeader>
          <CardTitle>Chamada encerrada</CardTitle>
          <CardDescription>
            {entries.length > 0
              ? "A transcrição não fica salva em nenhum servidor — depois de sair desta tela, ela é apagada. Baixe agora se quiser guardar."
              : "Até a próxima!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {entries.length > 0 && (
            <Button className="w-full" onClick={() => downloadTranscript(entries, roomName)}>
              <Download className="size-4" />
              Baixar transcrição (.txt)
            </Button>
          )}
          <Button variant="outline" className="w-full" onClick={onBack}>
            Voltar ao início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
