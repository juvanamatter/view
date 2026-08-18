"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type PhotoPosition = { x: number; y: number; zoom: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function PhotoRepositionBody({
  photoUrl,
  initial,
  onCancel,
  onSave,
}: {
  photoUrl: string;
  initial: PhotoPosition;
  onCancel: () => void;
  onSave: (position: PhotoPosition) => void;
}) {
  const [pos, setPos] = useState<PhotoPosition>(initial);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null
  );

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = (((e.clientX - drag.startX) / rect.width) * 100) / pos.zoom;
    const dy = (((e.clientY - drag.startY) / rect.height) * 100) / pos.zoom;
    setPos((p) => ({ ...p, x: clamp(drag.origX - dx, 0, 100), y: clamp(drag.origY - dy, 0, 100) }));
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  return (
    <>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative mx-auto size-56 touch-none overflow-hidden rounded-full bg-muted [cursor:grab] active:[cursor:grabbing]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full select-none object-cover"
          style={{ objectPosition: `${pos.x}% ${pos.y}%`, transform: `scale(${pos.zoom})` }}
        />
      </div>

      <div className="space-y-1.5 px-1">
        <label className="text-xs text-muted-foreground">Zoom</label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={pos.zoom}
          onChange={(e) => setPos((p) => ({ ...p, zoom: Number(e.target.value) }))}
          className="w-full accent-primary"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={() => onSave(pos)}>Aplicar</Button>
      </DialogFooter>
    </>
  );
}

export function PhotoRepositionDialog({
  open,
  onOpenChange,
  photoUrl,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoUrl: string;
  initial: PhotoPosition;
  onSave: (position: PhotoPosition) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reposicionar foto</DialogTitle>
          <DialogDescription>Arraste a imagem para enquadrar e ajuste o zoom.</DialogDescription>
        </DialogHeader>

        {open && (
          <PhotoRepositionBody
            key={photoUrl}
            photoUrl={photoUrl}
            initial={initial}
            onCancel={() => onOpenChange(false)}
            onSave={(position) => {
              onSave(position);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
