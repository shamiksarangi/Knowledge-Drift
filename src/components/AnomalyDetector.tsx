"use client";
import { useState } from "react";

export default function AnomalyDetector() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function detect() {
    setLoading(true);
    const res = await fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "anomalies" }) });
    setData(await res.json()); setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Anomaly Detection</p>
        </div>
        <button onClick={detect} disabled={loading}
          className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors">
          {loading ? "Scanning..." : "Run Z-Score Analysis"}
        </button>
      </div>
      <p className="text-sm text-slate-500 mb-4">Statistical anomaly detection using Z-score on ticket velocity per category</p>

      {data && (
        <div className="space-y-2 fade-up">
          <div className="flex gap-2 mb-3">
            <span className="text-xs px-3 py-1 bg-red-50 text-red-700 rounded-full font-semibold">{data.anomalies?.filter((a:any) => a.isAnomaly).length} anomalies found</span>
            <span className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full">{data.anomalies?.length} categories scanned</span>
          </div>
          {data.anomalies?.slice(0, 6).map((a: any) => (
            <div key={a.category} className={`flex items-center gap-3 p-3 rounded-lg border ${a.isAnomaly ? (a.direction === "spike" ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200") : "bg-slate-50 border-slate-100"}`}>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${a.isAnomaly ? "text-slate-900" : "text-slate-500"}`}>{a.category}</p>
                <p className="text-xs text-slate-400 mt-0.5">Baseline: {a.mean} ± {a.stdDev} per week</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${a.isAnomaly ? (a.direction === "spike" ? "text-red-600" : "text-blue-600") : "text-slate-400"}`}>{a.count}</p>
                <p className={`text-xs font-semibold ${Math.abs(a.zScore) > 1.5 ? "text-red-500" : "text-slate-400"}`}>z = {a.zScore}</p>
              </div>
              {a.isAnomaly && <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${a.direction === "spike" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>{a.direction}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
