import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listRateCardItems, createRateCardItem } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await listRateCardItems(userId));
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    category?: string; label?: string; value?: string; notes?: string; sortOrder?: number;
  };

  const category = body.category?.trim() ?? "";
  const label = body.label?.trim() ?? "";
  const value = body.value?.trim() ?? "";
  if (!category) return NextResponse.json({ error: "category is required" }, { status: 400 });
  if (category.length > 100) return NextResponse.json({ error: "category too long (max 100)" }, { status: 400 });
  if (!label) return NextResponse.json({ error: "label is required" }, { status: 400 });
  if (label.length > 200) return NextResponse.json({ error: "label too long (max 200)" }, { status: 400 });
  if (!value) return NextResponse.json({ error: "value is required" }, { status: 400 });
  if (value.length > 100) return NextResponse.json({ error: "value too long (max 100)" }, { status: 400 });
  if (body.notes && body.notes.length > 500) return NextResponse.json({ error: "notes too long (max 500)" }, { status: 400 });

  const item = await createRateCardItem(userId, {
    category,
    label,
    value,
    notes: body.notes ?? null,
    sortOrder: body.sortOrder ?? 0,
  });
  return NextResponse.json(item, { status: 201 });
}
