import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getEscrow, updateEscrowStatus, updateEscrowConfirmation } from "../../../../lib/db";
import type { EscrowStatus } from "../../../../lib/types";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const escrow = await getEscrow(userId, id);
  if (!escrow) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(escrow);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as {
    status?: EscrowStatus;
    confirm?: { party: "creator" | "counterparty"; confirmed: boolean };
  };

  if (body.confirm) {
    const { party, confirmed } = body.confirm;
    if (party !== "creator" && party !== "counterparty") {
      return NextResponse.json({ error: "Invalid party" }, { status: 400 });
    }
    await updateEscrowConfirmation(userId, id, party, confirmed);
    return NextResponse.json({ ok: true });
  }

  if (!body.status) return NextResponse.json({ error: "status or confirm required" }, { status: 400 });

  const validStatuses: EscrowStatus[] = ["pending", "active", "released", "disputed"];
  if (!validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const result = await updateEscrowStatus(userId, id, body.status);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
