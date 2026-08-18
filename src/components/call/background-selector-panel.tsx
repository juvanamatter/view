"use client";

import { useEffect, useRef, useState } from "react";
import { Ban, Droplets, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useBackground } from "./background-context";

type BackgroundImage = { id: string; name: string; imageUrl: string };

export function BackgroundSelectorPanel({ onClose }: { onClose: () => void }) {
  const { selection, choose } = useBackground();
  const [images, setImages] = useState<BackgroundImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/backgrounds")
      .then((r) => r.json())
      .then((data) => setImages(data.images ?? []))
      .catch(() => {});
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const uploadedFile = e.target.files?.[0];
    e.target.value = "";
    if (!uploadedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);
    formData.append("name", uploadedFile.name);

    const res = await fetch("/api/backgrounds", { method: "POST", body: formData });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Não foi possível enviar a imagem.");
      return;
    }
    const image = (await res.json()) as BackgroundImage;
    setImages((prev) => [...prev, image]);
    choose({ mode: "image", url: image.imageUrl });
  }

  return (
    <div className="glass-panel absolute bottom-full right-0 mb-3 flex max-h-[28rem] w-72 flex-col gap-3 overflow-hidden rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Fundo virtual</p>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2 overflow-y-auto">
        <button
          type="button"
          onClick={() => choose({ mode: "none" })}
          className={cn(
            "flex aspect-video flex-col items-center justify-center gap-1 rounded-lg bg-white/5 text-xs hover:bg-white/10",
            selection.mode === "none" && "ring-2 ring-primary"
          )}
        >
          <Ban className="size-4" />
          Nenhum
        </button>
        <button
          type="button"
          onClick={() => choose({ mode: "blur" })}
          className={cn(
            "flex aspect-video flex-col items-center justify-center gap-1 rounded-lg bg-white/5 text-xs hover:bg-white/10",
            selection.mode === "blur" && "ring-2 ring-primary"
          )}
        >
          <Droplets className="size-4" />
          Desfoque
        </button>
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => choose({ mode: "image", url: image.imageUrl })}
            className={cn(
              "aspect-video overflow-hidden rounded-lg bg-cover bg-center",
              selection.mode === "image" && selection.url === image.imageUrl && "ring-2 ring-primary"
            )}
            style={{ backgroundImage: `url(${image.imageUrl})` }}
            title={image.name}
          />
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-video flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:bg-white/5"
        >
          {uploading ? <Upload className="size-4 animate-pulse" /> : <Plus className="size-4" />}
          {uploading ? "Enviando..." : "Enviar foto"}
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}
