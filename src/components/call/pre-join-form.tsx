"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { CallSession } from "@/lib/call-types";

export function PreJoinForm({
  slug,
  roomName,
  hasPassword,
  waitingRoom,
  onJoined,
}: {
  slug: string;
  roomName: string;
  hasPassword: boolean;
  waitingRoom: boolean;
  onJoined: (session: CallSession) => void;
}) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, participantName: name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar na sala.");
        return;
      }
      onJoined(data as CallSession);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="glass-card w-full max-w-sm">
        <CardHeader>
          <CardTitle>{roomName}</CardTitle>
          <CardDescription>
            {waitingRoom
              ? "Esta sala tem aprovação do anfitrião. Você aguardará até ser admitido."
              : "Informe seu nome para entrar na reunião."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Seu nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como você quer aparecer na chamada"
                required
                autoFocus
              />
            </div>
            {hasPassword && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Senha da sala</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar na reunião"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
