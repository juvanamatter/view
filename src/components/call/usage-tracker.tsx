"use client";

import { useEffect } from "react";

export function UsageTracker({ userId }: { userId: string | null }) {
  useEffect(() => {
    if (!userId) return;
    const start = Date.now();

    function report() {
      const seconds = Math.round((Date.now() - start) / 1000);
      if (seconds < 1) return;
      navigator.sendBeacon(
        "/api/stats/session-time",
        new Blob([JSON.stringify({ seconds })], { type: "application/json" })
      );
    }

    window.addEventListener("pagehide", report);
    return () => {
      report();
      window.removeEventListener("pagehide", report);
    };
  }, [userId]);

  return null;
}
