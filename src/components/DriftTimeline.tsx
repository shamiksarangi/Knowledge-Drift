"use client";
import { useState, useEffect } from "react";

export default function DriftTimeline() {
  const [events, setEvents] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "drift" }) })
      .then(r => r.json()).then(d => { setEvents(d.timeline || []); setLoaded(true); });
  }, []);

  const icons: Record<string, { color: string; label: string }> = {
    gap_detected: { color: "bg-red-500", label: "Gap" },
    article_generated: { color: "bg-emerald-500", label: "Generated" },
    article_decayed: { color: "bg-amber-500", label: "Decayed" },
    spike_detected: { color: "bg-purple-500", label: "Spike" },
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-rp-teal" />
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Knowledge Drift Timeline</p>
      </div>
      <p className="text-sm text-slate-500 mb-4">Real-time feed of knowledge gaps, AI generations, decay events, and anomalies</p>

      {loaded && events.length > 0 && (
        <div className="relative">
          <div className="absolute left-[9px] top-0 bottom-0 w-px bg-slate-200" />
          <div className="space-y-4">
            {events.slice(0, 10).map((e, i) => {
              const icon = icons[e.type] || { color: "bg-slate-400", label: "Event" };
              return (
                <div key={i} className="flex gap-3 relative fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`w-[18px] h-[18px] rounded-full ${icon.color} flex-shrink-0 z-10 flex items-center justify-center`}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="flex-1 pb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${e.impact === "positive" ? "bg-emerald-50 text-emerald-700" : e.impact === "negative" ? "bg-red-50 text-red-700" : "bg-slate-100 text-slate-500"}`}>{icon.label}</span>
                    <p className="text-sm text-slate-700 mt-1 leading-relaxed">{e.detail?.substring(0, 120)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
