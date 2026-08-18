"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWhiteboard } from "./whiteboard-context";

const COLORS = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#ffffff"];

export function WhiteboardOverlay({ active }: { active: boolean }) {
  const { segments, addSegment, clear } = useWhiteboard();
  const [color, setColor] = useState(COLORS[0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef<{ x: number; y: number } | null>(null);

  function redraw() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    for (const seg of segments) {
      ctx.strokeStyle = seg.color;
      ctx.beginPath();
      ctx.moveTo(seg.x0 * canvas.width, seg.y0 * canvas.height);
      ctx.lineTo(seg.x1 * canvas.width, seg.y1 * canvas.height);
      ctx.stroke();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    function resize() {
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redraw();
    }
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments]);

  function getRelativePos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!active) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = getRelativePos(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!active || !drawingRef.current) return;
    const pos = getRelativePos(e);
    addSegment({ x0: drawingRef.current.x, y0: drawingRef.current.y, x1: pos.x, y1: pos.y, color });
    drawingRef.current = pos;
  }

  function handlePointerUp() {
    drawingRef.current = null;
  }

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={cn("size-full touch-none", active && "pointer-events-auto cursor-crosshair")}
      />
      {active && (
        <div className="pointer-events-auto absolute top-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/60 px-2 py-1.5 backdrop-blur">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "size-5 rounded-full ring-2 ring-offset-1 ring-offset-black/60",
                color === c ? "ring-white" : "ring-transparent"
              )}
              style={{ background: c }}
              aria-label={`Cor ${c}`}
            />
          ))}
          <button
            type="button"
            onClick={clear}
            className="ml-1 flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20"
          >
            <Eraser className="size-3.5" />
            Limpar
          </button>
        </div>
      )}
    </div>
  );
}
