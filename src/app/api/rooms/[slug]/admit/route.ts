import { NextResponse } from "next/server";
import { getSession, canManageRoom } from "@/lib/auth";
import { getRoomBySlug } from "@/lib/queries/rooms";
import { getRoomServiceClient } from "@/lib/livekit";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
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

  const body = await request.json().catch(() => null);
  const identity = body?.identity;
  if (typeof identity !== "string" || !identity) {
    return NextResponse.json({ error: "Identidade do participante ausente." }, { status: 400 });
  }

  const svc = getRoomServiceClient();
  const participant = await svc.getParticipant(slug, identity).catch(() => null);
  let existingMetadata: Record<string, unknown> = {};
  if (participant?.metadata) {
    try {
      existingMetadata = JSON.parse(participant.metadata);
    } catch {
      // metadata inválida, ignora e segue com objeto vazio
    }
  }

  await svc.updateParticipant(
    slug,
    identity,
    JSON.stringify({ ...existingMetadata, waiting: false }),
    {
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    }
  );

  return NextResponse.json({ success: true });
}
