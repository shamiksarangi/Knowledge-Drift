import Shell from "@/components/Shell";
import { getDashboardStats, getClusters, getDecayAlerts, getLearningEvents, getKBQualityScores } from "@/lib/data";
import Link from "next/link";
import LiveSimulator from "@/components/LiveSimulator";
import KBSearch from "@/components/KBSearch";
import AgentCopilot from "@/components/AgentCopilot";
import AnomalyDetector from "@/components/AnomalyDetector";
import EscalationPredictor from "@/components/EscalationPredictor";
import DriftTimeline from "@/components/DriftTimeline";
import SentimentHeatmap from "@/components/SentimentHeatmap";

function Metric({ label, value, sub, alert }: { label: string; value: string | number; sub?: string; alert?: boolean }) {
  return (
    <div className={`bg-white rounded-lg border p-4 ${alert ? "border-red-200" : "border-slate-200"}`}>
      <p className={`text-sm ${alert ? "text-red-500" : "text-slate-400"} font-medium`}>{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Bar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-500 w-24 truncate">{label}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${total > 0 ? (count/total)*100 : 0}%` }} /></div>
      <span className="text-sm font-semibold text-slate-700 w-8 text-right">{count}</span>
    </div>
  );
}

export default async function DashboardPage() {
  const [stats, clusters, decayAlerts, events, kbScores] = await Promise.all([
    getDashboardStats(), getClusters(), getDecayAlerts(), getLearningEvents(), getKBQualityScores(),
  ]);
  const recentEvents = [...events].sort((a, b) => new Date(b.Event_Timestamp).getTime() - new Date(a.Event_Timestamp).getTime()).slice(0, 5);
  const sortedCats = Object.entries(stats.categoryDist).sort((a, b) => b[1] - a[1]);
  const critClusters = clusters.filter(c => c.severity === "Critical" || c.severity === "High").length;
  const approvalRate = stats.totalLearningEvents > 0 ? ((stats.approvedEvents / stats.totalLearningEvents) * 100) : 0;

  return (
    <Shell>
      <div className="space-y-8">
        {/* Hero */}
        <div className="bg-rp-navy rounded-xl p-6">
          <p className="text-xs text-rp-teal uppercase tracking-widest font-semibold">RealPage PropertySuite</p>
          <h1 className="text-2xl font-bold text-white mt-1">Support Intelligence Overview</h1>
          <p className="text-sm text-white/50 mt-1 max-w-2xl">KnowledgeDrift continuously analyzes support interactions to detect failure patterns, auto-generate knowledge articles, predict escalations, and detect anomalies — reducing resolution time and improving first-contact rates.</p>
          <div className="grid grid-cols-4 gap-6 mt-5">
            {[
              { v: stats.totalTickets.toLocaleString(), l: "Tickets Analyzed" },
              { v: clusters.length.toString(), l: "Failure Patterns" },
              { v: stats.generatedKBCount.toString(), l: "AI-Generated Articles" },
              { v: `${approvalRate.toFixed(0)}%`, l: "AI Approval Rate" },
            ].map(m => (<div key={m.l}><p className="text-3xl font-bold text-white">{m.v}</p><p className="text-sm text-white/40">{m.l}</p></div>))}
          </div>
        </div>

        {/* Pipeline flow */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3">Intelligence Pipeline</p>
          <div className="flex items-stretch gap-0">
            {[
              { n: "1", t: "Ingest", d: "1,400+ tickets flow in from PropertySuite", color: "border-rp-teal" },
              { n: "2", t: "Detect", d: "TF-IDF + Z-score anomaly detection on ticket velocity", color: "border-orange-400" },
              { n: "3", t: "Predict", d: "Logistic regression predicts Tier 3 escalation risk", color: "border-red-400" },
              { n: "4", t: "Generate", d: "Mistral-7B drafts KB articles with compliance checks", color: "border-purple-400" },
              { n: "5", t: "Monitor", d: "4-dimension quality scoring with decay alerts", color: "border-emerald-400" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-stretch flex-1">
                <div className={`flex-1 bg-white rounded-lg border-t-2 ${s.color} border border-slate-200 p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-rp-navy text-white text-xs font-bold flex items-center justify-center">{s.n}</span>
                    <span className="text-sm font-semibold text-slate-900">{s.t}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.d}</p>
                </div>
                {i < 4 && <div className="flex items-center px-1"><svg className="w-3 h-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>}
              </div>
            ))}
          </div>
        </div>

        {/* LIVE TOOLS ROW 1 — Simulator + Search + Copilot */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3">Live AI Tools</p>
          <div className="grid grid-cols-3 gap-6">
            <LiveSimulator />
            <KBSearch />
            <AgentCopilot />
          </div>
        </div>

        {/* ANALYTICS ROW — Anomaly + Predictor */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3">Predictive Analytics</p>
          <div className="grid grid-cols-2 gap-6">
            <AnomalyDetector />
            <EscalationPredictor />
          </div>
        </div>

        {/* DRIFT + HEATMAP ROW */}
        <div className="grid grid-cols-2 gap-6">
          <DriftTimeline />
          <SentimentHeatmap />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-6 gap-3">
          <Metric label="Tickets" value={stats.totalTickets.toLocaleString()} sub="PropertySuite modules" />
          <Metric label="Conversations" value={stats.totalConversations.toLocaleString()} sub="Chat, Phone, Email" />
          <Metric label="KB Articles" value={stats.totalKBArticles.toLocaleString()} sub={`${stats.generatedKBCount} AI-generated`} />
          <Metric label="Agent Scripts" value={stats.totalScripts} sub="Resolution procedures" />
          <Metric label="Clusters" value={clusters.length} sub={`${critClusters} high/critical`} />
          <Metric label="Decay Alerts" value={decayAlerts.length} sub={`${decayAlerts.filter(a=>a.severity==="critical").length} critical`} alert={decayAlerts.length > 5} />
        </div>

        {/* Distribution */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3">Ticket Priority</p>
            <div className="space-y-2.5">{(["Critical","High","Medium","Low"] as const).map(p => (
              <Bar key={p} label={p} count={stats.priorityDist[p]||0} total={stats.totalTickets}
                color={p==="Critical"?"bg-red-500":p==="High"?"bg-orange-400":p==="Medium"?"bg-amber-400":"bg-emerald-500"} />
            ))}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3">Support Tier</p>
            <div className="space-y-2.5">{Object.entries(stats.tierDist).sort((a,b)=>a[0].localeCompare(b[0])).map(([t,c])=>(
              <Bar key={t} label={t} count={c} total={stats.totalTickets} color={t.includes("1")?"bg-emerald-500":t.includes("2")?"bg-amber-400":"bg-red-500"} />
            ))}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-3">Customer Sentiment</p>
            <div className="space-y-2.5">{Object.entries(stats.sentimentDist).sort((a,b)=>b[1]-a[1]).map(([s,c])=>(
              <Bar key={s} label={s} count={c} total={stats.totalConversations} color={s==="Positive"?"bg-emerald-500":s==="Neutral"?"bg-blue-400":s==="Negative"?"bg-orange-400":"bg-red-500"} />
            ))}</div>
          </div>
        </div>

        {/* Module + Learning */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">PropertySuite Module Breakdown</p>
            <p className="text-sm text-slate-400 mb-3">Higher ticket volume may indicate documentation gaps</p>
            <div className="space-y-2">{sortedCats.slice(0,10).map(([cat,count])=>(<Bar key={cat} label={cat} count={count} total={stats.totalTickets} color="bg-rp-navy" />))}</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Recent Learning Events</p>
              <Link href="/learning" className="text-sm text-rp-teal hover:underline">View all</Link>
            </div>
            <p className="text-sm text-slate-400 mb-3">AI-detected gaps and auto-generated proposals</p>
            <div className="space-y-2">{recentEvents.map(e => (
              <div key={e.Event_ID} className="flex items-start gap-2 p-2.5 border border-slate-100 rounded-lg">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${e.Final_Status==="Approved"?"bg-emerald-500":"bg-red-400"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 line-clamp-2">{e.Draft_Summary||e.Detected_Gap}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium mt-1 inline-block ${e.Final_Status==="Approved"?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}`}>{e.Final_Status}</span>
                </div>
              </div>
            ))}</div>
          </div>
        </div>

        {/* Clusters table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Top Root Cause Clusters</p>
              <p className="text-sm text-slate-400 mt-0.5">Click a pattern to run AI analysis and auto-generate a KB article</p>
            </div>
            <Link href="/root-cause" className="text-sm text-rp-teal hover:underline">View all {clusters.length}</Link>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <th className="py-2 px-4 font-semibold">Pattern</th><th className="py-2 px-4 font-semibold">Module</th><th className="py-2 px-4 font-semibold">Tickets</th><th className="py-2 px-4 font-semibold">Severity</th><th className="py-2 px-4 font-semibold">Escalation</th>
            </tr></thead>
            <tbody>{clusters.slice(0,8).map(c=>(
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-4"><Link href={`/root-cause/${c.id}`} className="text-rp-navy hover:text-rp-teal font-medium text-sm">{c.name.substring(0,55)}</Link></td>
                <td className="py-2.5 px-4 text-sm text-slate-500">{c.category}</td>
                <td className="py-2.5 px-4 font-semibold text-sm">{c.ticketCount}</td>
                <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${c.severity==="Critical"?"bg-red-100 text-red-700":c.severity==="High"?"bg-orange-100 text-orange-700":c.severity==="Medium"?"bg-amber-100 text-amber-700":"bg-emerald-100 text-emerald-700"}`}>{c.severity}</span></td>
                <td className="py-2.5 px-4 text-sm text-slate-500">{c.escalationRate}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
