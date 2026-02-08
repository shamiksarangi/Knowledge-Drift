import Shell from "@/components/Shell";
import { getEvaluationMetrics, getQuestions, getDashboardStats, getClusters, getKBQualityScores } from "@/lib/data";

export default async function EvaluationPage() {
  const [metrics, questions, stats, clusters, kbScores] = await Promise.all([
    getEvaluationMetrics(), getQuestions(), getDashboardStats(), getClusters(), getKBQualityScores(),
  ]);
  const avgKB = kbScores.length > 0 ? (kbScores.reduce((a, s) => a + s.overall_score, 0) / kbScores.length).toFixed(1) : "0";
  const avgCluster = clusters.length > 0 ? (clusters.reduce((a, c) => a + c.ticketCount, 0) / clusters.length).toFixed(1) : "0";
  const typeCount: Record<string, number> = {};
  const diffCount: Record<string, number> = {};
  questions.forEach(q => {
    typeCount[q.Answer_Type] = (typeCount[q.Answer_Type] || 0) + 1;
    diffCount[q.Difficulty] = (diffCount[q.Difficulty] || 0) + 1;
  });

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">System Evaluation</h1>
          <p className="text-sm text-slate-400 mt-0.5">Measures how accurately KnowledgeDrift retrieves the correct KB article or script for a given support question. Built on a ground truth set of {metrics.totalQuestions} questions across all PropertySuite modules.</p>
        </div>

        {/* Retrieval accuracy */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Retrieval Accuracy</p>
          <p className="text-sm text-slate-400 mb-5">How often the system returns the correct answer within the top K results</p>
          <div className="grid grid-cols-4 gap-6">
            {[
              { label: "Hit@1", value: metrics.hit_at_1, desc: "Correct answer is the #1 result" },
              { label: "Hit@3", value: metrics.hit_at_3, desc: "Correct answer in top 3" },
              { label: "Hit@5", value: metrics.hit_at_5, desc: "Correct answer in top 5" },
              { label: "MRR", value: metrics.mrr, desc: "Mean reciprocal rank" },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className={`text-4xl font-bold ${m.value >= 80 ? "text-emerald-600" : m.value >= 60 ? "text-amber-600" : "text-red-600"}`}>{m.value}%</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{m.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coverage + question breakdown */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Coverage Analysis</p>
            <p className="text-sm text-slate-400 mb-4">Percentage of incoming questions that have at least one relevant KB article or script</p>
            <div className="text-center py-4">
              <p className={`text-5xl font-bold ${metrics.coverageRate >= 80 ? "text-emerald-600" : "text-amber-600"}`}>{metrics.coverageRate}%</p>
              <p className="text-sm text-slate-500 mt-1">Knowledge coverage rate</p>
              <p className="text-sm text-slate-400 mt-2">{Math.round(metrics.totalQuestions * (100 - metrics.coverageRate) / 100)} questions have no matching article — these are candidates for AI article generation</p>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Evaluation Set Composition</p>
            <p className="text-sm text-slate-400 mb-4">Ground truth questions categorized by answer type and difficulty</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400 font-medium mb-2">By Answer Type</p>
                {Object.entries(typeCount).sort((a,b)=>b[1]-a[1]).map(([t,c]) => (
                  <div key={t} className="flex items-center justify-between py-1">
                    <span className={`text-sm px-1.5 py-0.5 rounded font-medium ${t==="KB"?"bg-blue-50 text-blue-700":t==="SCRIPT"?"bg-orange-50 text-orange-700":"bg-emerald-50 text-emerald-700"}`}>{t}</span>
                    <span className="text-sm font-semibold text-slate-700">{c}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-2">By Difficulty</p>
                {Object.entries(diffCount).sort((a,b)=>b[1]-a[1]).map(([d,c]) => (
                  <div key={d} className="flex items-center justify-between py-1">
                    <span className={`text-sm px-1.5 py-0.5 rounded font-medium ${d==="Hard"?"bg-red-50 text-red-700":d==="Medium"?"bg-amber-50 text-amber-700":"bg-emerald-50 text-emerald-700"}`}>{d}</span>
                    <span className="text-sm font-semibold text-slate-700">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System health */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Platform Metrics</p>
          <p className="text-sm text-slate-400 mb-4">Full system health across all KnowledgeDrift modules</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { l: "Tickets Ingested", v: stats.totalTickets.toLocaleString(), d: "PropertySuite support data" },
              { l: "Conversations", v: stats.totalConversations.toLocaleString(), d: "Multi-turn transcripts" },
              { l: "KB Articles", v: stats.totalKBArticles.toLocaleString(), d: `${stats.generatedKBCount} AI-generated` },
              { l: "Agent Scripts", v: stats.totalScripts.toString(), d: "Resolution procedures" },
              { l: "Root Cause Clusters", v: clusters.length.toString(), d: `Avg ${avgCluster} tickets each` },
              { l: "Avg KB Quality", v: avgKB, d: "Weighted 4-dimension score" },
              { l: "Learning Events", v: stats.totalLearningEvents.toString(), d: `${stats.approvedEvents} approved` },
              { l: "Eval Questions", v: metrics.totalQuestions.toString(), d: "Ground truth set" },
            ].map(m => (
              <div key={m.l} className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xl font-bold text-slate-900">{m.v}</p>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{m.l}</p>
                <p className="text-xs text-slate-400">{m.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-900">Ground Truth Evaluation Set</p>
            <p className="text-sm text-slate-400 mt-0.5">Each question is paired with a known-correct KB article or script. Retrieval metrics are computed against this set.</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <th className="py-2 px-4 font-semibold">ID</th><th className="py-2 px-4 font-semibold">Question</th><th className="py-2 px-4 font-semibold">Type</th><th className="py-2 px-4 font-semibold">Target</th><th className="py-2 px-4 font-semibold">Difficulty</th>
            </tr></thead>
            <tbody>
              {questions.slice(0, 15).map(q => (
                <tr key={q.Question_ID} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-4 text-sm font-mono text-slate-400">{q.Question_ID}</td>
                  <td className="py-2 px-4 text-slate-700 max-w-md truncate">{q.Question_Text?.substring(0, 90)}</td>
                  <td className="py-2 px-4"><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${q.Answer_Type==="KB"?"bg-blue-50 text-blue-700":q.Answer_Type==="SCRIPT"?"bg-orange-50 text-orange-700":"bg-emerald-50 text-emerald-700"}`}>{q.Answer_Type}</span></td>
                  <td className="py-2 px-4 text-sm font-mono text-slate-400">{q.Target_ID}</td>
                  <td className="py-2 px-4"><span className={`text-xs px-1.5 py-0.5 rounded font-medium ${q.Difficulty==="Hard"?"bg-red-50 text-red-700":q.Difficulty==="Medium"?"bg-amber-50 text-amber-700":"bg-emerald-50 text-emerald-700"}`}>{q.Difficulty}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {questions.length > 15 && <p className="text-sm text-slate-400 p-3 text-center border-t border-slate-100">Showing 15 of {questions.length} evaluation questions</p>}
        </div>
      </div>
    </Shell>
  );
}
