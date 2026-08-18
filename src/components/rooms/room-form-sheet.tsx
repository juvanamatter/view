"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Room } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createRoomAction, updateRoomAction } from "@/lib/actions/rooms";
import { slugify } from "@/lib/utils";
import type { RoomInput } from "@/lib/validators/room";

export type RoomDefaults = {
  maxParticipants: number;
  muteOnEntry: boolean;
  cameraOnEntry: boolean;
  allowScreenShare: boolean;
  waitingRoom: boolean;
};

function buildInitialForm(room: Room | undefined, defaults: RoomDefaults): RoomInput {
  return {
    name: room?.name ?? "",
    slug: room?.slug ?? "",
    hostName: room?.hostName ?? "",
    password: room?.password ?? null,
    maxParticipants: room?.maxParticipants ?? defaults.maxParticipants,
    muteOnEntry: room?.muteOnEntry ?? defaults.muteOnEntry,
    cameraOnEntry: room?.cameraOnEntry ?? defaults.cameraOnEntry,
    allowScreenShare: room?.allowScreenShare ?? defaults.allowScreenShare,
    waitingRoom: room?.waitingRoom ?? defaults.waitingRoom,
    isActive: room?.isActive ?? true,
  };
}

function RoomForm({
  room,
  defaults,
  onSaved,
}: {
  room?: Room;
  defaults: RoomDefaults;
  onSaved: () => void;
}) {
  const isEdit = Boolean(room);
  const [form, setForm] = useState<RoomInput>(() => buildInitialForm(room, defaults));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof RoomInput>(key: K, value: RoomInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result =
      isEdit && room ? await updateRoomAction(room.id, form) : await createRoomAction(form);
    setPending(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Sala atualizada." : "Sala criada.");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nome da sala</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            update("name", name);
            if (!slugTouched) update("slug", slugify(name));
          }}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="slug">Link da sala</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => {
            setSlugTouched(true);
            update("slug", slugify(e.target.value));
          }}
          required
        />
        <p className="text-xs text-muted-foreground">/sala/{form.slug || "sua-sala"}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="hostName">Anfitrião</Label>
        <Input
          id="hostName"
          value={form.hostName}
          onChange={(e) => update("hostName", e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Senha (opcional)</Label>
        <Input
          id="password"
          value={form.password ?? ""}
          onChange={(e) => update("password", e.target.value || null)}
          placeholder="Deixe em branco para não exigir senha"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="maxParticipants">Máximo de participantes</Label>
        <Input
          id="maxParticipants"
          type="number"
          min={2}
          max={100}
          value={form.maxParticipants}
          onChange={(e) => update("maxParticipants", Number(e.target.value))}
          required
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-medium">Entrar com câmera ligada</p>
          <p className="text-xs text-muted-foreground">Padrão ao entrar na sala.</p>
        </div>
        <Switch checked={form.cameraOnEntry} onCheckedChange={(v) => update("cameraOnEntry", v)} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <p className="text-sm font-medium">Entrar com microfone mudo</p>
        <Switch checked={form.muteOnEntry} onCheckedChange={(v) => update("muteOnEntry", v)} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <p className="text-sm font-medium">Permitir compartilhar tela</p>
        <Switch
          checked={form.allowScreenShare}
          onCheckedChange={(v) => update("allowScreenShare", v)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-medium">Sala de espera</p>
          <p className="text-xs text-muted-foreground">
            Participantes aguardam sua aprovação para entrar.
          </p>
        </div>
        <Switch checked={form.waitingRoom} onCheckedChange={(v) => update("waitingRoom", v)} />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div>
          <p className="text-sm font-medium">Sala ativa</p>
          <p className="text-xs text-muted-foreground">
            Desative para impedir novas entradas sem apagar a sala.
          </p>
        </div>
        <Switch checked={form.isActive} onCheckedChange={(v) => update("isActive", v)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <SheetFooter className="px-0">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar sala"}
        </Button>
      </SheetFooter>
    </form>
  );
}

export function RoomFormSheet({
  open,
  onOpenChange,
  room,
  defaults,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room;
  defaults: RoomDefaults;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{room ? "Editar sala" : "Nova sala"}</SheetTitle>
          <SheetDescription>
            Configure o link e as regras de entrada desta reunião.
          </SheetDescription>
        </SheetHeader>
        {open && (
          <RoomForm
            key={room?.id ?? "new"}
            room={room}
            defaults={defaults}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
