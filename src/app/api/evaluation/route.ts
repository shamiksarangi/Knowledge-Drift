import { NextResponse } from "next/server";
import { getEvaluationMetrics } from "@/lib/data";
export async function GET() {
  return NextResponse.json(await getEvaluationMetrics());
}
