import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { deleteRateCardItem } from "../../../../lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteRateCardItem(userId, id);
  return NextResponse.json({ ok: true });
}
