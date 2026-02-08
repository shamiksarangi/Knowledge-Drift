import { NextRequest, NextResponse } from "next/server";
import { getTickets } from "@/lib/data";
export async function GET(req: NextRequest) {
  const tickets = await getTickets();
  const s = req.nextUrl.searchParams.get("search");
  let f = tickets;
  if (s) { const q = s.toLowerCase(); f = f.filter((t) => t.Subject?.toLowerCase().includes(q) || t.Ticket_Number?.toLowerCase().includes(q)); }
  return NextResponse.json({ tickets: f.slice(0, 50), total: f.length });
}
