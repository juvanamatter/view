import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { countActiveParticipants } from "@/lib/livekit";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const slugsParam = new URL(request.url).searchParams.get("slugs") ?? "";
  const slugs = slugsParam.split(",").filter(Boolean).slice(0, 20);

  const entries = await Promise.all(
    slugs.map(async (slug) => [slug, await countActiveParticipants(slug)] as const)
  );

  return NextResponse.json({ counts: Object.fromEntries(entries) });
}
