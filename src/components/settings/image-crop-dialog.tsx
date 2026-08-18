"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type CropPosition = { x: number; y: number; zoom: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function ImageCropBody({
  imageUrl,
  aspect,
  outputWidth,
  onCancel,
  onSave,
}: {
  imageUrl: string;
  aspect: number;
  outputWidth: number;
  onCancel: () => void;
  onSave: (blob: Blob) => Promise<void> | void;
}) {
  const [pos, setPos] = useState<CropPosition>({ x: 50, y: 50, zoom: 1 });
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
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

  async function handleApply() {
    const img = imgRef.current;
    if (!img) return;
    setSaving(true);
    try {
      const outW = outputWidth;
      const outH = Math.round(outputWidth / aspect);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no-canvas-ctx");

      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const coverScale = Math.max(outW / iw, outH / ih);
      const scale = coverScale * pos.zoom;
      const dw = iw * scale;
      const dh = ih * scale;
      const offsetX = (dw - outW) * (pos.x / 100);
      const offsetY = (dh - outH) * (pos.y / 100);

      ctx.drawImage(img, -offsetX, -offsetY, dw, dh);

      const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("no-blob");
      await onSave(blob);
    } catch {
      toast.error("Não foi possível processar essa imagem. Tente enviar o arquivo novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative mx-auto w-full touch-none overflow-hidden rounded-lg bg-muted [cursor:grab] active:[cursor:grabbing]"
        style={{ aspectRatio: aspect }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt=""
          draggable={false}
          crossOrigin="anonymous"
          className="absolute inset-0 size-full select-none object-cover"
          style={{ objectPosition: `${pos.x}% ${pos.y}%`, transform: `scale(${pos.zoom})` }}
        />
      </div>

      <div className="space-y-1.5 px-1">
        <label className="text-xs text-muted-foreground">Zoom</label>
        <input
          type="range"
          min={1}
          max={4}
          step={0.05}
          value={pos.zoom}
          onChange={(e) => setPos((p) => ({ ...p, zoom: Number(e.target.value) }))}
          className="w-full accent-primary"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleApply} disabled={saving}>
          {saving ? "Processando..." : "Aplicar"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageUrl,
  aspect,
  outputWidth = 1200,
  title,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  aspect: number;
  outputWidth?: number;
  title: string;
  onSave: (blob: Blob) => Promise<void> | void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Arraste a imagem para enquadrar e ajuste o zoom.</DialogDescription>
        </DialogHeader>

        {open && (
          <ImageCropBody
            key={imageUrl}
            imageUrl={imageUrl}
            aspect={aspect}
            outputWidth={outputWidth}
            onCancel={() => onOpenChange(false)}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
