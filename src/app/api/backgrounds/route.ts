import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 5 * 1024 * 1024;

export async function GET() {
  const images = await prisma.backgroundImage.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ images });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const name = formData.get("name");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie uma imagem." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "O arquivo precisa ser uma imagem." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Imagem muito grande (máx. 5MB)." }, { status: 400 });
  }

  const blob = await put(`backgrounds/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  const image = await prisma.backgroundImage.create({
    data: {
      name: typeof name === "string" && name.trim() ? name.trim().slice(0, 40) : file.name.slice(0, 40),
      imageUrl: blob.url,
    },
  });

  return NextResponse.json(image);
}
