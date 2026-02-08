import { NextRequest, NextResponse } from "next/server";
import { getClusters } from "@/lib/data";
export async function GET(req: NextRequest) {
  const clusters = await getClusters();
  const sev = req.nextUrl.searchParams.get("severity");
  const f = sev ? clusters.filter((c) => c.severity === sev) : clusters;
  return NextResponse.json({ clusters: f, total: f.length });
}
