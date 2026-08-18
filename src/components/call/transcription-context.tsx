"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDataChannel, useLocalParticipant } from "@livekit/components-react";

export type TranscriptEntry = { speaker: string; text: string; timestamp: number };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSpeechRecognitionCtor(): typeof SpeechRecognition | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

type TranscriptionContextValue = {
  entries: TranscriptEntry[];
  supported: boolean;
};

const TranscriptionContext = createContext<TranscriptionContextValue | null>(null);

export function TranscriptionProvider({ children }: { children: ReactNode }) {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [supported] = useState(() => Boolean(getSpeechRecognitionCtor()));
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const shouldListenRef = useRef(false);

  const { send } = useDataChannel("transcript", (msg) => {
    try {
      const entry = JSON.parse(decoder.decode(msg.payload)) as TranscriptEntry;
      setEntries((prev) => [...prev, entry]);
    } catch {
      // mensagem malformada, ignora
    }
  });

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
    <TranscriptionContext.Provider value={{ entries, supported }}>
      {children}
    </TranscriptionContext.Provider>
  );
}

export function useTranscription() {
  const ctx = useContext(TranscriptionContext);
  if (!ctx) throw new Error("useTranscription precisa estar dentro de TranscriptionProvider");
  return ctx;
}
