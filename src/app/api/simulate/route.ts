import { NextRequest, NextResponse } from "next/server";
import { getTickets, getClusters, getKnowledgeArticles } from "@/lib/data";
import { findSimilar, extractKeywords } from "@/lib/similarity";

export async function POST(req: NextRequest) {
  const tickets = await getTickets();
  const clusters = await getClusters();
  const kbs = await getKnowledgeArticles();
  const ticket = tickets[Math.floor(Math.random() * tickets.length)];
  const otherSubjects = tickets.slice(0, 200).map(t => t.Subject);
  const keywords = extractKeywords(ticket.Subject + " " + ticket.Description, otherSubjects, 6);
  const clusterCorpus = clusters.map(c => `${c.name} ${c.description} ${c.category}`);
  const clusterMatches = findSimilar(ticket.Subject + " " + ticket.Category, clusterCorpus, 3);
  const matchedClusters = clusterMatches.filter(r => r.score > 0.03).map(r => ({ id: clusters[r.index].id, name: clusters[r.index].name, severity: clusters[r.index].severity, similarity: +(r.score * 100).toFixed(1) }));
  const kbCorpus = kbs.map(kb => `${kb.Title} ${kb.Category || ""}`);
  const kbMatches = findSimilar(ticket.Subject + " " + ticket.Category, kbCorpus, 3);
  const matchedKBs = kbMatches.filter(r => r.score > 0.05).map(r => ({ id: kbs[r.index].KB_Article_ID, title: kbs[r.index].Title, relevance: +(r.score * 100).toFixed(1) }));
  const hasGap = matchedKBs.length === 0 || matchedKBs[0].relevance < 20;
  return NextResponse.json({
    ticket: { number: ticket.Ticket_Number, subject: ticket.Subject, category: ticket.Category, priority: ticket.Priority, tier: Math.round(ticket.Tier), account: ticket.Account_Name, property: ticket.Property_Name, resolution: ticket.Resolution },
    pipeline: { keywords, clusterMatches: matchedClusters, kbMatches: matchedKBs, hasGap, recommendation: hasGap ? "Knowledge gap detected — AI should generate a new KB article for this pattern" : `Matched to ${matchedKBs.length} existing article(s) — suggest "${matchedKBs[0]?.title}" to agent` },
  });
}
