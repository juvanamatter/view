"use client";

import { useEffect } from "react";

export function PresenceHeartbeat() {
  useEffect(() => {
    function ping() {
      fetch("/api/presence/heartbeat", { method: "POST" }).catch(() => {});
    }
    ping();
    const interval = setInterval(ping, 20_000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
