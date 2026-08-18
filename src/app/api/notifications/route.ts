import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatScheduled } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 60 * 1000);
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [startingSoon, joins] = await Promise.all([
    prisma.room.findMany({
      where: { createdByUserId: user.id, scheduledAt: { gte: now, lte: soon } },
      select: { id: true, name: true, slug: true, scheduledAt: true },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.roomVisit.findMany({
      where: {
        room: { createdByUserId: user.id },
        userId: { not: user.id },
        joinedAt: { gte: since },
      },
      orderBy: { joinedAt: "desc" },
      take: 10,
      include: { user: { select: { name: true } }, room: { select: { name: true, slug: true } } },
    }),
  ]);

  const items = [
    ...startingSoon.map((room) => ({
      id: `soon-${room.id}`,
      text: `"${room.name}" começa ${formatScheduled(room.scheduledAt!)}`,
      href: `/sala/${room.slug}`,
      timestamp: room.scheduledAt,
    })),
    ...joins.map((visit) => ({
      id: `join-${visit.id}`,
      text: `${visit.user.name} entrou em "${visit.room.name}"`,
      href: `/sala/${visit.room.slug}`,
      timestamp: visit.joinedAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
    .slice(0, 8);

  return NextResponse.json({ items });
}
