"use client";
import { useState } from "react";

export default function EscalationPredictor() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function predict() {
    setLoading(true);
    const res = await fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "predictions" }) });
    setData(await res.json()); setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Escalation Predictor</p>
        </div>
        <button onClick={predict} disabled={loading}
          className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors">
          {loading ? "Computing..." : "Run Logistic Regression"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">Predicts Tier 3 escalation probability using logistic regression on ticket features</p>

      {data && (
        <div className="space-y-2 fade-up">
          <div className="flex gap-2 mb-3">
            <span className="text-xs px-3 py-1 bg-red-50 text-red-700 rounded-full font-semibold">{data.summary?.high} high risk</span>
            <span className="text-xs px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-semibold">{data.summary?.medium} medium</span>
            <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-semibold">{data.summary?.low} low</span>
          </div>
          {data.predictions?.slice(0, 6).map((p: any) => (
            <div key={p.ticketNumber} className={`p-3 rounded-lg border ${p.risk === "high" ? "bg-red-50 border-red-200" : p.risk === "medium" ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono text-slate-400">{p.ticketNumber}</span>
                    {p.factors?.slice(0, 2).map((f: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-white text-slate-500 rounded-full border border-slate-200">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xl font-bold ${p.risk === "high" ? "text-red-600" : p.risk === "medium" ? "text-amber-600" : "text-emerald-600"}`}>{(p.probability * 100).toFixed(0)}%</p>
                  <p className="text-xs text-slate-400">P(escalation)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
