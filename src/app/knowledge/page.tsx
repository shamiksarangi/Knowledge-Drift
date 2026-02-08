import Shell from "@/components/Shell";
import { getKBQualityScores, getDecayAlerts } from "@/lib/data";
import Link from "next/link";

export default async function KnowledgePage() {
  const [scores, decayAlerts] = await Promise.all([getKBQualityScores(), getDecayAlerts()]);
  const avg = scores.length > 0 ? scores.reduce((a, s) => a + s.overall_score, 0) / scores.length : 0;
  const avgAcc = scores.length > 0 ? scores.reduce((a, s) => a + s.accuracy_score, 0) / scores.length : 0;
  const avgFresh = scores.length > 0 ? scores.reduce((a, s) => a + s.freshness_score, 0) / scores.length : 0;
  const avgUse = scores.length > 0 ? scores.reduce((a, s) => a + s.usage_score, 0) / scores.length : 0;
  const gen = scores.filter(s => s.source_type === "SYNTH_FROM_TICKET").length;
  const healthy = scores.filter(s => s.overall_score >= 70).length;
  const atRisk = scores.filter(s => s.overall_score >= 50 && s.overall_score < 70).length;
  const poor = scores.filter(s => s.overall_score < 50).length;

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Knowledge Quality Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">KnowledgeDrift scores every KB article on four dimensions — accuracy, freshness, usage, and confusion rate — to detect articles that are drifting out of date or underperforming.</p>
        </div>

        {/* Quality score explanation */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">Quality Score Breakdown</p>
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: "Overall", score: avg, desc: "Weighted composite", color: avg>=70?"text-emerald-600":"text-amber-600" },
              { label: "Accuracy", score: avgAcc, desc: "40% weight — provenance depth", color: "text-blue-600" },
              { label: "Freshness", score: avgFresh, desc: "25% weight — days since update", color: "text-teal-600" },
              { label: "Usage", score: avgUse, desc: "20% weight — ticket references", color: "text-purple-600" },
              { label: "Confusion", score: 100 - (scores.length > 0 ? scores.reduce((a,s) => a + s.confusion_score, 0) / scores.length : 0), desc: "15% weight — clarity rate", color: "text-orange-600" },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className={`text-3xl font-bold ${m.color}`}>{m.score.toFixed(0)}</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{m.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health overview */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-sm text-slate-400">Total Scored</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{scores.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">{gen} AI-generated</p>
          </div>
          <div className="bg-white rounded-lg border border-emerald-200 p-4">
            <p className="text-sm text-emerald-600">Healthy (70+)</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{healthy}</p>
            <p className="text-xs text-slate-400 mt-0.5">{scores.length > 0 ? Math.round((healthy/scores.length)*100) : 0}% of articles</p>
          </div>
          <div className="bg-white rounded-lg border border-amber-200 p-4">
            <p className="text-sm text-amber-600">At Risk (50-70)</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{atRisk}</p>
            <p className="text-xs text-slate-400 mt-0.5">Review within 14 days</p>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-4">
            <p className="text-sm text-red-600">Decaying ({`<`}50)</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{poor}</p>
            <p className="text-xs text-slate-400 mt-0.5">Immediate attention</p>
          </div>
        </div>

        {/* Decay alerts */}
        {decayAlerts.length > 0 && (
          <div className="bg-white rounded-lg border border-red-200 overflow-hidden">
            <div className="p-4 border-b border-red-100">
              <p className="text-sm font-semibold text-red-800">Decay Alerts</p>
              <p className="text-sm text-red-600/70 mt-0.5">{decayAlerts.length} articles have quality scores below threshold and need review or regeneration</p>
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <th className="py-2 px-4 font-semibold">Article</th><th className="py-2 px-4 font-semibold">Score</th><th className="py-2 px-4 font-semibold">Severity</th><th className="py-2 px-4 font-semibold">Action</th>
              </tr></thead>
              <tbody>{decayAlerts.slice(0,10).map(a => (
                <tr key={a.kb_article_id} className="border-b border-slate-100">
                  <td className="py-2 px-4 text-slate-700 max-w-[250px] truncate">{a.title}</td>
                  <td className="py-2 px-4 font-semibold text-red-600">{a.currentScore.toFixed(1)}</td>
                  <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${a.severity==="critical"?"bg-red-100 text-red-700":"bg-amber-100 text-amber-700"}`}>{a.severity}</span></td>
                  <td className="py-2 px-4 text-sm text-slate-500">{a.recommendedAction}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Articles table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-900">All Scored Articles</p>
            <p className="text-sm text-slate-400 mt-0.5">Sorted by overall quality score — click any article for detail view</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <th className="py-2 px-4 font-semibold">Article</th><th className="py-2 px-4 font-semibold">Category</th><th className="py-2 px-4 font-semibold">Source</th>
              <th className="py-2 px-4 font-semibold">Overall</th><th className="py-2 px-4 font-semibold">Accuracy</th><th className="py-2 px-4 font-semibold">Freshness</th><th className="py-2 px-4 font-semibold">Usage</th>
            </tr></thead>
            <tbody>{scores.slice(0,40).map(s => (
              <tr key={s.kb_article_id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2 px-4"><Link href={`/knowledge/${s.kb_article_id}`} className="text-rp-navy hover:text-rp-teal font-medium text-sm">{s.title.substring(0,50)}</Link></td>
                <td className="py-2 px-4 text-sm text-slate-500">{s.category}</td>
                <td className="py-2 px-4"><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${s.source_type==="SYNTH_FROM_TICKET"?"bg-purple-50 text-purple-700":"bg-blue-50 text-blue-700"}`}>{s.source_type==="SYNTH_FROM_TICKET"?"AI":"Seed"}</span></td>
                <td className="py-2 px-4 font-semibold">{s.overall_score.toFixed(1)}</td>
                <td className="py-2 px-4 text-sm">{s.accuracy_score.toFixed(0)}</td>
                <td className="py-2 px-4 text-sm">{s.freshness_score.toFixed(0)}</td>
                <td className="py-2 px-4 text-sm">{s.usage_score.toFixed(0)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
