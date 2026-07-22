import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listEvents } from "../../../../../lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  return NextResponse.json(await listEvents(userId, id));
}
