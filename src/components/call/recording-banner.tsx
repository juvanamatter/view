"use client";

import { useRecording } from "./recording-context";

export function RecordingBanner() {
  const { active } = useRecording();
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed top-4 left-4 z-50 flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur">
      <span className="size-2 animate-pulse rounded-full bg-white" />
      Gravando
    </div>
  );
}
