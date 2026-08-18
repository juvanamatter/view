"use client";

import { useState } from "react";
import { Search, Plus, Volume2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSoundboard, type Sound } from "./soundboard-context";

export function SoundboardPanel({ onClose }: { onClose: () => void }) {
  const { sounds, volume, setVolume, play, registerNewSound } = useSoundboard();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !newName.trim()) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", newName.trim());
    if (newEmoji.trim()) formData.append("emoji", newEmoji.trim());

    const res = await fetch("/api/soundboard", { method: "POST", body: formData });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Não foi possível adicionar o som.");
      return;
    }
    const sound = (await res.json()) as Sound;
    registerNewSound(sound);
    setAdding(false);
    setNewName("");
    setNewEmoji("");
    setFile(null);
  }

  const filtered = sounds.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="glass-panel absolute bottom-full right-0 mb-3 flex max-h-[28rem] w-80 flex-col gap-3 overflow-hidden rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Soundboard</p>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Encontre o som perfeito"
          className="pl-8"
        />
      </div>

      <div className="flex items-center gap-2">
        <Volume2 className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-primary"
          aria-label="Volume dos sons"
        />
        <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">
          {Math.round(volume * 100)}%
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">MATTER</p>
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhum som ainda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {filtered.map((sound) => (
              <button
                key={sound.id}
                type="button"
                onClick={() => play(sound)}
                className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-2 text-left text-sm hover:bg-white/10"
              >
                <span>{sound.emoji || "🔊"}</span>
                <span className="truncate">{sound.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="space-y-2 border-t border-border pt-2">
          <div className="flex gap-2">
            <Input
              value={newEmoji}
              onChange={(e) => setNewEmoji(e.target.value)}
              placeholder="🔊"
              className="w-14 text-center"
              maxLength={4}
            />
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome do som"
              required
            />
          </div>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
            className="w-full text-xs"
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={uploading} className="flex-1">
              {uploading ? "Enviando..." : "Adicionar"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setAdding(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Adicionar som
        </Button>
      )}
    </div>
  );
}
