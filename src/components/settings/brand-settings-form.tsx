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
import { ImageCropDialog } from "./image-crop-dialog";

type CropTarget = "logo" | "favicon";

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
    faviconUrl: settings.faviconUrl,
    primaryColor: settings.primaryColor,
    salasColor: settings.salasColor,
    usuariosColor: settings.usuariosColor,
    configuracoesColor: settings.configuracoesColor,
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crop, setCrop] = useState<{ target: CropTarget; source: string } | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof BrandSettingsInput>(key: K, value: BrandSettingsInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFileSelected(target: CropTarget) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setCrop({ target, source: URL.createObjectURL(file) });
    };
  }

  async function handleCropSave(blob: Blob) {
    if (!crop) return;
    const { target, source } = crop;
    const formData = new FormData();
    formData.append("file", new File([blob], `${target}.png`, { type: "image/png" }));
    const res = await fetch("/api/settings/logo", { method: "POST", body: formData });
    if (source.startsWith("blob:")) URL.revokeObjectURL(source);
    if (!res.ok) {
      toast.error("Não foi possível enviar a imagem.");
      return;
    }
    const data = await res.json();
    update(target === "logo" ? "logoUrl" : "faviconUrl", data.url);
    setCrop(null);
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
              <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                Trocar logo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCrop({ target: "logo", source: form.logoUrl ?? "/matter-logo.png" })}
              >
                Ajustar
              </Button>
              {form.logoUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => update("logoUrl", null)}>
                  Usar padrão
                </Button>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected("logo")}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Ícone da aba (favicon)</Label>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.faviconUrl ?? "/icon.png"}
                alt="Favicon atual"
                className="size-8 rounded bg-white/5 object-contain p-0.5"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => faviconInputRef.current?.click()}>
                Trocar ícone
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCrop({ target: "favicon", source: form.faviconUrl ?? "/icon.png" })}
              >
                Ajustar
              </Button>
              {form.faviconUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => update("faviconUrl", null)}>
                  Usar padrão
                </Button>
              )}
            </div>
            <input
              ref={faviconInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected("favicon")}
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

      <ImageCropDialog
        open={crop !== null}
        onOpenChange={(open) => {
          if (!open) setCrop(null);
        }}
        imageUrl={crop?.source ?? ""}
        aspect={crop?.target === "favicon" ? 1 : 3}
        outputWidth={crop?.target === "favicon" ? 512 : 1200}
        title={crop?.target === "favicon" ? "Ajustar ícone da aba" : "Ajustar logo"}
        onSave={handleCropSave}
      />
    </Card>
  );
}
