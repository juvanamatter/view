"use client";

import { useEffect, useRef } from "react";
import { useParticipants, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import { toast } from "sonner";

const CHECK_INTERVAL_MS = 15_000;
const WARNING_AFTER_MS = 8 * 60 * 1000;
const END_AFTER_MS = 10 * 60 * 1000;

// Billing is per active minute, so a call with nobody's camera on, nobody
// sharing a screen, and nobody actually talking for 10 straight minutes gets
// force-ended — for real, via LiveKit's own deleteRoom (not just a local
// disconnect), so the room stops accruing minutes regardless of who's still
// sitting in the tab.
export function InactivityGuard({ slug }: { slug: string }) {
  const participants = useParticipants();
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]);
  const screenTracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }]);

  const isActive =
    participants.some((p) => p.isSpeaking) || cameraTracks.length > 0 || screenTracks.length > 0;
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    isActiveRef.current = isActive;
  });

  useEffect(() => {
    let lastActiveAt = Date.now();
    let warned = false;
    let ended = false;

    const interval = setInterval(() => {
      if (ended) return;
      if (isActiveRef.current) {
        lastActiveAt = Date.now();
        warned = false;
        return;
      }

      const idleFor = Date.now() - lastActiveAt;
      if (idleFor >= WARNING_AFTER_MS && !warned) {
        warned = true;
        const minutesLeft = Math.max(1, Math.ceil((END_AFTER_MS - idleFor) / 60_000));
        toast.warning(
          `Sem câmera, tela ou áudio há um tempo — a reunião encerra em ${minutesLeft} min se continuar assim.`
        );
      }
      if (idleFor >= END_AFTER_MS) {
        ended = true;
        fetch(`/api/rooms/${slug}/end`, { method: "POST" }).catch(() => {});
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [slug]);

  return null;
}
