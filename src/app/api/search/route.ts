import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ rooms: [], people: [] });
  }

  const [ownRooms, visitedRooms, people] = await Promise.all([
    prisma.room.findMany({
      where: { createdByUserId: user.id, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true, hostName: true },
      take: 5,
    }),
    prisma.room.findMany({
      where: {
        visits: { some: { userId: user.id } },
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true, slug: true, hostName: true },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { jobTitle: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, jobTitle: true, photoUrl: true },
      take: 5,
    }),
  ]);

  const roomsById = new Map([...ownRooms, ...visitedRooms].map((r) => [r.id, r]));

  return NextResponse.json({ rooms: Array.from(roomsById.values()), people });
}
