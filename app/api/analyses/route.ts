import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { listAnalyses } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const analyses = await listAnalyses(userId);
  return NextResponse.json(analyses);
}
