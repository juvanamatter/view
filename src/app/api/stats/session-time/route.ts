import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_SECONDS_PER_REPORT = 6 * 60 * 60;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const seconds = Number(body?.seconds);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: { activeSeconds: { increment: Math.min(seconds, MAX_SECONDS_PER_REPORT) } },
  });
  return NextResponse.json({ success: true });
}
