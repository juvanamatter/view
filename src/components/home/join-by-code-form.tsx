"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function extractSlug(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("sala");
    return idx !== -1 && parts[idx + 1] ? parts[idx + 1] : (parts.at(-1) ?? null);
  } catch {
    return trimmed.replace(/^\/?(sala\/)?/, "");
  }
}

export function JoinByCodeForm() {
  const [value, setValue] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = extractSlug(value);
    if (!slug) return;
    router.push(`/sala/${slug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ex.: matter-abc123 ou o link da sala"
        className="flex-1 border-white/10 bg-black/20"
      />
      <Button
        type="submit"
        disabled={!value.trim()}
        className="bg-gradient-to-br from-fuchsia-500 to-purple-600 hover:opacity-90"
      >
        Entrar
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
