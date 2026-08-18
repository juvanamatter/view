"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { AppSettings } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateAppSettingsAction } from "@/lib/actions/app-settings";
import type { AppSettingsInput } from "@/lib/validators/app-settings";

export function AppSettingsForm({ settings }: { settings: AppSettings }) {
  const [form, setForm] = useState<AppSettingsInput>({
    brandName: settings.brandName,
    defaultMaxParticipants: settings.defaultMaxParticipants,
    defaultMuteOnEntry: settings.defaultMuteOnEntry,
    defaultCameraOnEntry: settings.defaultCameraOnEntry,
    defaultAllowScreenShare: settings.defaultAllowScreenShare,
    defaultWaitingRoom: settings.defaultWaitingRoom,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof AppSettingsInput>(key: K, value: AppSettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await updateAppSettingsAction(form);
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    toast.success("Configurações salvas.");
  }

  return (
    <Card className="glass-card max-w-xl">
      <CardHeader>
        <CardTitle>Padrões para novas salas</CardTitle>
        <CardDescription>
          Aplicados automaticamente quando uma sala nova é criada — cada sala pode sobrescrever
          esses valores individualmente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="brandName">Nome exibido</Label>
            <Input
              id="brandName"
              value={form.brandName}
              onChange={(e) => update("brandName", e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="defaultMaxParticipants">Máximo de participantes padrão</Label>
            <Input
              id="defaultMaxParticipants"
              type="number"
              min={2}
              max={100}
              value={form.defaultMaxParticipants}
              onChange={(e) => update("defaultMaxParticipants", Number(e.target.value))}
              required
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Entrar com câmera ligada</p>
            <Switch
              checked={form.defaultCameraOnEntry}
              onCheckedChange={(v) => update("defaultCameraOnEntry", v)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Entrar com microfone mudo</p>
            <Switch
              checked={form.defaultMuteOnEntry}
              onCheckedChange={(v) => update("defaultMuteOnEntry", v)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Permitir compartilhar tela</p>
            <Switch
              checked={form.defaultAllowScreenShare}
              onCheckedChange={(v) => update("defaultAllowScreenShare", v)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Sala de espera</p>
            <Switch
              checked={form.defaultWaitingRoom}
              onCheckedChange={(v) => update("defaultWaitingRoom", v)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar configurações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
