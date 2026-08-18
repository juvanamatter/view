"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { slugify } from "@/lib/utils";

function extractSlug(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? "";
  } catch {
    return slugify(trimmed);
  }
}

export function JoinByLinkForm() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const slug = extractSlug(value);
    if (slug) router.push(`/sala/${slug}`);
  }

  return (
    <Card className="glass-card">
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Cole o link ou código da sala"
            aria-label="Link ou código da sala"
          />
          <Button type="submit">Entrar</Button>
        </form>
      </CardContent>
    </Card>
  );
}
