"use client";

import { useEffect, useRef } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranscription, downloadTranscript } from "./transcription-context";

export function TranscriptionPanel({ roomName, onClose }: { roomName: string; onClose: () => void }) {
  const { entries, supported } = useTranscription();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [entries.length]);

  return (
    <div className="glass-panel absolute right-0 bottom-full mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Transcrição</p>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>

      {!supported && (
        <p className="mt-2 text-xs text-muted-foreground">
          Este navegador não suporta transcrição automática. Funciona no Chrome e no Edge.
        </p>
      )}

      <div ref={listRef} className="mt-2 flex-1 space-y-2 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            A transcrição do que for falado aparece aqui.
          </p>
        ) : (
          entries.map((entry, i) => (
            <div key={i} className="text-sm">
              <span className="font-medium">{entry.speaker}</span>{" "}
              <span className="text-xs text-muted-foreground">
                {new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <p className="text-foreground/90">{entry.text}</p>
            </div>
          ))
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        disabled={entries.length === 0}
        onClick={() => downloadTranscript(entries, roomName)}
      >
        <Download className="size-4" />
        Baixar transcrição (.txt)
      </Button>
    </div>
  );
}
