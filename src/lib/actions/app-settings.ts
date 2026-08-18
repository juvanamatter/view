"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { appSettingsSchema, type AppSettingsInput } from "@/lib/validators/app-settings";
import { isAdminSession } from "@/lib/auth";
import { getAppSettings } from "@/lib/queries/app-settings";

export async function updateAppSettingsAction(input: AppSettingsInput) {
  if (!(await isAdminSession())) {
    throw new Error("Não autorizado.");
  }
  const parsed = appSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." } as const;
  }

  const current = await getAppSettings();
  await prisma.appSettings.update({ where: { id: current.id }, data: parsed.data });
  revalidatePath("/configuracoes");
  return { success: true } as const;
}
