"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { roomSchema, type RoomInput } from "@/lib/validators/room";
import { requireAdmin, getSession, getCurrentUser } from "@/lib/auth";
import { getAppSettings } from "@/lib/queries/app-settings";

export type RoomActionResult = { error?: string } | { success: true };

export async function createRoomAction(input: RoomInput): Promise<RoomActionResult> {
  const session = await requireAdmin();
  const parsed = roomSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.room.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { error: "Já existe uma sala com esse link." };
  }

  await prisma.room.create({ data: { ...parsed.data, createdByUserId: session.sub } });
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

function generateInstantSlug() {
  return `sala-${Math.random().toString(36).slice(2, 8)}`;
}

export async function createInstantRoomAction() {
  const session = await getSession();
  if (!session) throw new Error("Não autorizado.");
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autorizado.");

  const settings = await getAppSettings();
  const room = await prisma.room.create({
    data: {
      name: `Sala de ${user.name}`,
      slug: generateInstantSlug(),
      hostName: user.name,
      maxParticipants: settings.defaultMaxParticipants,
      muteOnEntry: settings.defaultMuteOnEntry,
      cameraOnEntry: settings.defaultCameraOnEntry,
      allowScreenShare: settings.defaultAllowScreenShare,
      waitingRoom: settings.defaultWaitingRoom,
      isInstant: true,
      createdByUserId: user.id,
    },
  });

  redirect(`/sala/${room.slug}`);
}
