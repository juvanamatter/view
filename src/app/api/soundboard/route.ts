import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 2 * 1024 * 1024;

export async function GET() {
  const sounds = await prisma.soundboardSound.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ sounds });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const name = formData.get("name");
  const emoji = formData.get("emoji");

  if (!(file instanceof File) || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Envie um nome e um arquivo de áudio." }, { status: 400 });
  }
  if (!file.type.startsWith("audio/")) {
    return NextResponse.json({ error: "O arquivo precisa ser um áudio." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Áudio muito grande (máx. 2MB)." }, { status: 400 });
  }

  const blob = await put(`soundboard/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const sound = await prisma.soundboardSound.create({
    data: {
      name: name.trim().slice(0, 40),
      emoji: typeof emoji === "string" && emoji.trim() ? emoji.trim().slice(0, 8) : null,
      audioUrl: blob.url,
    },
  });

  return NextResponse.json(sound);
}
