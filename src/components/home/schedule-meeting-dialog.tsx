"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createScheduledRoomAction } from "@/lib/actions/rooms";

function defaultDate() {
  return new Date().toISOString().slice(0, 10);
}

function ScheduleMeetingBody({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("09:00");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await createScheduledRoomAction({
      name,
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
    });
    setPending(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    toast.success("Reunião agendada.");
    router.refresh();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="meeting-name">Nome da reunião</Label>
        <Input
          id="meeting-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex.: Alinhamento trimestral"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="meeting-date">Data</Label>
          <Input
            id="meeting-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="meeting-time">Hora</Label>
          <Input
            id="meeting-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Agendando..." : "Agendar"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ScheduleMeetingButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full flex-col items-start gap-2 rounded-xl border border-white/10 p-4 text-left transition-colors hover:bg-white/5"
      >
        <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-800">
          <CalendarPlus className="size-4 text-white" />
        </span>
        <span className="font-medium">Agendar</span>
        <span className="text-xs text-muted-foreground">Marque para depois</span>
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agendar reunião</DialogTitle>
          <DialogDescription>Escolha um nome, data e horário.</DialogDescription>
        </DialogHeader>
        {open && <ScheduleMeetingBody onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
