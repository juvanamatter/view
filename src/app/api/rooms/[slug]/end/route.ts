import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRoomServiceClient } from "@/lib/livekit";

export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { slug } = await params;
  const svc = getRoomServiceClient();
  await svc.deleteRoom(slug).catch(() => {});

  return NextResponse.json({ success: true });
}
