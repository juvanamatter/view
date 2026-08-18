import { prisma } from "@/lib/prisma";

export const ONLINE_WINDOW_MS = 60_000;

export async function getUsersWithPresence() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      jobTitle: true,
      photoUrl: true,
      photoPositionX: true,
      photoPositionY: true,
      photoZoom: true,
      lastSeenAt: true,
    },
    orderBy: [{ lastSeenAt: { sort: "desc", nulls: "last" } }, { name: "asc" }],
  });

  const cutoff = Date.now() - ONLINE_WINDOW_MS;
  return users.map((user) => ({
    ...user,
    online: Boolean(user.lastSeenAt && user.lastSeenAt.getTime() >= cutoff),
  }));
}
