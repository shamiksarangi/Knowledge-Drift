import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/data";
export async function GET() {
  try { return NextResponse.json(await getDashboardStats()); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
