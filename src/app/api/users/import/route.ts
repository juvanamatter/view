import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PASSWORD = "call123";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeHeader(header: string) {
  return header
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function pick(row: Record<string, unknown>, keys: string[]) {
  const normalizedRow: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    normalizedRow[normalizeHeader(key)] = value;
  }
  for (const key of keys) {
    const value = normalizedRow[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie uma planilha." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rows: Record<string, unknown>[];
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
  } catch {
    return NextResponse.json({ error: "Não foi possível ler a planilha." }, { status: 400 });
  }

  const seenEmails = new Set<string>();
  const candidates: { name: string; email: string; jobTitle: string | null }[] = [];
  const invalidRows: number[] = [];

  rows.forEach((row, index) => {
    const name = pick(row, ["nome", "name"]);
    const email = pick(row, ["email", "e-mail", "e mail"]).toLowerCase();
    const jobTitle = pick(row, ["cargo", "jobtitle", "job title", "funcao", "função"]);

    if (!name || !email || !EMAIL_REGEX.test(email)) {
      invalidRows.push(index + 2);
      return;
    }
    if (seenEmails.has(email)) return;
    seenEmails.add(email);
    candidates.push({ name, email, jobTitle: jobTitle || null });
  });

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Nenhuma linha válida encontrada (colunas esperadas: nome, e-mail, cargo)." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findMany({
    where: { email: { in: candidates.map((c) => c.email) } },
    select: { email: true },
  });
  const existingEmails = new Set(existing.map((u) => u.email));

  const toCreate = candidates.filter((c) => !existingEmails.has(c.email));
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  if (toCreate.length > 0) {
    await prisma.user.createMany({
      data: toCreate.map((c) => ({
        name: c.name,
        email: c.email,
        jobTitle: c.jobTitle,
        passwordHash,
        role: "USER",
      })),
    });
  }

  return NextResponse.json({
    created: toCreate.length,
    skippedExisting: candidates.length - toCreate.length,
    invalidRows,
  });
}
