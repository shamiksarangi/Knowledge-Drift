import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeArticles, getClusters } from "@/lib/data";
import { findSimilar } from "@/lib/similarity";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const kbs = await getKnowledgeArticles();
  const clusters = await getClusters();

  // Find relevant KBs
  const kbCorpus = kbs.map(kb => `${kb.Title} ${kb.Body || ""} ${kb.Category || ""}`);
  const kbMatches = findSimilar(message, kbCorpus, 3).filter(r => r.score > 0.04);
  const matchedKBs = kbMatches.map(r => ({ id: kbs[r.index].KB_Article_ID, title: kbs[r.index].Title, body: kbs[r.index].Body?.substring(0, 300), category: kbs[r.index].Category, relevance: +(r.score * 100).toFixed(1) }));

  // Find related clusters
  const clusterCorpus = clusters.map(c => `${c.name} ${c.description} ${c.category}`);
  const clusterMatches = findSimilar(message, clusterCorpus, 2).filter(r => r.score > 0.04);

  // Generate response
  const topKB = matchedKBs[0];
  let suggestedResponse = "";
  let confidence = "low";

  if (topKB && topKB.relevance > 15) {
    confidence = topKB.relevance > 40 ? "high" : "medium";
    suggestedResponse = `Thank you for reaching out regarding this issue. Based on our knowledge base, this appears to be related to "${topKB.title}". `;
    if (topKB.body) {
      const sentences = topKB.body.split(/[.!]\s+/).filter(s => s.length > 20).slice(0, 3);
      suggestedResponse += sentences.join(". ") + ". ";
    }
    suggestedResponse += `\n\nI'd recommend the following steps:\n1. Navigate to the ${topKB.category || "relevant"} module in PropertySuite\n2. Check your current configuration under Admin > Module Settings\n3. If the issue persists, I can escalate this to our specialist team.\n\nIs there anything else I can help with?`;
  } else {
    suggestedResponse = `Thank you for contacting RealPage PropertySuite support. I understand you're experiencing an issue. Let me look into this for you.\n\nCould you provide a few more details?\n- Which PropertySuite module were you using?\n- When did this issue first occur?\n- Are other users at your property experiencing the same issue?\n\nThis will help me identify the right solution for you.`;
  }

  return NextResponse.json({
    suggestedResponse,
    confidence,
    citations: matchedKBs,
    relatedPatterns: clusterMatches.map(r => ({ name: clusters[r.index].name, severity: clusters[r.index].severity })),
    escalationRisk: confidence === "low" ? "high" : confidence === "medium" ? "medium" : "low",
  });
}
