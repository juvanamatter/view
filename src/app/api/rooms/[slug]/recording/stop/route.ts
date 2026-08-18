import { NextResponse } from "next/server";
import { getSession, canManageRoom } from "@/lib/auth";
import { getRoomBySlug } from "@/lib/queries/rooms";
import { getActiveRecording } from "@/lib/queries/recordings";
import { getEgressClient, mapEgressStatus } from "@/lib/livekit";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const room = await getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }
  if (!canManageRoom(session, room)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const recording = await getActiveRecording(room.id);
  if (!recording) {
    return NextResponse.json({ error: "Nenhuma gravação em andamento nesta sala." }, { status: 404 });
  }

  const egress = await getEgressClient().stopEgress(recording.egressId);

  const updated = await prisma.recording.update({
    where: { id: recording.id },
    data: { status: mapEgressStatus(egress.status) },
  });

  return NextResponse.json(updated);
}
