import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listEscrows, createEscrow, getAnalysis } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const escrows = await listEscrows(userId);
  return NextResponse.json(escrows);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    title?: string;
    counterparty?: string;
    totalAmount?: number;
    currency?: string;
    notes?: string;
    analysisId?: string;
  };

  const title = body.title?.trim() ?? "";
  const counterparty = body.counterparty?.trim() ?? "";
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (title.length > 200) return NextResponse.json({ error: "title too long (max 200)" }, { status: 400 });
  if (!counterparty) return NextResponse.json({ error: "counterparty is required" }, { status: 400 });
  if (counterparty.length > 200) return NextResponse.json({ error: "counterparty too long (max 200)" }, { status: 400 });
  if (typeof body.totalAmount !== "number" || !isFinite(body.totalAmount) || body.totalAmount <= 0) {
    return NextResponse.json({ error: "totalAmount must be a positive number" }, { status: 400 });
  }
  const currency = (body.currency ?? "USD").toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return NextResponse.json({ error: "currency must be a 3-letter ISO code" }, { status: 400 });
  if (body.notes && body.notes.length > 2000) return NextResponse.json({ error: "notes too long (max 2000)" }, { status: 400 });

  // Verify analysisId belongs to this user (prevents IDOR)
  if (body.analysisId) {
    const analysis = await getAnalysis(userId, body.analysisId);
    if (!analysis) return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const id = await createEscrow(userId, {
    title,
    counterparty,
    totalAmount: body.totalAmount,
    currency,
    notes: body.notes?.trim() || undefined,
    analysisId: body.analysisId || undefined,
  });

  return NextResponse.json({ id });
}
