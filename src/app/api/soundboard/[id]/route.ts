import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const sound = await prisma.soundboardSound.findUnique({ where: { id } });
  if (!sound) {
    return NextResponse.json({ error: "Som não encontrado." }, { status: 404 });
  }
  await prisma.soundboardSound.delete({ where: { id } });
  await del(sound.audioUrl).catch(() => {});
  return NextResponse.json({ success: true });
}
