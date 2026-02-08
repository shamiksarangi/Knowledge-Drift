import { NextRequest, NextResponse } from "next/server";
import { getTickets, getClusters, getConversations, getLearningEvents } from "@/lib/data";
import { getDecayAlerts } from "@/lib/data";
import { detectAnomalies, predictEscalation, buildDriftTimeline, buildSentimentHeatmap } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const { type } = await req.json();
  
  if (type === "anomalies") {
    const tickets = await getTickets();
    const result = detectAnomalies(tickets.map(t => ({ Category: t.Category, Created_At: t.Created_At })));
    return NextResponse.json(result);
  }

  if (type === "predictions") {
    const tickets = await getTickets();
    // Predict on most recent 50 tickets
    const recent = tickets.slice(-50);
    const predictions = predictEscalation(recent.map(t => ({
      Ticket_Number: t.Ticket_Number, Subject: t.Subject, Priority: t.Priority,
      Category: t.Category, Tier: t.Tier, Description: t.Description,
    })));
    return NextResponse.json({
      predictions: predictions.sort((a, b) => b.probability - a.probability),
      summary: {
        high: predictions.filter(p => p.risk === "high").length,
        medium: predictions.filter(p => p.risk === "medium").length,
        low: predictions.filter(p => p.risk === "low").length,
        avgProbability: +(predictions.reduce((a, p) => a + p.probability, 0) / predictions.length).toFixed(3),
      }
    });
  }

  if (type === "drift") {
    const [events, decayAlerts, tickets] = await Promise.all([getLearningEvents(), getDecayAlerts(), getTickets()]);
    const anomalyResult = detectAnomalies(tickets.map(t => ({ Category: t.Category, Created_At: t.Created_At })));
    const timeline = buildDriftTimeline(events as any, decayAlerts as any, anomalyResult.anomalies);
    return NextResponse.json({ timeline: timeline.slice(0, 30) });
  }

  if (type === "heatmap") {
    const conversations = await getConversations();
    const heatmap = buildSentimentHeatmap(conversations.map(c => ({ Category: c.Category, Sentiment: c.Sentiment })));
    return NextResponse.json(heatmap);
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}
