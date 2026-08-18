import { NextResponse } from "next/server";
import { TrackSource } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { joinSchema } from "@/lib/validators/join";
import { mintParticipantToken, countActiveParticipants, getLiveKitUrl } from "@/lib/livekit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }
  const { slug, participantName, password } = parsed.data;

  const room = await prisma.room.findUnique({ where: { slug } });
  if (!room || !room.isActive) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }
  if (room.password && room.password !== password) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const participantCount = await countActiveParticipants(room.slug);
  if (participantCount >= room.maxParticipants) {
    return NextResponse.json({ error: "Esta sala já está cheia." }, { status: 409 });
  }

  const identity = `${participantName.trim().slice(0, 40)}-${Math.random().toString(36).slice(2, 8)}`;
  const waiting = room.waitingRoom;

  const canPublishSources = room.allowScreenShare
    ? [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO]
    : [TrackSource.CAMERA, TrackSource.MICROPHONE];

  const token = await mintParticipantToken({
    roomName: room.slug,
    identity,
    participantName: participantName.trim(),
    metadata: JSON.stringify({ waiting }),
    grant: {
      canPublish: !waiting,
      canSubscribe: !waiting,
      canPublishData: !waiting,
      canPublishSources,
    },
  });

  return NextResponse.json({
    token,
    livekitUrl: getLiveKitUrl(),
    identity,
    room: {
      name: room.name,
      slug: room.slug,
      muteOnEntry: room.muteOnEntry,
      cameraOnEntry: room.cameraOnEntry,
      allowScreenShare: room.allowScreenShare,
      waitingRoom: room.waitingRoom,
    },
  });
}
