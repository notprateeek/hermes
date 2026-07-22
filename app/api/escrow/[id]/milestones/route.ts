import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { addMilestone, getEscrow, getAnalysis } from "../../../../../lib/db";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: escrowId } = await params;
  const body = (await req.json()) as {
    action?: "import";
    title?: string;
    description?: string;
    amount?: number;
    dueDate?: string;
    sortOrder?: number;
  };

  if (body.action === "import") {
    const escrow = await getEscrow(userId, escrowId);
    if (!escrow) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!escrow.analysisId) return NextResponse.json({ error: "No analysis linked to this escrow" }, { status: 400 });

    const analysis = await getAnalysis(userId, escrow.analysisId);
    if (!analysis) return NextResponse.json({ error: "Linked analysis not found" }, { status: 404 });

    const milestones = await Promise.all(
      analysis.analysis.commitments.map((c, i) =>
        addMilestone(escrowId, {
          title: c.commitment,
          description: c.acceptanceCriteria.length
            ? c.acceptanceCriteria.join("; ")
            : c.riskReason || null,
          dueDate: c.deadline || null,
          sortOrder: i,
        })
      )
    );

    return NextResponse.json({ milestones });
  }

  const title = body.title?.trim() ?? "";
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (title.length > 300) return NextResponse.json({ error: "title too long (max 300)" }, { status: 400 });
  if (body.description && body.description.length > 2000) {
    return NextResponse.json({ error: "description too long (max 2000)" }, { status: 400 });
  }
  if (body.amount != null && (!isFinite(body.amount) || body.amount < 0)) {
    return NextResponse.json({ error: "amount must be a non-negative number" }, { status: 400 });
  }
  if (body.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) {
    return NextResponse.json({ error: "dueDate must be YYYY-MM-DD" }, { status: 400 });
  }

  // Verify escrow belongs to user before adding milestone
  const escrow = await getEscrow(userId, escrowId);
  if (!escrow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const milestone = await addMilestone(escrowId, {
    title,
    description: body.description?.trim() || null,
    amount: body.amount ?? null,
    dueDate: body.dueDate || null,
    sortOrder: body.sortOrder ?? 0,
  });

  return NextResponse.json(milestone);
}
