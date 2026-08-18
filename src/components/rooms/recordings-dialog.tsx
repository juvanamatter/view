"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Trash2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";

type Recording = {
  id: string;
  status: string;
  durationSec: number | null;
  startedAt: string;
  downloadUrl: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  STARTING: "Iniciando...",
  ACTIVE: "Gravando",
  ENDING: "Finalizando...",
  COMPLETE: "Pronta",
  FAILED: "Falhou",
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}min ${s}s`;
}

function RecordingsList({ slug }: { slug: string }) {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/rooms/${slug}/recordings`)
      .then((r) => r.json())
      .then((data) => setRecordings(data.recordings ?? []))
      .catch(() => toast.error("Não foi possível carregar as gravações."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/rooms/${slug}/recordings/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Não foi possível excluir a gravação.");
      return;
    }
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    toast.success("Gravação excluída.");
  }

  if (loading) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Carregando...</p>;
  }

  if (recordings.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhuma gravação feita nesta sala ainda.
      </p>
    );
  }

  return (
    <div className="max-h-80 space-y-2 overflow-y-auto">
      {recordings.map((recording) => (
        <div
          key={recording.id}
          className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Video className="size-4 shrink-0 text-primary" />
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm">{formatDateTime(recording.startedAt)}</span>
              <span className="text-xs text-muted-foreground">
                {formatDuration(recording.durationSec)}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant={recording.status === "COMPLETE" ? "default" : "secondary"}>
              {STATUS_LABEL[recording.status] ?? recording.status}
            </Badge>
            {recording.downloadUrl && (
              <Button size="icon-sm" variant="ghost" render={<a href={recording.downloadUrl} />}>
                <Download className="size-4" />
              </Button>
            )}
            <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(recording.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecordingsDialog({
  slug,
  open,
  onOpenChange,
}: {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gravações</DialogTitle>
          <DialogDescription>
            Os arquivos ficam num armazenamento privado — o link de download expira em 1 hora.
          </DialogDescription>
        </DialogHeader>

        {open && <RecordingsList key={slug} slug={slug} />}
      </DialogContent>
    </Dialog>
  );
}
