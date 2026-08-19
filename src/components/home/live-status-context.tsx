"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const LiveStatusContext = createContext<Record<string, number>>({});

export function LiveStatusProvider({ slugs, children }: { slugs: string[]; children: ReactNode }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const slugsKey = slugs.join(",");

  useEffect(() => {
    if (!slugsKey) return;
    fetch(`/api/rooms/live-status?slugs=${slugsKey}`)
      .then((r) => r.json())
      .then((data) => setCounts(data.counts ?? {}))
      .catch(() => {});
  }, [slugsKey]);

  return <LiveStatusContext.Provider value={counts}>{children}</LiveStatusContext.Provider>;
}

export function useIsLive(slug: string) {
  const counts = useContext(LiveStatusContext);
  return (counts[slug] ?? 0) > 0;
}
