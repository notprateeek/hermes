import { NextResponse } from "next/server";
import { getEscrowByToken, confirmByToken } from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const data = await getEscrowByToken(token);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const result = await confirmByToken(token);
  if (result === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  // "already_confirmed" is success — idempotent
  return NextResponse.json({ ok: true });
}
