"use client";
import { useState, useEffect } from "react";

export default function SentimentHeatmap() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "heatmap" }) })
      .then(r => r.json()).then(setData);
  }, []);

  if (!data) return null;

  const sentColors: Record<string, { bg: string; text: string }> = {
    Frustrated: { bg: "bg-red-500", text: "text-white" },
    Negative: { bg: "bg-orange-400", text: "text-white" },
    Neutral: { bg: "bg-blue-400", text: "text-white" },
    Positive: { bg: "bg-emerald-500", text: "text-white" },
    Relieved: { bg: "bg-teal-400", text: "text-white" },
    Curious: { bg: "bg-purple-400", text: "text-white" },
  };

  const sentLabels = ["Frustrated", "Negative", "Neutral", "Positive", "Relieved", "Curious"];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Sentiment Heatmap</p>
      </div>
      <p className="text-sm text-slate-500 mb-4">Where customer frustration concentrates — module × sentiment</p>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-xs text-slate-500 font-semibold w-40">Module</th>
              {sentLabels.map(s => (
                <th key={s} className="text-center py-2 px-1 text-xs text-slate-500 font-semibold">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.modules?.slice(0, 10).map((mod: string) => (
              <tr key={mod} className="border-t border-slate-100">
                <td className="py-2 px-2 text-sm text-slate-700 font-medium">{mod}</td>
                {sentLabels.map(sent => {
                  const cell = data.cells?.find((c: any) => c.module === mod && c.sentiment === sent);
                  const count = cell?.count || 0;
                  const colors = sentColors[sent] || { bg: "bg-slate-300", text: "text-white" };
                  return (
                    <td key={sent} className="py-2 px-1 text-center">
                      {count > 0 ? (
                        <span className={`inline-flex items-center justify-center w-10 h-8 rounded ${colors.bg} ${colors.text} text-xs font-bold`} style={{ opacity: Math.max(0.3, cell?.intensity || 0) }}>
                          {count}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-10 h-8 rounded bg-slate-50 text-slate-300 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
