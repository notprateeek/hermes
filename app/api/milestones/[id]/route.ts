import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateMilestoneStatus, deleteMilestone } from "../../../../lib/db";
import type { MilestoneStatus } from "../../../../lib/types";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = (await req.json()) as { status: MilestoneStatus };

  const validStatuses: MilestoneStatus[] = ["pending", "in_progress", "completed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await updateMilestoneStatus(userId, id, status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteMilestone(userId, id);
  return NextResponse.json({ ok: true });
}
