import { NextResponse } from "next/server";
import { getDecayAlerts } from "@/lib/data";
export async function GET() {
  const a = await getDecayAlerts();
  return NextResponse.json({ alerts: a, total: a.length });
}
