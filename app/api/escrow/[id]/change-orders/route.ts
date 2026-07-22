import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listChangeOrders, createChangeOrder } from "../../../../../lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const items = await listChangeOrders(userId, id);
  return NextResponse.json(items);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { title?: string; description?: string; amountDelta?: number };

  const title = body.title?.trim() ?? "";
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (title.length > 200) return NextResponse.json({ error: "title too long (max 200)" }, { status: 400 });
  if (typeof body.amountDelta !== "number" || !isFinite(body.amountDelta)) {
    return NextResponse.json({ error: "amountDelta must be a finite number" }, { status: 400 });
  }
  if (body.description && body.description.length > 2000) {
    return NextResponse.json({ error: "description too long (max 2000)" }, { status: 400 });
  }

  try {
    const item = await createChangeOrder(userId, id, {
      title,
      description: body.description ?? null,
      amountDelta: body.amountDelta,
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Escrow not found" }, { status: 404 });
  }
}
