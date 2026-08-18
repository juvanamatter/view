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

function ColorField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-14 cursor-pointer rounded-lg border border-input bg-transparent"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="w-28 font-mono" maxLength={7} />
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function BrandSettingsForm({ settings }: { settings: AppSettings }) {
  const [form, setForm] = useState<BrandSettingsInput>({
    brandName: settings.brandName,
    logoUrl: settings.logoUrl,
    primaryColor: settings.primaryColor,
    salasColor: settings.salasColor,
    usuariosColor: settings.usuariosColor,
    configuracoesColor: settings.configuracoesColor,
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
          Nome, logo e cores usados em todo o produto (header, tela de login, botões).
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

          <ColorField
            id="primaryColor"
            label="Cor principal"
            hint="Botões, links e destaques em todo o produto."
            value={form.primaryColor}
            onChange={(v) => update("primaryColor", v)}
          />

          <div className="space-y-3 rounded-lg border border-border p-3">
            <p className="text-sm font-medium">Cores do menu</p>
            <ColorField
              id="salasColor"
              label="Salas"
              value={form.salasColor}
              onChange={(v) => update("salasColor", v)}
            />
            <ColorField
              id="usuariosColor"
              label="Usuários"
              value={form.usuariosColor}
              onChange={(v) => update("usuariosColor", v)}
            />
            <ColorField
              id="configuracoesColor"
              label="Configurações"
              value={form.configuracoesColor}
              onChange={(v) => update("configuracoesColor", v)}
            />
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
