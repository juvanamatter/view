import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth";
import { getRoomServiceClient } from "@/lib/livekit";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  const body = await request.json().catch(() => null);
  const identity = body?.identity;
  if (typeof identity !== "string" || !identity) {
    return NextResponse.json({ error: "Identidade do participante ausente." }, { status: 400 });
  }

  const svc = getRoomServiceClient();
  await svc.updateParticipant(slug, identity, JSON.stringify({ waiting: false }), {
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return NextResponse.json({ success: true });
}
