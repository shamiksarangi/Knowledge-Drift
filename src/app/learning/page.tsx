import Shell from "@/components/Shell";
import { getLearningEvents } from "@/lib/data";

export default async function LearningPage() {
  const events = await getLearningEvents();
  const sorted = [...events].sort((a, b) => new Date(b.Event_Timestamp).getTime() - new Date(a.Event_Timestamp).getTime());
  const approved = events.filter(e => e.Final_Status === "Approved").length;
  const rejected = events.filter(e => e.Final_Status === "Rejected").length;
  const rate = events.length > 0 ? ((approved / events.length) * 100) : 0;
  const roles: Record<string, number> = {};
  events.forEach(e => { roles[e.Reviewer_Role] = (roles[e.Reviewer_Role] || 0) + 1; });

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Self-Learning Engine</h1>
          <p className="text-sm text-slate-500 mt-0.5">AI-detected knowledge gaps and auto-generated KB articles for PropertySuite</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">Total Events</p><p className="text-2xl font-bold text-slate-900 mt-1">{events.length}</p></div>
          <div className="bg-white rounded-lg border border-emerald-200 p-4"><p className="text-xs text-emerald-600">Approved</p><p className="text-2xl font-bold text-emerald-700 mt-1">{approved}</p></div>
          <div className="bg-white rounded-lg border border-red-200 p-4"><p className="text-xs text-red-600">Rejected</p><p className="text-2xl font-bold text-red-700 mt-1">{rejected}</p></div>
          <div className="bg-white rounded-lg border border-slate-200 p-4"><p className="text-xs text-slate-500">Approval Rate</p><p className="text-2xl font-bold text-slate-900 mt-1">{rate.toFixed(0)}%</p></div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Reviewer Roles</p>
          <div className="flex gap-3">
            {Object.entries(roles).sort((a,b)=>b[1]-a[1]).map(([role,count])=>(
              <div key={role} className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                <p className="text-lg font-bold text-slate-900">{count}</p>
                <p className="text-xs text-slate-500">{role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200"><p className="text-sm font-semibold text-slate-900">Learning Events Timeline</p></div>
          <div className="divide-y divide-slate-100">
            {sorted.map((e) => (
              <div key={e.Event_ID} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{e.Draft_Summary || e.Detected_Gap}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-mono text-slate-400">{e.Event_ID}</span>
                      <span className="text-xs text-slate-400">{e.Reviewer_Role}</span>
                      <span className="text-xs text-slate-400">{e.Trigger_Ticket_Number}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${e.Final_Status==="Approved"?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}`}>{e.Final_Status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
