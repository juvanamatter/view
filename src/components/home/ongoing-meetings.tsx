"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";

type Candidate = { id: string; name: string; slug: string };

export function OngoingMeetings({ candidates }: { candidates: Candidate[] }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const slugsKey = candidates.map((c) => c.slug).join(",");

  useEffect(() => {
    if (!slugsKey) return;
    fetch(`/api/rooms/live-status?slugs=${slugsKey}`)
      .then((r) => r.json())
      .then((data) => setCounts(data.counts ?? {}))
      .catch(() => {});
  }, [slugsKey]);

  const live = candidates
    .map((c) => ({ ...c, count: counts[c.slug] ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  if (live.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-muted-foreground">Acontecendo agora</h2>
      <div className="glass-card divide-y divide-border">
        {live.map((room) => (
          <div key={room.id} className="flex items-center gap-3 p-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-purple-600">
              <Video className="size-4 text-white" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <span className="truncate font-medium">
                {room.name} está rolando com {room.count} {room.count === 1 ? "pessoa" : "pessoas"}
              </span>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-br from-fuchsia-500 to-purple-600"
              render={<Link href={`/sala/${room.slug}`} />}
            >
              Entrar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
