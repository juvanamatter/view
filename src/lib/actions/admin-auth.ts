"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminSession, destroyAdminSession } from "@/lib/auth";

const schema = z.object({
  password: z.string().min(1, "Informe a senha."),
});

export type AdminLoginState = { error?: string } | undefined;

export async function adminLoginAction(
  _prevState: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const parsed = schema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Senha inválida." };
  }
  if (parsed.data.password !== process.env.ADMIN_PASSWORD) {
    return { error: "Senha incorreta." };
  }

  await createAdminSession();

  const from = formData.get("from");
  redirect(typeof from === "string" && from.startsWith("/") ? from : "/salas");
}

export async function adminLogoutAction() {
  await destroyAdminSession();
  redirect("/");
}
