"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { roomSchema, type RoomInput } from "@/lib/validators/room";
import { isAdminSession } from "@/lib/auth";

export type RoomActionResult = { error?: string } | { success: true };

async function requireAdmin() {
  if (!(await isAdminSession())) {
    throw new Error("Não autorizado.");
  }
}

export async function createRoomAction(input: RoomInput): Promise<RoomActionResult> {
  await requireAdmin();
  const parsed = roomSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.room.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { error: "Já existe uma sala com esse link." };
  }

  await prisma.room.create({ data: parsed.data });
  revalidatePath("/salas");
  return { success: true };
}

export async function updateRoomAction(id: string, input: RoomInput): Promise<RoomActionResult> {
  await requireAdmin();
  const parsed = roomSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.room.findUnique({ where: { slug: parsed.data.slug } });
  if (existing && existing.id !== id) {
    return { error: "Já existe uma sala com esse link." };
  }

  await prisma.room.update({ where: { id }, data: parsed.data });
  revalidatePath("/salas");
  return { success: true };
}

export async function deleteRoomAction(id: string): Promise<RoomActionResult> {
  await requireAdmin();
  await prisma.room.delete({ where: { id } });
  revalidatePath("/salas");
  return { success: true };
}
