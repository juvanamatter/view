"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function LoginForm({
  from,
  logoUrl,
  brandName,
}: {
  from?: string;
  logoUrl: string;
  brandName: string;
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, undefined);

  return (
    <Card className="glass-card w-full max-w-sm">
      <CardHeader>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={brandName} className="mb-2 h-7 w-auto" />
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse com o e-mail e senha cadastrados pelo administrador.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="from" value={from ?? ""} />
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Label htmlFor="remember" className="cursor-pointer font-normal">
            <Checkbox id="remember" name="remember" />
            Manter conectado neste dispositivo
          </Label>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
