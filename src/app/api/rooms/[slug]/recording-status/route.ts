import { NextResponse } from "next/server";
import { getRoomBySlug } from "@/lib/queries/rooms";
import { getActiveRecording } from "@/lib/queries/recordings";

// Sem exigir login de propósito: convidados sem conta também precisam saber que a
// sala está sendo gravada. Não expõe nada além do booleano.
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const room = await getRoomBySlug(slug);
  if (!room) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }

  const recording = await getActiveRecording(room.id);
  return NextResponse.json({ active: Boolean(recording) });
}
