"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useDataChannel } from "@livekit/components-react";

export type Segment = { x0: number; y0: number; x1: number; y1: number; color: string };
type WhiteboardEvent = { type: "segment"; segment: Segment } | { type: "clear" };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type WhiteboardContextValue = {
  segments: Segment[];
  addSegment: (segment: Segment) => void;
  clear: () => void;
};

const WhiteboardContext = createContext<WhiteboardContextValue | null>(null);

export function WhiteboardProvider({ children }: { children: ReactNode }) {
  const [segments, setSegments] = useState<Segment[]>([]);

  const { send } = useDataChannel("whiteboard", (msg) => {
    try {
      const event = JSON.parse(decoder.decode(msg.payload)) as WhiteboardEvent;
      if (event.type === "segment") {
        setSegments((prev) => [...prev, event.segment]);
      } else if (event.type === "clear") {
        setSegments([]);
      }
    } catch {
      // mensagem malformada, ignora
    }
  });

  function addSegment(segment: Segment) {
    setSegments((prev) => [...prev, segment]);
    send(encoder.encode(JSON.stringify({ type: "segment", segment } satisfies WhiteboardEvent)), {
      reliable: false,
    });
  }

  function clear() {
    setSegments([]);
    send(encoder.encode(JSON.stringify({ type: "clear" } satisfies WhiteboardEvent)), {
      reliable: true,
    });
  }

  return (
    <WhiteboardContext.Provider value={{ segments, addSegment, clear }}>
      {children}
    </WhiteboardContext.Provider>
  );
}

export function useWhiteboard() {
  const ctx = useContext(WhiteboardContext);
  if (!ctx) throw new Error("useWhiteboard precisa estar dentro de WhiteboardProvider");
  return ctx;
}
