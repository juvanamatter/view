"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import type { ParticipantTileProps } from "@livekit/components-react";
import { ParticipantTileWithAvatar } from "./participant-tile-with-avatar";

const ZOOM_LEVELS = [1, 1.5, 2];

export function ZoomableParticipantTile(props: ParticipantTileProps) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const zoom = ZOOM_LEVELS[zoomIndex];

  function cycleZoom(e: React.MouseEvent) {
    e.stopPropagation();
    setZoomIndex((i) => (i + 1) % ZOOM_LEVELS.length);
  }

  return (
    <div className="lk-tile-frame group relative overflow-hidden" style={{ borderRadius: "var(--lk-border-radius)" }}>
      <div className="size-full transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
        <ParticipantTileWithAvatar {...props} />
      </div>
      <button
        type="button"
        onClick={cycleZoom}
        title={zoom === 1 ? "Dar zoom" : `Zoom ${zoom}x — clique para ajustar`}
        className="absolute top-2 left-2 z-10 flex size-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100"
      >
        {zoom > 1 ? <ZoomOut className="size-3.5" /> : <ZoomIn className="size-3.5" />}
      </button>
    </div>
  );
}
