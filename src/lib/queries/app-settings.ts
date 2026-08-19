import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getAppSettings = cache(async () => {
  const existing = await prisma.appSettings.findFirst();
  if (existing) return existing;
  return prisma.appSettings.create({ data: {} });
});
