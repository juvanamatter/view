"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validators/user";
import { createSession, destroySession } from "@/lib/auth";
import { getUserByEmailWithPassword } from "@/lib/queries/users";

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const user = await getUserByEmailWithPassword(parsed.data.email.toLowerCase());
  if (!user) {
    return { error: "E-mail ou senha incorretos." };
  }
  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "E-mail ou senha incorretos." };
  }

  await createSession(user.id, user.role, parsed.data.remember);

  const from = formData.get("from");
  redirect(typeof from === "string" && from.startsWith("/") ? from : "/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/entrar");
}
