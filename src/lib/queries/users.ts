import { prisma } from "@/lib/prisma";

const PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  jobTitle: true,
  photoUrl: true,
  photoPositionX: true,
  photoPositionY: true,
  photoZoom: true,
  activeSeconds: true,
  screenShareCount: true,
  createdAt: true,
} as const;

export function getUserList() {
  return prisma.user.findMany({
    select: PUBLIC_SELECT,
    orderBy: { createdAt: "asc" },
  });
}

export function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_SELECT });
}

export function getUserByEmailWithPassword(email: string) {
  return prisma.user.findUnique({ where: { email } });
}
