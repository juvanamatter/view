import { prisma } from "@/lib/prisma";

const ONLINE_WINDOW_MS = 60_000;

export function getOnlineUsers() {
  return prisma.user.findMany({
    where: { lastSeenAt: { gte: new Date(Date.now() - ONLINE_WINDOW_MS) } },
    select: {
      id: true,
      name: true,
      jobTitle: true,
      photoUrl: true,
      photoPositionX: true,
      photoPositionY: true,
      photoZoom: true,
    },
    orderBy: { name: "asc" },
  });
}
