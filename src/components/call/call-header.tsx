"use client";

import { useEffect, useState } from "react";
import { useParticipants } from "@livekit/components-react";
import { ParticipantsPanel } from "./participants-panel";

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function CallHeader({ roomName }: { roomName: string }) {
  const time = useClock();
  const participants = useParticipants();
  const [panelOpen, setPanelOpen] = useState(false);
  const formatted = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(time);

  return (
    <div className="relative flex items-center justify-between px-4 py-3 text-sm text-white">
      <div className="flex items-center gap-2">
        <span>{formatted}</span>
        <span className="text-white/30">|</span>
        <span className="font-medium">{roomName}</span>
      </div>

      <button
        type="button"
        onClick={() => setPanelOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-white/10 py-1 pr-3 pl-1 transition-colors hover:bg-white/15"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-800 text-xs font-medium">
          {participants.length}
        </span>
      </button>

      {panelOpen && <ParticipantsPanel onClose={() => setPanelOpen(false)} position="below" />}
    </div>
  );
}
