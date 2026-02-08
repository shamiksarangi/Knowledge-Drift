"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import Link from "next/link";

export default function ClusterDetail({ params }: { params: { id: string } }) {
  const [cluster, setCluster] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [kbResult, setKBResult] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clusters/${params.id}`).then(r => r.json()).then(data => {
      setCluster(data.cluster); setTickets(data.tickets || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  async function runAnalysis() {
    setAnalyzing(true); setError(null); setAnalysis(null);
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "analyze-cluster", clusterId: params.id }) });
      const data = await res.json();
      if (data.success) setAnalysis({ ...data.analysis, meta: data.meta });
      else setError(data.error);
    } catch { setError("Connection failed"); }
    setAnalyzing(false);
  }

  async function generateKB() {
    setGenerating(true); setError(null); setKBResult(null);
    try {
      const res = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-kb", clusterId: params.id }) });
      const data = await res.json();
      if (data.success) setKBResult(data);
      else setError(data.error);
    } catch { setError("Connection failed"); }
    setGenerating(false);
  }

  if (loading) return <Shell><div className="flex items-center justify-center h-64"><div className="text-center"><div className="w-6 h-6 border-2 border-rp-teal border-t-transparent rounded-full animate-spin mx-auto" /><p className="text-sm text-slate-400 mt-3">Loading cluster data...</p></div></div></Shell>;
  if (!cluster) return <Shell><div className="text-center py-20"><p className="text-slate-500">Cluster not found</p></div></Shell>;

  // Impact projections
  const escRate = cluster.escalationRate || 0;
  const t3Count = Math.round(cluster.ticketCount * escRate / 100);
  const avgRes = cluster.avgResolutionTime > 0 ? Math.round(cluster.avgResolutionTime / 60) : 45;
  const projEscRate = Math.max(8, Math.round(escRate * 0.3));
  const projT3 = Math.round(cluster.ticketCount * projEscRate / 100);
  const projRes = Math.round(avgRes * 0.45);
  const savedMinutes = (t3Count - projT3) * 45;
  const savedCost = Math.round(savedMinutes * 1.2);

  return (
    <Shell>
      <div className="space-y-5">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link href="/root-cause" className="hover:text-rp-teal">Root Cause Mining</Link><span>/</span><span className="text-slate-700 font-medium">{cluster.id}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2.5 py-1 rounded text-sm font-semibold ${cluster.severity==="Critical"?"bg-red-100 text-red-700":cluster.severity==="High"?"bg-orange-100 text-orange-700":cluster.severity==="Medium"?"bg-amber-100 text-amber-700":"bg-emerald-100 text-emerald-700"}`}>{cluster.severity}</span>
            <h1 className="text-lg font-bold text-slate-900">{cluster.name}</h1>
          </div>
          <p className="text-sm text-slate-500">{cluster.description}</p>
          <div className="grid grid-cols-5 gap-3 mt-4">
            {[
              { v: cluster.ticketCount, l: "Tickets in cluster" },
              { v: `${escRate}%`, l: "Escalation rate" },
              { v: avgRes > 0 ? `${avgRes}h` : "—", l: "Avg resolution" },
              { v: cluster.relatedKBs?.length || 0, l: "Linked KB articles" },
              { v: cluster.relatedScripts?.length || 0, l: "Agent scripts" },
            ].map(m => (<div key={m.l} className="text-center p-3 bg-slate-50 rounded-lg"><p className="text-xl font-bold text-slate-900">{m.v}</p><p className="text-xs text-slate-400">{m.l}</p></div>))}
          </div>
        </div>

        {/* AI Panel */}
        <div className="bg-rp-navy rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">AI Analysis Engine</p>
              <p className="text-sm text-white/40 mt-0.5">Analyze {cluster.ticketCount} tickets — identify root causes, extract resolutions, generate KB articles</p>
            </div>
            <div className="flex gap-3">
              <button onClick={runAnalysis} disabled={analyzing}
                className="px-4 py-2 bg-white text-rp-navy text-sm font-semibold rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors">
                {analyzing ? "Analyzing..." : "Analyze Root Cause"}
              </button>
              <button onClick={generateKB} disabled={generating}
                className="px-4 py-2 bg-rp-teal text-white text-sm font-semibold rounded-lg hover:bg-rp-teal/90 disabled:opacity-50 transition-colors">
                {generating ? "Generating..." : "Generate KB Article"}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-700">{error}</p></div>}

        {/* BEFORE / AFTER IMPACT — shows when either result exists */}
        {(analysis || kbResult) && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 fade-up">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">Projected Impact</p>
            <div className="grid grid-cols-7 gap-0 items-center">
              {/* Before */}
              <div className="col-span-3 p-4 bg-red-50 rounded-lg border border-red-100">
                <p className="text-xs text-red-600 font-semibold uppercase tracking-wider mb-3">Before KnowledgeDrift</p>
                <div className="space-y-3">
                  <div><p className="text-2xl font-bold text-red-700">{escRate}%</p><p className="text-xs text-red-500">Escalation rate</p></div>
                  <div><p className="text-2xl font-bold text-red-700">{avgRes}h</p><p className="text-xs text-red-500">Avg resolution time</p></div>
                  <div><p className="text-2xl font-bold text-red-700">{t3Count}</p><p className="text-xs text-red-500">Tier 3 escalations/month</p></div>
                </div>
              </div>
              {/* Arrow */}
              <div className="col-span-1 flex flex-col items-center justify-center">
                <svg className="w-8 h-8 text-rp-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                <p className="text-xs text-slate-400 mt-1 text-center">With AI-generated KB</p>
              </div>
              {/* After */}
              <div className="col-span-3 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-3">After KnowledgeDrift</p>
                <div className="space-y-3">
                  <div><p className="text-2xl font-bold text-emerald-700">{projEscRate}%</p><p className="text-xs text-emerald-500">Projected escalation rate</p></div>
                  <div><p className="text-2xl font-bold text-emerald-700">{projRes}h</p><p className="text-xs text-emerald-500">Projected resolution time</p></div>
                  <div><p className="text-2xl font-bold text-emerald-700">{projT3}</p><p className="text-xs text-emerald-500">Projected Tier 3/month</p></div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-rp-light rounded-lg text-center">
              <p className="text-sm font-semibold text-rp-navy">Estimated monthly savings: <span className="text-rp-teal">${savedCost.toLocaleString()}</span></p>
              <p className="text-xs text-rp-navy/50 mt-0.5">{savedMinutes.toLocaleString()} agent-minutes recovered · {t3Count - projT3} escalations deflected · Based on $1.20/min Tier 3 cost</p>
            </div>
          </div>
        )}

        {/* ANALYSIS RESULT */}
        {analysis && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 fade-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">Root Cause Analysis</p>
                <p className="text-xs text-slate-400 mt-0.5">{analysis.meta?.ticketsAnalyzed} tickets · {analysis.source === "mistral-7b" ? "Mistral-7B" : "Pattern Analysis Engine"} · {analysis.meta?.timestamp ? new Date(analysis.meta.timestamp).toLocaleTimeString() : ""}</p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${analysis.severity==="Critical"?"bg-red-100 text-red-700":analysis.severity==="High"?"bg-orange-100 text-orange-700":"bg-amber-100 text-amber-700"}`}>{analysis.severity}</span>
            </div>
            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Identified Pattern</p>
                <p className="text-[15px] font-semibold text-slate-900 mt-1">{analysis.pattern_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Root Cause Analysis</p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed whitespace-pre-line">{analysis.root_cause}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Reported Symptoms ({analysis.common_symptoms?.length})</p>
                <div className="mt-2 space-y-1.5">{analysis.common_symptoms?.map((s: string, i: number) => (
                  <div key={i} className="text-sm text-slate-700 p-2 bg-slate-50 rounded border border-slate-100">{s}</div>
                ))}</div>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Resolution Procedure</p>
                <div className="mt-2 space-y-2">{analysis.resolution_steps?.map((s: string, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-rp-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                    <p className="text-sm text-slate-700 leading-relaxed">{s}</p>
                  </div>
                ))}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-rp-light rounded-lg">
                  <p className="text-xs text-rp-navy/60 uppercase tracking-widest font-semibold">Recommended Action</p>
                  <p className="text-sm text-rp-navy mt-1 leading-relaxed">{analysis.recommended_action}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-800/60 uppercase tracking-widest font-semibold">Estimated Impact</p>
                  <p className="text-sm text-emerald-800 mt-1 leading-relaxed">{analysis.estimated_impact}</p>
                </div>
              </div>
              {analysis.technical_details && (
                <details className="group">
                  <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-600">View technical breakdown</summary>
                  <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 space-y-1">
                    <p>Sample: {analysis.technical_details.sample_size} tickets · {analysis.technical_details.unique_accounts} accounts</p>
                    <p>Tier: {Object.entries(analysis.technical_details.tier_distribution || {}).map(([t,c])=>`T${t}: ${c}`).join(", ")}</p>
                    <p>Priority: {Object.entries(analysis.technical_details.priority_distribution || {}).map(([p,c])=>`${p}: ${c}`).join(", ")}</p>
                    {analysis.technical_details.top_root_causes?.map((rc: any, i: number) => (
                      <p key={i}>Cause #{i+1}: {rc.cause.substring(0,80)} ({rc.pct}%)</p>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        )}

        {/* KB RESULT */}
        {kbResult && (
          <div className="bg-white rounded-lg border border-slate-200 p-5 fade-up">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">Generated Knowledge Base Article</p>
                <p className="text-xs text-slate-400 mt-0.5">From {kbResult.metadata?.sourceTickets} tickets · {kbResult.metadata?.aiSource === "mistral-7b" ? "Mistral-7B" : "Template Engine"} · {kbResult.metadata?.generatedAt ? new Date(kbResult.metadata.generatedAt).toLocaleTimeString() : ""}</p>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${kbResult.compliance?.passed?"bg-emerald-50 text-emerald-700 border-emerald-200":"bg-red-50 text-red-700 border-red-200"}`}>
                {kbResult.compliance?.passed ? "Compliance passed" : "Issues found"} · {kbResult.compliance?.checks_run?.length || 5} checks
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900">{kbResult.article?.title}</h4>
            <p className="text-sm text-slate-500 mt-1">{kbResult.article?.summary}</p>
            <div className="flex gap-1.5 mt-2">
              <span className="text-xs px-2 py-0.5 bg-rp-light text-rp-navy rounded font-medium">{kbResult.article?.category}</span>
              {kbResult.article?.tags?.map((t: string, i: number) => (<span key={i} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">{t}</span>))}
            </div>
            <div className="bg-slate-50 rounded-lg p-5 mt-4 max-h-[450px] overflow-y-auto scrollbar-thin border border-slate-100">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-sans">{kbResult.article?.content}</pre>
            </div>
            <div className={`mt-3 p-3 rounded-lg border text-sm ${kbResult.compliance?.passed?"bg-emerald-50 border-emerald-100":"bg-red-50 border-red-200"}`}>
              <p className="font-semibold text-slate-600 mb-1">Compliance: {kbResult.compliance?.risk_level} risk · {kbResult.compliance?.checks_run?.join(", ")}</p>
              {kbResult.compliance?.violations?.map((v: string, i: number) => <p key={`v${i}`} className="text-red-600 mt-0.5">✕ {v}</p>)}
              {kbResult.compliance?.warnings?.map((w: string, i: number) => <p key={`w${i}`} className="text-amber-600 mt-0.5">⚠ {w}</p>)}
              {kbResult.compliance?.suggestions?.map((s: string, i: number) => <p key={`s${i}`} className="text-blue-600 mt-0.5">→ {s}</p>)}
            </div>
          </div>
        )}

        {/* Tickets */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-900">Cluster Tickets ({tickets.length})</p>
            <p className="text-sm text-slate-400 mt-0.5">Individual support tickets grouped into this failure pattern</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <th className="py-2 px-4 font-semibold">Ticket</th><th className="py-2 px-4 font-semibold">Subject</th><th className="py-2 px-4 font-semibold">Priority</th><th className="py-2 px-4 font-semibold">Tier</th><th className="py-2 px-4 font-semibold">Account</th>
            </tr></thead>
            <tbody>{tickets.slice(0,20).map((t: any) => (
              <tr key={t.Ticket_Number} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2 px-4 font-mono text-sm text-slate-400">{t.Ticket_Number}</td>
                <td className="py-2 px-4 text-slate-700 max-w-xs truncate">{t.Subject}</td>
                <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${t.Priority==="Critical"?"bg-red-100 text-red-700":t.Priority==="High"?"bg-orange-100 text-orange-700":"bg-slate-100 text-slate-500"}`}>{t.Priority}</span></td>
                <td className="py-2 px-4 text-sm">{Math.round(t.Tier)}</td>
                <td className="py-2 px-4 text-sm text-slate-500 truncate max-w-[150px]">{t.Account_Name}</td>
              </tr>
            ))}</tbody>
          </table>
          {tickets.length > 20 && <p className="text-sm text-slate-400 p-3 text-center border-t border-slate-100">Showing 20 of {tickets.length}</p>}
        </div>
      </div>
    </Shell>
  );
}
