"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useDataChannel } from "@livekit/components-react";

type RecordingEvent = { active: boolean };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type RecordingContextValue = {
  active: boolean;
  pending: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

const RecordingContext = createContext<RecordingContextValue | null>(null);

export function RecordingProvider({ roomSlug, children }: { roomSlug: string; children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/rooms/${roomSlug}/recording-status`)
      .then((r) => r.json())
      .then((data) => setActive(Boolean(data.active)))
      .catch(() => {});
  }, [roomSlug]);

  const { send } = useDataChannel("recording", (msg) => {
    try {
      const event = JSON.parse(decoder.decode(msg.payload)) as RecordingEvent;
      setActive(event.active);
    } catch {
      // mensagem malformada, ignora
    }
  });

  async function start() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/rooms/${roomSlug}/recording/start`, { method: "POST" });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível iniciar a gravação.");
      return;
    }
    setActive(true);
    send(encoder.encode(JSON.stringify({ active: true } satisfies RecordingEvent)), {
      reliable: true,
    });
  }

  async function stop() {
    setPending(true);
    setError(null);
    const res = await fetch(`/api/rooms/${roomSlug}/recording/stop`, { method: "POST" });
    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Não foi possível parar a gravação.");
      return;
    }
    setActive(false);
    send(encoder.encode(JSON.stringify({ active: false } satisfies RecordingEvent)), {
      reliable: true,
    });
  }

  return (
    <RecordingContext.Provider value={{ active, pending, error, start, stop }}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const ctx = useContext(RecordingContext);
  if (!ctx) throw new Error("useRecording precisa estar dentro de RecordingProvider");
  return ctx;
}
