"use client";
import { useState } from "react";

export default function KBSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setLoading(true); setResults(null);
    try { const res = await fetch("/api/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: query.trim() }) }); setResults(await res.json()); } catch {}
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Knowledge Base Search</p>
      <p className="text-sm text-slate-500 mb-3">Type a support question — TF-IDF cosine similarity finds the best matching articles</p>

      <div className="flex gap-2 mb-3">
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && search()}
          placeholder="e.g. tenant can't complete move-in..."
          className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rp-teal focus:ring-1 focus:ring-rp-teal" />
        <button onClick={search} disabled={loading || !query.trim()}
          className="px-5 py-2.5 bg-rp-teal text-white text-sm font-semibold rounded-lg hover:bg-rp-teal/90 disabled:opacity-50 transition-colors whitespace-nowrap">
          {loading ? "..." : "Search"}
        </button>
      </div>

      {!results && (
        <div>
          <p className="text-xs text-slate-400 mb-2">Try these:</p>
          <div className="flex flex-wrap gap-1.5">
            {["tenant can't complete move-in","TRACS file submission error","HAP payment mismatch","certification workflow blocked"].map(s => (
              <button key={s} onClick={() => setQuery(s)} className="text-xs px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-200 hover:border-rp-teal hover:text-rp-teal transition-colors">{s}</button>
            ))}
          </div>
        </div>
      )}

      {results && (
        <div className="space-y-3 fade-up">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Searched {results.totalSearched?.articles} articles</p>
            <span className={`text-xs px-2.5 py-1 rounded font-semibold ${results.hasCoverage ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              {results.hasCoverage ? "Coverage found" : "Coverage gap"}
            </span>
          </div>

          {results.articles?.length > 0 ? (
            <div>{results.articles.slice(0, 4).map((a: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-100">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm text-slate-800 font-medium truncate">{a.Title}</p>
                  <p className="text-xs text-slate-400">{a.Category || "General"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rp-teal rounded-full" style={{ width: `${Math.min(100, a.relevance)}%` }} />
                  </div>
                  <span className="text-sm font-bold text-rp-teal w-10 text-right">{a.relevance}%</span>
                </div>
              </div>
            ))}</div>
          ) : <p className="text-sm text-slate-500 italic">No matching articles found</p>}

          {!results.hasCoverage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-800">Knowledge gap identified</p>
              <p className="text-sm text-amber-700 mt-1">No high-confidence KB match. Navigate to a cluster to auto-generate an article.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
