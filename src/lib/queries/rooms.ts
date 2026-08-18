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

export function getRoomsByCreator(userId: string) {
  return prisma.room.findMany({
    where: { createdByUserId: userId },
    orderBy: { createdAt: "desc" },
  });
}

export function getTeamRooms() {
  return prisma.room.findMany({
    where: { isTeamRoom: true, isActive: true },
    orderBy: { name: "asc" },
  });
}

export function getUpcomingScheduledRooms(userId: string, limit = 5) {
  return prisma.room.findMany({
    where: { createdByUserId: userId, scheduledAt: { gte: new Date() } },
    orderBy: { scheduledAt: "asc" },
    take: limit,
  });
}

export async function getRecentRoomVisits(userId: string, limit = 5) {
  const visits = await prisma.roomVisit.findMany({
    where: { userId },
    orderBy: { joinedAt: "desc" },
    take: limit * 6,
    include: { room: true },
  });

  const seen = new Set<string>();
  const result: { room: (typeof visits)[number]["room"]; joinedAt: Date }[] = [];
  for (const visit of visits) {
    if (seen.has(visit.roomId)) continue;
    seen.add(visit.roomId);
    result.push({ room: visit.room, joinedAt: visit.joinedAt });
    if (result.length >= limit) break;
  }
  return result;
}
