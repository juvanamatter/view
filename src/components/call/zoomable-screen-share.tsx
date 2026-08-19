"use client";

import { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { FocusLayout } from "@livekit/components-react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const STEP = 0.5;

export function ZoomableScreenShare({
  trackRef,
}: {
  trackRef: Parameters<typeof FocusLayout>[0]["trackRef"];
}) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="group relative size-full overflow-hidden" style={{ borderRadius: "var(--lk-border-radius)" }}>
      <div className="size-full overflow-auto">
        <div style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
          <FocusLayout trackRef={trackRef} />
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full bg-black/60 p-1 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - STEP).toFixed(1)))}
          disabled={zoom <= MIN_ZOOM}
          className="flex size-7 items-center justify-center rounded-full text-white hover:bg-white/15 disabled:opacity-40"
        >
          <ZoomOut className="size-4" />
        </button>
        <span className="w-8 text-center text-xs text-white">{zoom.toFixed(1)}x</span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + STEP).toFixed(1)))}
          disabled={zoom >= MAX_ZOOM}
          className="flex size-7 items-center justify-center rounded-full text-white hover:bg-white/15 disabled:opacity-40"
        >
          <ZoomIn className="size-4" />
        </button>
        {zoom > 1 && (
          <button
            type="button"
            onClick={() => setZoom(1)}
            title="Restaurar"
            className="flex size-7 items-center justify-center rounded-full text-white hover:bg-white/15"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
