"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import type { AppSettings } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateBrandSettingsAction } from "@/lib/actions/app-settings";
import type { BrandSettingsInput } from "@/lib/validators/app-settings";

export function BrandSettingsForm({ settings }: { settings: AppSettings }) {
  const [form, setForm] = useState<BrandSettingsInput>({
    brandName: settings.brandName,
    logoUrl: settings.logoUrl,
    primaryColor: settings.primaryColor,
  });
  const [pending, setPending] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof BrandSettingsInput>(key: K, value: BrandSettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/settings/logo", { method: "POST", body: formData });
    setUploadingLogo(false);
    if (!res.ok) {
      toast.error("Não foi possível enviar a logo.");
      return;
    }
    const data = await res.json();
    update("logoUrl", data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await updateBrandSettingsAction(form);
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    toast.success("Marca atualizada.");
  }

  return (
    <Card className="glass-card max-w-xl">
      <CardHeader>
        <CardTitle>Marca e visual</CardTitle>
        <CardDescription>
          Nome, logo e cor principal usados em todo o produto (header, tela de login, botões).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Logo</Label>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logoUrl ?? "/matter-logo.png"}
                alt="Logo atual"
                className="h-8 w-auto rounded bg-white/5 px-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadingLogo ? "Enviando..." : "Trocar logo"}
              </Button>
              {form.logoUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => update("logoUrl", null)}>
                  Usar padrão
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>

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
            <Label htmlFor="primaryColor">Cor principal</Label>
            <div className="flex items-center gap-2">
              <input
                id="primaryColor"
                type="color"
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="h-8 w-14 cursor-pointer rounded-lg border border-input bg-transparent"
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="w-28 font-mono"
                maxLength={7}
              />
              <span className="text-xs text-muted-foreground">
                Botões, links e destaques em todo o produto.
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar marca"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
