"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
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
import { UserAvatar } from "@/components/shared/user-avatar";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import type { UserInput } from "@/lib/validators/user";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle: string | null;
  photoUrl: string | null;
};

function buildInitialForm(user: UserRecord | undefined): UserInput {
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    password: "",
    role: (user?.role as "ADMIN" | "USER") ?? "USER",
    jobTitle: user?.jobTitle ?? null,
    photoUrl: user?.photoUrl ?? null,
  };
}

function UserForm({ user, onSaved }: { user?: UserRecord; onSaved: () => void }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState<UserInput>(() => buildInitialForm(user));
  const [pending, setPending] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof UserInput>(key: K, value: UserInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/users/avatar", { method: "POST", body: formData });
    setUploadingPhoto(false);
    if (!res.ok) {
      toast.error("Não foi possível enviar a foto.");
      return;
    }
    const data = await res.json();
    update("photoUrl", data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = isEdit && user ? await updateUserAction(user.id, form) : await createUserAction(form);
    setPending(false);
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    toast.success(isEdit ? "Usuário atualizado." : "Usuário criado.");
    onSaved();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4 pb-4">
      <div className="flex items-center gap-3">
        <UserAvatar name={form.name || "?"} photoUrl={form.photoUrl} className="size-14 text-lg" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploadingPhoto}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadingPhoto ? "Enviando..." : "Trocar foto"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="jobTitle">Cargo</Label>
        <Input
          id="jobTitle"
          value={form.jobTitle ?? ""}
          onChange={(e) => update("jobTitle", e.target.value || null)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{isEdit ? "Nova senha (opcional)" : "Senha"}</Label>
        <Input
          id="password"
          type="password"
          value={form.password ?? ""}
          onChange={(e) => update("password", e.target.value)}
          placeholder={isEdit ? "Deixe em branco para manter a atual" : undefined}
          required={!isEdit}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="role">Perfil de acesso</Label>
        <select
          id="role"
          value={form.role}
          onChange={(e) => update("role", e.target.value as "ADMIN" | "USER")}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
        >
          <option value="USER" className="bg-popover">
            Usuário
          </option>
          <option value="ADMIN" className="bg-popover">
            Administrador
          </option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <SheetFooter className="px-0">
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar usuário"}
        </Button>
      </SheetFooter>
    </form>
  );
}

export function UserFormSheet({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserRecord;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{user ? "Editar usuário" : "Novo usuário"}</SheetTitle>
          <SheetDescription>
            {user
              ? "Atualize os dados de acesso e o perfil deste usuário."
              : "Crie um acesso para alguém entrar com e-mail e senha."}
          </SheetDescription>
        </SheetHeader>
        {open && <UserForm key={user?.id ?? "new"} user={user} onSaved={() => onOpenChange(false)} />}
      </SheetContent>
    </Sheet>
  );
}
