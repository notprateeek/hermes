import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryDeadlines } from "../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await queryDeadlines(userId));
}
