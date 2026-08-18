import { NextResponse } from "next/server";
import { getSession, canManageRoom } from "@/lib/auth";
import { getRoomBySlug } from "@/lib/queries/rooms";
import { deleteRecordingFile } from "@/lib/s3";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug, id } = await context.params;
  const room = await getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }
  if (!canManageRoom(session, room)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const recording = await prisma.recording.findUnique({ where: { id } });
  if (!recording || recording.roomId !== room.id) {
    return NextResponse.json({ error: "Gravação não encontrada." }, { status: 404 });
  }

  if (recording.fileKey) {
    await deleteRecordingFile(recording.fileKey).catch(() => {});
  }
  await prisma.recording.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
