import { NextRequest, NextResponse } from "next/server";
import { getKBQualityScores } from "@/lib/data";
export async function GET(req: NextRequest) {
  const scores = await getKBQualityScores();
  const p = Number(req.nextUrl.searchParams.get("page") || 1);
  return NextResponse.json({ articles: scores.slice((p-1)*50, p*50), total: scores.length });
}
