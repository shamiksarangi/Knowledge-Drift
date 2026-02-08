import { NextRequest, NextResponse } from "next/server";
import { getKBLineage } from "@/lib/data";
export async function GET(req: NextRequest) {
  const lineage = await getKBLineage();
  const kbId = req.nextUrl.searchParams.get("kbId");
  return NextResponse.json({ lineage: kbId ? lineage.filter((l) => l.KB_Article_ID === kbId) : lineage });
}
