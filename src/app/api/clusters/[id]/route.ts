import { NextRequest, NextResponse } from "next/server";
import { getClusters, getTickets, getKnowledgeArticles } from "@/lib/data";
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const clusters = await getClusters();
  const cluster = clusters.find((c) => c.id === params.id);
  if (!cluster) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const tickets = (await getTickets()).filter((t) => cluster.tickets.includes(t.Ticket_Number));
  return NextResponse.json({ cluster, tickets });
}
