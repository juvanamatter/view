"use client";

import { useParticipants } from "@livekit/components-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function HostWaitingPanel({ slug }: { slug: string }) {
  const participants = useParticipants();
  const waiting = participants.filter((p) => p.permissions && !p.permissions.canSubscribe);

  async function admit(identity: string) {
    const res = await fetch(`/api/rooms/${slug}/admit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Não foi possível admitir.");
      return;
    }
    toast.success("Participante admitido.");
  }

  if (waiting.length === 0) return null;

  return (
    <div className="glass-panel fixed top-4 right-4 z-50 w-72 rounded-2xl p-4">
      <p className="mb-2 text-sm font-medium">Sala de espera ({waiting.length})</p>
      <ul className="space-y-2">
        {waiting.map((p) => (
          <li key={p.identity} className="flex items-center justify-between gap-2">
            <span className="truncate text-sm">{p.name || p.identity}</span>
            <Button size="sm" onClick={() => admit(p.identity)}>
              Admitir
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
