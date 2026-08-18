import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUsersWithPresence } from "@/lib/queries/presence";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const users = await getUsersWithPresence();
  return NextResponse.json({ users });
}
