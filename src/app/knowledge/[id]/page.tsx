import Shell from "@/components/Shell";
import { getKnowledgeArticles, getKBLineage, getTickets, getKBQualityScores } from "@/lib/data";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function KBDetail({ params }: { params: { id: string } }) {
  const [allKBs, lineage, tickets, scores] = await Promise.all([getKnowledgeArticles(), getKBLineage(), getTickets(), getKBQualityScores()]);
  const article = allKBs.find((kb) => kb.KB_Article_ID === params.id);
  if (!article) notFound();
  const quality = scores.find((s) => s.kb_article_id === params.id);
  const artLineage = lineage.filter((l) => l.KB_Article_ID === params.id);
  const linked = tickets.filter((t) => t.KB_Article_ID === params.id || t.Generated_KB_Article_ID === params.id);

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/knowledge" className="hover:text-brand-600">Knowledge</Link><span>/</span><span className="text-slate-900">{params.id}</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h1 className="text-xl font-bold text-slate-900">{article.Title}</h1>
          <div className="flex gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${article.Source_Type === "SYNTH_FROM_TICKET" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>{article.Source_Type === "SYNTH_FROM_TICKET" ? "AI Generated" : "Seed"}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">{article.Status || "Active"}</span>
            {article.Category && <span className="text-xs text-slate-500">{article.Category}</span>}
          </div>
          {quality && (
            <div className="grid grid-cols-5 gap-4 mt-5">
              {[
                { l: "Overall", v: quality.overall_score, c: quality.overall_score >= 70 ? "text-green-600" : "text-orange-600" },
                { l: "Accuracy", v: quality.accuracy_score, c: "text-blue-600" },
                { l: "Freshness", v: quality.freshness_score, c: "text-purple-600" },
                { l: "Usage", v: quality.usage_score, c: "text-indigo-600" },
                { l: "Confusion", v: quality.confusion_score, c: "text-red-600" },
              ].map((m) => (<div key={m.l} className="text-center p-3 bg-slate-50 rounded-lg"><p className={`text-2xl font-bold ${m.c}`}>{m.v.toFixed(1)}</p><p className="text-xs text-slate-500">{m.l}</p></div>))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">Content</h3>
          <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto scrollbar-thin">
            {article.Body ? article.Body.substring(0, 3000) : "No content available"}
            {(article.Body?.length || 0) > 3000 && <p className="text-slate-400 italic mt-3">… ({article.Body.length} chars total)</p>}
          </div>
        </div>

        {artLineage.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Provenance ({artLineage.length} sources)</h3>
            {artLineage.map((l, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100 mb-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold ${l.Source_Type === "Ticket" ? "bg-green-500" : l.Source_Type === "Script" ? "bg-orange-500" : "bg-blue-500"}`}>{l.Source_Type?.substring(0, 3).toUpperCase()}</div>
                <div className="flex-1"><p className="text-sm font-medium text-slate-700">{l.Source_ID}</p><p className="text-xs text-slate-500">{l.Relationship} · {l.Event_Timestamp?.substring(0, 10)}</p></div>
                <p className="text-xs text-slate-400 max-w-xs truncate">{l.Evidence_Snippet}</p>
              </div>
            ))}
          </div>
        )}

        {linked.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-3 text-sm">Linked Tickets ({linked.length})</h3>
            {linked.slice(0, 10).map((t) => (
              <div key={t.Ticket_Number} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg mb-2">
                <div><span className="text-xs font-mono text-slate-400">{t.Ticket_Number}</span><p className="text-sm text-slate-700">{t.Subject}</p></div>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{t.Priority} · T{Math.round(t.Tier)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
