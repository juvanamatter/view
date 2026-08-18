"use client";

import { useActionState } from "react";
import { adminLoginAction, type AdminLoginState } from "@/lib/actions/admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function AdminLoginForm({ from }: { from?: string }) {
  const [state, formAction, pending] = useActionState<AdminLoginState, FormData>(
    adminLoginAction,
    undefined
  );

  return (
    <Card className="glass-card w-full max-w-sm">
      <CardHeader>
        <CardTitle>Área administrativa</CardTitle>
        <CardDescription>Gerencie salas e configurações de reunião.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="from" value={from ?? ""} />
          <div className="space-y-1.5">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required autoFocus />
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
