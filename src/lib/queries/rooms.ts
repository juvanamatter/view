import { prisma } from "@/lib/prisma";

export function getRoomList() {
  return prisma.room.findMany({ orderBy: { createdAt: "desc" } });
}

export function getRoomBySlug(slug: string) {
  return prisma.room.findUnique({ where: { slug } });
}

export function getRoomById(id: string) {
  return prisma.room.findUnique({ where: { id } });
}
