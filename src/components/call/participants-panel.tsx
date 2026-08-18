"use client";

import { useParticipants } from "@livekit/components-react";
import { Mic, MicOff, Video, VideoOff, X } from "lucide-react";
import { useHandRaise } from "./hand-raise-context";

export function ParticipantsPanel({ onClose }: { onClose: () => void }) {
  const participants = useParticipants();
  const { raisedIdentities } = useHandRaise();

  return (
    <div className="glass-panel absolute right-0 bottom-full mb-3 flex max-h-[70vh] w-72 flex-col gap-2 overflow-hidden rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Participantes ({participants.length})</p>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto">
        {participants.map((p) => (
          <div
            key={p.identity}
            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white/5"
          >
            <span className="truncate">
              {raisedIdentities.has(p.identity) && "✋ "}
              {p.name || p.identity}
              {p.isLocal && " (você)"}
            </span>
            <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
              {p.isMicrophoneEnabled ? (
                <Mic className="size-3.5" />
              ) : (
                <MicOff className="size-3.5" />
              )}
              {p.isCameraEnabled ? (
                <Video className="size-3.5" />
              ) : (
                <VideoOff className="size-3.5" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
