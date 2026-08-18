"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { userSchema, type UserInput } from "@/lib/validators/user";
import { requireAdmin } from "@/lib/auth";

export type UserActionResult = { error?: string } | { success: true };

export async function createUserAction(input: UserInput): Promise<UserActionResult> {
  await requireAdmin();
  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  if (!parsed.data.password) {
    return { error: "Defina uma senha para o novo usuário." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe um usuário com esse e-mail." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
      role: parsed.data.role,
      jobTitle: parsed.data.jobTitle,
      photoUrl: parsed.data.photoUrl,
      photoPositionX: parsed.data.photoPositionX,
      photoPositionY: parsed.data.photoPositionY,
      photoZoom: parsed.data.photoZoom,
    },
  });
  revalidatePath("/usuarios");
  return { success: true };
}

export async function updateUserAction(id: string, input: UserInput): Promise<UserActionResult> {
  await requireAdmin();
  const parsed = userSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== id) {
    return { error: "Já existe um usuário com esse e-mail." };
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email,
      role: parsed.data.role,
      jobTitle: parsed.data.jobTitle,
      photoUrl: parsed.data.photoUrl,
      ...(parsed.data.password ? { passwordHash: await bcrypt.hash(parsed.data.password, 10) } : {}),
    },
  });
  revalidatePath("/usuarios");
  return { success: true };
}

export async function deleteUserAction(id: string): Promise<UserActionResult> {
  const session = await requireAdmin();
  if (session.sub === id) {
    return { error: "Você não pode excluir a própria conta." };
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/usuarios");
  return { success: true };
}
