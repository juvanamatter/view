"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocalParticipant } from "@livekit/components-react";
import { LocalVideoTrack } from "livekit-client";
import { BackgroundProcessor, type BackgroundProcessorWrapper } from "@livekit/track-processors";
import { toast } from "sonner";
import {
  loadBackgroundSelection,
  saveBackgroundSelection,
  type BackgroundSelection,
} from "@/lib/background-selection";

type BackgroundContextValue = {
  selection: BackgroundSelection;
  choose: (next: BackgroundSelection) => void;
};

const BackgroundContext = createContext<BackgroundContextValue | null>(null);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const { cameraTrack } = useLocalParticipant();
  const [selection, setSelection] = useState<BackgroundSelection>(() => loadBackgroundSelection());
  const processorRef = useRef<BackgroundProcessorWrapper | null>(null);

  useEffect(() => {
    const trackCandidate = cameraTrack?.track;
    if (!trackCandidate || !(trackCandidate instanceof LocalVideoTrack)) return;
    const track: LocalVideoTrack = trackCandidate;

    async function apply() {
      try {
        if (selection.mode === "none") {
          if (processorRef.current) await track.stopProcessor();
          return;
        }
        const options =
          selection.mode === "blur"
            ? ({ mode: "background-blur", blurRadius: 15 } as const)
            : ({ mode: "virtual-background", imagePath: selection.url } as const);

        if (!processorRef.current) {
          processorRef.current = BackgroundProcessor(options);
          await track.setProcessor(processorRef.current);
        } else {
          await processorRef.current.switchTo(options);
        }
      } catch (err) {
        console.error(err);
        toast.error("Não foi possível aplicar o fundo neste navegador.");
      }
    }
    apply();
  }, [cameraTrack, selection]);

  function choose(next: BackgroundSelection) {
    setSelection(next);
    saveBackgroundSelection(next);
  }

  return <BackgroundContext.Provider value={{ selection, choose }}>{children}</BackgroundContext.Provider>;
}

export function useBackground() {
  const ctx = useContext(BackgroundContext);
  if (!ctx) throw new Error("useBackground precisa estar dentro de BackgroundProvider");
  return ctx;
}
