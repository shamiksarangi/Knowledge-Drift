import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeArticles, getClusters } from "@/lib/data";
import { findSimilar } from "@/lib/similarity";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query) return NextResponse.json({ error: "Query required" }, { status: 400 });
  const kbs = await getKnowledgeArticles();
  const clusters = await getClusters();
  const kbCorpus = kbs.map(kb => `${kb.Title} ${kb.Body || ""} ${kb.Category || ""}`);
  const kbResults = findSimilar(query, kbCorpus, 5);
  const matchedKBs = kbResults.filter(r => r.score > 0.05).map(r => ({ ...kbs[r.index], relevance: +(r.score * 100).toFixed(1) }));
  const clusterCorpus = clusters.map(c => `${c.name} ${c.description} ${c.category}`);
  const clusterResults = findSimilar(query, clusterCorpus, 3);
  const matchedClusters = clusterResults.filter(r => r.score > 0.05).map(r => ({ ...clusters[r.index], relevance: +(r.score * 100).toFixed(1) }));
  const hasCoverage = matchedKBs.length > 0 && matchedKBs[0].relevance > 15;
  return NextResponse.json({ query, articles: matchedKBs, clusters: matchedClusters, hasCoverage, totalSearched: { articles: kbs.length, clusters: clusters.length } });
}
