"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { useDataChannel, useLocalParticipant } from "@livekit/components-react";

type HandRaiseEvent = { identity: string; raised: boolean };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type HandRaiseContextValue = {
  raisedIdentities: Set<string>;
  localRaised: boolean;
  toggle: () => void;
};

const HandRaiseContext = createContext<HandRaiseContextValue | null>(null);

export function HandRaiseProvider({ children }: { children: ReactNode }) {
  const { localParticipant } = useLocalParticipant();
  const [raisedIdentities, setRaisedIdentities] = useState<Set<string>>(new Set());
  const [localRaised, setLocalRaised] = useState(false);

  const { send } = useDataChannel("hand-raise", (msg) => {
    try {
      const event = JSON.parse(decoder.decode(msg.payload)) as HandRaiseEvent;
      setRaisedIdentities((prev) => {
        const next = new Set(prev);
        if (event.raised) next.add(event.identity);
        else next.delete(event.identity);
        return next;
      });
    } catch {
      // mensagem malformada, ignora
    }
  });

  function toggle() {
    const next = !localRaised;
    setLocalRaised(next);
    setRaisedIdentities((prev) => {
      const set = new Set(prev);
      if (next) set.add(localParticipant.identity);
      else set.delete(localParticipant.identity);
      return set;
    });
    send(
      encoder.encode(
        JSON.stringify({ identity: localParticipant.identity, raised: next } satisfies HandRaiseEvent)
      ),
      { reliable: true }
    );
  }

  return (
    <HandRaiseContext.Provider value={{ raisedIdentities, localRaised, toggle }}>
      {children}
    </HandRaiseContext.Provider>
  );
}

export function useHandRaise() {
  const ctx = useContext(HandRaiseContext);
  if (!ctx) throw new Error("useHandRaise precisa estar dentro de HandRaiseProvider");
  return ctx;
}
