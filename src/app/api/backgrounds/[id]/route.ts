import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const image = await prisma.backgroundImage.findUnique({ where: { id } });
  if (!image) {
    return NextResponse.json({ error: "Imagem não encontrada." }, { status: 404 });
  }
  await prisma.backgroundImage.delete({ where: { id } });
  await del(image.imageUrl).catch(() => {});
  return NextResponse.json({ success: true });
}
