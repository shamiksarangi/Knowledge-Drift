"use client";
import { useState } from "react";

export default function AgentCopilot() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!message.trim()) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/copilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: message.trim() }) });
      setResult(await res.json());
    } catch {}
    setLoading(false);
  }

  function copyResponse() {
    if (result?.suggestedResponse) { navigator.clipboard.writeText(result.suggestedResponse); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-purple-500" />
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Agent Copilot</p>
      </div>
      <p className="text-sm text-slate-500 mb-3">Paste a customer message — AI generates a KB-grounded response with citations</p>

      <textarea value={message} onChange={e => setMessage(e.target.value)}
        placeholder="Paste customer message here..."
        rows={3}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 resize-none" />

      <div className="mt-3">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {["TRACS file submission failing", "Certification workflow stuck"].map(e => (
            <button key={e} onClick={() => setMessage(e)} className="text-xs px-2.5 py-1 bg-purple-50 text-purple-600 rounded-full border border-purple-100 hover:bg-purple-100 transition-colors">{e}</button>
          ))}
        </div>
        <button onClick={generate} disabled={loading || !message.trim()}
          className="w-full px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
          {loading ? "Generating..." : "Generate Response"}
        </button>
      </div>

      {result && (
        <div className="mt-4 space-y-3 fade-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded font-semibold ${result.confidence==="high"?"bg-emerald-50 text-emerald-700":result.confidence==="medium"?"bg-amber-50 text-amber-700":"bg-red-50 text-red-700"}`}>{result.confidence} confidence</span>
              <span className={`text-xs px-2 py-1 rounded font-semibold ${result.escalationRisk==="low"?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}`}>{result.escalationRisk} esc. risk</span>
            </div>
            <button onClick={copyResponse} className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">{copied ? "Copied!" : "Copy"}</button>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
            <p className="text-xs text-purple-500 font-semibold mb-2">Suggested Response</p>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{result.suggestedResponse}</p>
          </div>
          {result.citations?.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 font-semibold mb-1.5">KB Citations</p>
              {result.citations.map((c: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-700 truncate flex-1">{c.title}</span>
                  <span className="text-sm font-bold text-purple-600 ml-3">{c.relevance}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
