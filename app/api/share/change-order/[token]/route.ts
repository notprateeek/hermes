import { NextResponse } from "next/server";
import { getChangeOrderByToken, respondToChangeOrder } from "../../../../../lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const data = await getChangeOrderByToken(token);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = (await req.json()) as { response?: "accepted" | "rejected" };

  if (body.response !== "accepted" && body.response !== "rejected") {
    return NextResponse.json({ error: "response must be accepted or rejected" }, { status: 400 });
  }

  const result = await respondToChangeOrder(token, body.response);
  if (result === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  // "already_responded" is idempotent success — return current state
  return NextResponse.json({ ok: true });
}
