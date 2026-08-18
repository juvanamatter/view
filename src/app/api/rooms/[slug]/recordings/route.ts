import { NextResponse } from "next/server";
import { getSession, canManageRoom } from "@/lib/auth";
import { getRoomBySlug } from "@/lib/queries/rooms";
import { getRecordingsByRoom } from "@/lib/queries/recordings";
import { getEgressClient, mapEgressStatus } from "@/lib/livekit";
import { getRecordingDownloadUrl } from "@/lib/s3";
import { prisma } from "@/lib/prisma";

const TERMINAL_STATUSES = new Set(["COMPLETE", "FAILED"]);

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
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

  const recordings = await getRecordingsByRoom(room.id);

  const refreshed = await Promise.all(
    recordings.map(async (recording) => {
      if (TERMINAL_STATUSES.has(recording.status)) return recording;
      try {
        const [egress] = await getEgressClient().listEgress({ egressId: recording.egressId });
        if (!egress) return recording;
        const status = mapEgressStatus(egress.status);
        if (status === recording.status) return recording;
        const fileInfo = egress.fileResults[0];
        return prisma.recording.update({
          where: { id: recording.id },
          data: {
            status,
            durationSec: fileInfo ? Math.round(Number(fileInfo.duration) / 1_000_000_000) : undefined,
            endedAt: status === "COMPLETE" || status === "FAILED" ? new Date() : undefined,
          },
        });
      } catch {
        return recording;
      }
    })
  );

  const withUrls = await Promise.all(
    refreshed.map(async (recording) => ({
      ...recording,
      downloadUrl:
        recording.status === "COMPLETE" && recording.fileKey
          ? await getRecordingDownloadUrl(recording.fileKey).catch(() => null)
          : null,
    }))
  );

  return NextResponse.json({ recordings: withUrls });
}
