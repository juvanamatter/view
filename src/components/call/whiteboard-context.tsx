"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useDataChannel, useLocalParticipant, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";

export type Segment = { x0: number; y0: number; x1: number; y1: number; color: string };
type PendingRequest = { identity: string; name: string };
type WhiteboardEvent =
  | { type: "segment"; segment: Segment }
  | { type: "clear" }
  | { type: "request"; identity: string; name: string }
  | { type: "grant"; identity: string }
  | { type: "deny"; identity: string };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type WhiteboardContextValue = {
  segments: Segment[];
  addSegment: (segment: Segment) => void;
  clear: () => void;
  hasScreenShare: boolean;
  isPresenter: boolean;
  active: boolean;
  hasPermission: boolean;
  requestPending: boolean;
  pendingRequests: PendingRequest[];
  toggleActive: () => void;
  approveRequest: (identity: string) => void;
  denyRequest: (identity: string) => void;
};

const WhiteboardContext = createContext<WhiteboardContextValue | null>(null);

export function WhiteboardProvider({ children }: { children: ReactNode }) {
  const { localParticipant } = useLocalParticipant();
  const screenShareTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], {
    onlySubscribed: false,
  });
  const presenterIdentity = screenShareTracks[0]?.participant.identity ?? null;
  const isPresenter = presenterIdentity !== null && presenterIdentity === localParticipant.identity;

  const [segments, setSegments] = useState<Segment[]>([]);
  const [active, setActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  const isPresenterRef = useRef(isPresenter);
  useEffect(() => {
    isPresenterRef.current = isPresenter;
  }, [isPresenter]);

  // Toda vez que muda quem está apresentando (ou a apresentação acaba), a permissão
  // e o modo desenho resetam — a autorização vale só pra sessão de tela daquele apresentador.
  // Ajuste feito durante o render (não em efeito) seguindo o padrão recomendado pelo React
  // para "resetar estado quando uma prop muda".
  const [lastPresenterIdentity, setLastPresenterIdentity] = useState(presenterIdentity);
  if (presenterIdentity !== lastPresenterIdentity) {
    setLastPresenterIdentity(presenterIdentity);
    setHasPermission(false);
    setRequestPending(false);
    setPendingRequests([]);
    setActive(false);
  }

  const { send } = useDataChannel("whiteboard", (msg) => {
    try {
      const event = JSON.parse(decoder.decode(msg.payload)) as WhiteboardEvent;
      if (event.type === "segment") {
        setSegments((prev) => [...prev, event.segment]);
      } else if (event.type === "clear") {
        setSegments([]);
      } else if (event.type === "request") {
        if (isPresenterRef.current) {
          setPendingRequests((prev) =>
            prev.some((r) => r.identity === event.identity)
              ? prev
              : [...prev, { identity: event.identity, name: event.name }]
          );
        }
      } else if (event.type === "grant") {
        if (event.identity === localParticipant.identity) {
          setHasPermission(true);
          setRequestPending(false);
          setActive(true);
        }
      } else if (event.type === "deny") {
        if (event.identity === localParticipant.identity) {
          setRequestPending(false);
        }
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

  function toggleActive() {
    if (isPresenter || hasPermission) {
      setActive((v) => !v);
      return;
    }
    if (requestPending) return;
    setRequestPending(true);
    send(
      encoder.encode(
        JSON.stringify({
          type: "request",
          identity: localParticipant.identity,
          name: localParticipant.name || localParticipant.identity,
        } satisfies WhiteboardEvent)
      ),
      { reliable: true }
    );
  }

  function approveRequest(identity: string) {
    setPendingRequests((prev) => prev.filter((r) => r.identity !== identity));
    send(encoder.encode(JSON.stringify({ type: "grant", identity } satisfies WhiteboardEvent)), {
      reliable: true,
    });
  }

  function denyRequest(identity: string) {
    setPendingRequests((prev) => prev.filter((r) => r.identity !== identity));
    send(encoder.encode(JSON.stringify({ type: "deny", identity } satisfies WhiteboardEvent)), {
      reliable: true,
    });
  }

  return (
    <WhiteboardContext.Provider
      value={{
        segments,
        addSegment,
        clear,
        hasScreenShare: screenShareTracks.length > 0,
        isPresenter,
        active,
        hasPermission,
        requestPending,
        pendingRequests,
        toggleActive,
        approveRequest,
        denyRequest,
      }}
    >
      {children}
    </WhiteboardContext.Provider>
  );
}

export function useWhiteboard() {
  const ctx = useContext(WhiteboardContext);
  if (!ctx) throw new Error("useWhiteboard precisa estar dentro de WhiteboardProvider");
  return ctx;
}
