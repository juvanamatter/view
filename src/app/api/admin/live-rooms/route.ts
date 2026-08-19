import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getRoomServiceClient } from "@/lib/livekit";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const svc = getRoomServiceClient();
  const liveRooms = await svc.listRooms().catch(() => []);
  if (liveRooms.length === 0) {
    return NextResponse.json({ rooms: [] });
  }

  const dbRooms = await prisma.room.findMany({
    where: { slug: { in: liveRooms.map((r) => r.name) } },
    select: { slug: true, name: true },
  });
  const nameBySlug = new Map(dbRooms.map((r) => [r.slug, r.name]));

  const rooms = await Promise.all(
    liveRooms.map(async (r) => {
      const participants = await svc.listParticipants(r.name).catch(() => []);
      return {
        slug: r.name,
        name: nameBySlug.get(r.name) ?? r.name,
        startedAt: new Date(Number(r.creationTime) * 1000).toISOString(),
        participants: participants.map((p) => ({
          identity: p.identity,
          name: p.name || p.identity,
        })),
      };
    })
  );

  rooms.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  return NextResponse.json({ rooms });
}
