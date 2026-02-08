import { NextResponse } from "next/server";
import { getLearningEvents } from "@/lib/data";
export async function GET() {
  const events = await getLearningEvents();
  events.sort((a, b) => new Date(b.Event_Timestamp).getTime() - new Date(a.Event_Timestamp).getTime());
  return NextResponse.json({ events, total: events.length });
}
