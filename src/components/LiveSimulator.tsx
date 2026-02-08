"use client";
import { useState } from "react";

interface SimResult {
  ticket: { number: string; subject: string; category: string; priority: string; tier: number; account: string; property: string; resolution: string };
  pipeline: { keywords: { term: string; score: number }[]; clusterMatches: { id: string; name: string; severity: string; similarity: number }[]; kbMatches: { id: string; title: string; relevance: number }[]; hasGap: boolean; recommendation: string };
}

export default function LiveSimulator() {
  const [result, setResult] = useState<SimResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  async function simulate() {
    setLoading(true); setResult(null); setStep(0);
    try {
      setStep(1); await new Promise(r => setTimeout(r, 600));
      setStep(2); await new Promise(r => setTimeout(r, 500));
      const res = await fetch("/api/simulate", { method: "POST" });
      const data = await res.json();
      setStep(3); await new Promise(r => setTimeout(r, 400));
      setStep(4); await new Promise(r => setTimeout(r, 300));
      setResult(data); setStep(5);
    } catch { setStep(0); }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Live Pipeline Demo</p>
        <button onClick={simulate} disabled={loading}
          className="px-4 py-2 bg-rp-navy text-white text-sm font-semibold rounded-lg hover:bg-rp-dark disabled:opacity-50 transition-colors">
          {loading ? "Processing..." : "Simulate Ticket"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">Watch KnowledgeDrift process a real ticket through the full pipeline</p>

      <div className="space-y-2 mb-4">
        {[
          { n: 1, label: "Ticket received" },
          { n: 2, label: "TF-IDF keyword extraction" },
          { n: 3, label: "Cosine similarity cluster matching" },
          { n: 4, label: "KB article search" },
          { n: 5, label: "Coverage analysis complete" },
        ].map(s => (
          <div key={s.n} className={`flex items-center gap-3 p-2.5 rounded-lg transition-all duration-300 ${step >= s.n ? "bg-rp-light" : step === s.n - 1 && loading ? "bg-amber-50" : "bg-slate-50"}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s.n ? "bg-rp-teal text-white" : step === s.n - 1 && loading ? "bg-amber-400 text-white animate-pulse" : "bg-slate-200 text-slate-400"}`}>
              {step >= s.n ? "✓" : s.n}
            </div>
            <p className={`text-sm font-medium ${step >= s.n ? "text-rp-navy" : "text-slate-400"}`}>{s.label}</p>
            {step === s.n - 1 && loading && <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin ml-auto" />}
          </div>
        ))}
      </div>

      {result && (
        <div className="space-y-3 fade-up">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-slate-400">{result.ticket.number}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${result.ticket.priority==="Critical"?"bg-red-100 text-red-700":result.ticket.priority==="High"?"bg-orange-100 text-orange-700":"bg-slate-100 text-slate-600"}`}>{result.ticket.priority}</span>
              <span className="text-xs text-slate-500">Tier {result.ticket.tier}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{result.ticket.subject}</p>
            <p className="text-xs text-slate-500 mt-1">{result.ticket.account} · {result.ticket.property}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {result.pipeline.keywords.map(k => (
              <span key={k.term} className="text-xs px-2.5 py-1 bg-rp-light text-rp-navy rounded-full font-medium">{k.term} <span className="text-rp-teal font-bold">{k.score}</span></span>
            ))}
          </div>

          {result.pipeline.clusterMatches.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-1.5">Matched Clusters</p>
              {result.pipeline.clusterMatches.map(c => (
                <div key={c.id} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-slate-700 truncate flex-1">{c.name.substring(0,45)}</span>
                  <span className="text-sm font-bold text-rp-teal ml-2">{c.similarity}%</span>
                </div>
              ))}
            </div>
          )}

          <div className={`p-3 rounded-lg border ${result.pipeline.hasGap ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
            <p className={`text-sm font-semibold ${result.pipeline.hasGap ? "text-amber-800" : "text-emerald-800"}`}>
              {result.pipeline.hasGap ? "Knowledge gap detected" : "KB coverage found"}
            </p>
            <p className={`text-sm mt-1 ${result.pipeline.hasGap ? "text-amber-700" : "text-emerald-700"}`}>{result.pipeline.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
