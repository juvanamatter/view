"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";

type LiveRoom = {
  slug: string;
  name: string;
  startedAt: string;
  participants: { identity: string; name: string }[];
};

function useElapsed(startedAt: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const diffMin = Math.max(0, Math.round((now - new Date(startedAt).getTime()) / 60_000));
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin}min`;
  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;
  return minutes === 0 ? `há ${hours}h` : `há ${hours}h${minutes}min`;
}

function LiveRoomRow({ room }: { room: LiveRoom }) {
  const elapsed = useElapsed(room.startedAt);

  return (
    <div className="flex items-start gap-3 p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600">
        <Video className="size-4 text-white" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{room.name}</span>
          <span className="shrink-0 rounded-full bg-fuchsia-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            Ao vivo
          </span>
          <span className="text-xs text-muted-foreground">rodando {elapsed}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {room.participants.length} participante{room.participants.length === 1 ? "" : "s"}
          {room.participants.length > 0 && ": "}
          {room.participants.map((p) => p.name).join(", ")}
        </p>
      </div>
    </div>
  );
}

export function LiveRoomsPanel() {
  const [rooms, setRooms] = useState<LiveRoom[] | null>(null);

  useEffect(() => {
    function load() {
      fetch("/api/admin/live-rooms")
        .then((r) => r.json())
        .then((data) => setRooms(data.rooms ?? []))
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 15_000);
    return () => clearInterval(interval);
  }, []);

  if (rooms === null) return null;

  if (rooms.length === 0) {
    return (
      <div className="glass-card p-4 text-center text-sm text-muted-foreground">
        Nenhuma reunião ao vivo agora.
      </div>
    );
  }

  return (
    <div className="glass-card divide-y divide-border">
      {rooms.map((room) => (
        <LiveRoomRow key={room.slug} room={room} />
      ))}
    </div>
  );
}
