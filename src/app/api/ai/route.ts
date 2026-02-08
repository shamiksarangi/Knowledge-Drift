import { NextRequest, NextResponse } from "next/server";
import { analyzeClusterPattern, generateKBArticle } from "@/lib/ai";
import { getClusters, getTickets } from "@/lib/data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, clusterId } = body;

    if (action === "analyze-cluster") {
      const clusters = await getClusters();
      const cluster = clusters.find(c => c.id === clusterId);
      if (!cluster) return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
      const allTickets = await getTickets();
      const ct = allTickets.filter(t => cluster.tickets.includes(t.Ticket_Number)).map(t => ({
        ticket_number: t.Ticket_Number, subject: t.Subject, description: t.Description,
        resolution: t.Resolution, root_cause: t.Root_Cause, tier: Math.round(t.Tier),
        category: t.Category, priority: t.Priority, Account_Name: t.Account_Name,
      }));
      const analysis = await analyzeClusterPattern(ct as any);
      return NextResponse.json({ success: true, analysis, meta: { ticketsAnalyzed: ct.length, cluster: cluster.name, timestamp: new Date().toISOString() } });
    }

    if (action === "generate-kb") {
      const clusters = await getClusters();
      const cluster = clusters.find(c => c.id === clusterId);
      if (!cluster) return NextResponse.json({ error: "Cluster not found" }, { status: 404 });
      const allTickets = await getTickets();
      const ct = allTickets.filter(t => cluster.tickets.includes(t.Ticket_Number)).map(t => ({
        subject: t.Subject, description: t.Description, resolution: t.Resolution, category: t.Category, tier: Math.round(t.Tier),
      }));
      const result = await generateKBArticle({ clusterName: cluster.name, tickets: ct });
      return NextResponse.json({ success: true, article: result.article, compliance: result.compliance,
        metadata: { sourceCluster: clusterId, sourceTickets: ct.length, generatedAt: new Date().toISOString(), aiSource: result.article.source || "data-analysis" } });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("AI API error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
