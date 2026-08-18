import { NextResponse } from "next/server";
import { getSession, canManageRoom } from "@/lib/auth";
import { getRoomBySlug } from "@/lib/queries/rooms";
import { getActiveRecording } from "@/lib/queries/recordings";
import { getEgressClient, buildRecordingFileOutput, mapEgressStatus } from "@/lib/livekit";
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

  const existing = await getActiveRecording(room.id);
  if (existing) {
    return NextResponse.json({ error: "Já existe uma gravação em andamento nesta sala." }, { status: 409 });
  }

  const { key, output } = buildRecordingFileOutput(room.slug);
  const egress = await getEgressClient().startRoomCompositeEgress(room.slug, output);

  const recording = await prisma.recording.create({
    data: {
      roomId: room.id,
      egressId: egress.egressId,
      status: mapEgressStatus(egress.status),
      fileKey: key,
    },
  });

  return NextResponse.json(recording);
}
