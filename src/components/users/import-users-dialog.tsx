"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type ImportResult = { created: number; skippedExisting: number; invalidRows: number[] };

export function ImportUsersDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setResult(null);
  }

  async function handleImport() {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/users/import", { method: "POST", body: formData });
    setUploading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Não foi possível importar a planilha.");
      return;
    }
    const data = (await res.json()) as ImportResult;
    setResult(data);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="size-4" />
        Importar planilha
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar usuários</DialogTitle>
          <DialogDescription>
            Planilha (.xlsx ou .csv) com colunas <strong>nome</strong>, <strong>e-mail</strong> e{" "}
            <strong>cargo</strong>. Todos entram como usuário com a senha padrão{" "}
            <strong>call123</strong>.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-1 text-sm">
            <p>{result.created} usuário(s) criado(s).</p>
            {result.skippedExisting > 0 && (
              <p className="text-muted-foreground">
                {result.skippedExisting} já existiam e foram ignorados.
              </p>
            )}
            {result.invalidRows.length > 0 && (
              <p className="text-muted-foreground">
                Linhas ignoradas por falta de nome/e-mail válido: {result.invalidRows.join(", ")}
              </p>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        )}

        <DialogFooter>
          {result ? (
            <Button onClick={() => setOpen(false)}>Fechar</Button>
          ) : (
            <Button onClick={handleImport} disabled={!file || uploading}>
              {uploading ? "Importando..." : "Importar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
