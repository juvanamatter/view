"use client";

import { useEffect, useRef, useState } from "react";
import { useDataChannel, useLocalParticipant } from "@livekit/components-react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type TranscriptEntry = { speaker: string; text: string; timestamp: number };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSpeechRecognitionCtor(): typeof SpeechRecognition | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function downloadTranscript(entries: TranscriptEntry[], roomName: string) {
  const header = `Transcrição — ${roomName}\nGerada em ${new Date().toLocaleString("pt-BR")}\n\n`;
  const lines = entries.map((entry) => {
    const time = new Date(entry.timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `[${time}] ${entry.speaker}: ${entry.text}`;
  });
  const blob = new Blob([header + lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transcricao-${roomName}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function TranscriptionPanel({ roomName, onClose }: { roomName: string; onClose: () => void }) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [supported] = useState(() => Boolean(getSpeechRecognitionCtor()));
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  const { send } = useDataChannel("transcript", (msg) => {
    try {
      const entry = JSON.parse(decoder.decode(msg.payload)) as TranscriptEntry;
      setEntries((prev) => [...prev, entry]);
    } catch {
      // mensagem malformada, ignora
    }
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [entries.length]);

  useEffect(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    shouldListenRef.current = isMicrophoneEnabled;
    if (!isMicrophoneEnabled) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result.isFinal) continue;
        const text = result[0]?.transcript?.trim();
        if (!text) continue;
        const entry: TranscriptEntry = {
          speaker: localParticipant.name || localParticipant.identity,
          text,
          timestamp: Date.now(),
        };
        setEntries((prev) => [...prev, entry]);
        send(encoder.encode(JSON.stringify(entry)), { reliable: true });
      }
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch {
          // já rodando, ignora
        }
      }
    };

    recognition.onerror = () => {
      // deixa o onend cuidar do restart, se ainda devia estar escutando
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // ignora erro de start duplicado
    }

    return () => {
      shouldListenRef.current = false;
      recognition.onend = null;
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMicrophoneEnabled]);

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
