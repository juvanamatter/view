"use client";

import { useEffect, useState } from "react";
import { useParticipants } from "@livekit/components-react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { ParticipantsPanel } from "./participants-panel";

function useClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function CallHeader({ roomName, slug }: { roomName: string; slug: string }) {
  const time = useClock();
  const participants = useParticipants();
  const [panelOpen, setPanelOpen] = useState(false);
  const formatted = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(time);

  function copyInviteLink() {
    const url = `${window.location.origin}/sala/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link da sala copiado.");
  }

  return (
    <div className="relative z-30 flex items-center justify-between px-4 py-3 text-sm text-white">
      <div className="flex items-center gap-2">
        <span>{formatted}</span>
        <span className="text-white/30">|</span>
        <span className="font-medium">{roomName}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={copyInviteLink}
          title="Copiar link da sala"
          className="flex size-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/15"
        >
          <UserPlus className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => setPanelOpen((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-white/10 py-1 pr-3 pl-1 transition-colors hover:bg-white/15"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-800 text-xs font-medium">
            {participants.length}
          </span>
        </button>
      </div>

      {panelOpen && (
        <ParticipantsPanel onClose={() => setPanelOpen(false)} position="below" slug={slug} />
      )}
    </div>
  );
}
