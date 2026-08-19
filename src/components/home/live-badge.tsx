"use client";

import { useIsLive } from "./live-status-context";

export function LiveBadge({ slug, color }: { slug: string; color: string }) {
  const isLive = useIsLive(slug);
  if (!isLive) return null;

  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
      style={{ background: color }}
    >
      Ao vivo
    </span>
  );
}
