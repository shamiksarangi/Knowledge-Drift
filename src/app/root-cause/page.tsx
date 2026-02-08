import Shell from "@/components/Shell";
import { getClusters } from "@/lib/data";
import Link from "next/link";

export default async function RootCausePage() {
  const clusters = await getClusters();
  const sev = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  clusters.forEach(c => { if (c.severity in sev) (sev as any)[c.severity]++; });
  const total = clusters.reduce((a, c) => a + c.ticketCount, 0);
  const avgEsc = clusters.length > 0 ? clusters.reduce((a, c) => a + c.escalationRate, 0) / clusters.length : 0;

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Root Cause Intelligence Mining</h1>
          <p className="text-sm text-slate-400 mt-0.5">KnowledgeDrift groups {total.toLocaleString()} PropertySuite tickets into {clusters.length} failure patterns by analyzing category, root cause, and resolution similarity. Click any cluster to run AI analysis.</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {(["Critical","High","Medium","Low"] as const).map(s => (
            <div key={s} className={`bg-white rounded-lg border p-4 ${s==="Critical"?"border-red-200":s==="High"?"border-orange-200":s==="Medium"?"border-amber-200":"border-emerald-200"}`}>
              <p className="text-2xl font-bold text-slate-900">{sev[s]}</p>
              <p className="text-sm text-slate-500 mt-0.5">{s} clusters</p>
            </div>
          ))}
        </div>

        {/* Galaxy visualization */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-slate-900">Cluster Galaxy</p>
            <p className="text-xs text-slate-400">Avg escalation: {avgEsc.toFixed(0)}%</p>
          </div>
          <p className="text-sm text-slate-400 mb-4">Each bubble represents a failure pattern. Size indicates ticket volume, color indicates severity. Hover for details, click to analyze.</p>
          <div className="relative h-72 bg-rp-dark rounded-lg overflow-hidden">
            {Array.from({length:50}).map((_,i)=>(<div key={`s${i}`} className="absolute w-px h-px bg-white/20 rounded-full" style={{left:`${(i*17+7)%100}%`,top:`${(i*13+3)%100}%`}}/>))}
            {clusters.slice(0,25).map((cl,i)=>{
              const size = Math.max(14, Math.min(70, cl.ticketCount * 1.5));
              const col=i%5, row=Math.floor(i/5);
              const left=6+col*18+(row%2)*5, top=5+row*19;
              const colors:Record<string,string>={Critical:"bg-red-500/70 hover:bg-red-400",High:"bg-orange-400/70 hover:bg-orange-300",Medium:"bg-amber-400/60 hover:bg-amber-300",Low:"bg-emerald-400/60 hover:bg-emerald-300"};
              return (
                <Link key={cl.id} href={`/root-cause/${cl.id}`} className="absolute group" style={{left:`${left}%`,top:`${top}%`,width:size,height:size}}>
                  <div className={`w-full h-full rounded-full ${colors[cl.severity]} transition-all duration-200 group-hover:scale-125`} />
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block z-20">
                    <div className="bg-white rounded-lg shadow-xl p-3 text-sm w-52 border border-slate-200">
                      <p className="font-semibold text-slate-900 truncate">{cl.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${cl.severity==="Critical"?"bg-red-100 text-red-700":cl.severity==="High"?"bg-orange-100 text-orange-700":"bg-slate-100 text-slate-600"}`}>{cl.severity}</span>
                        <span className="text-slate-400">{cl.ticketCount} tickets · {cl.escalationRate}% esc</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
            <div className="absolute bottom-2 right-3 flex gap-3 text-xs text-slate-500">
              {[["Critical","bg-red-500"],["High","bg-orange-400"],["Medium","bg-amber-400"],["Low","bg-emerald-400"]].map(([l,c])=>(
                <span key={l} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${c}`}/>{l}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <p className="text-sm font-semibold text-slate-900">All Patterns ({clusters.length})</p>
            <p className="text-sm text-slate-400 mt-0.5">Select a row to view detailed analysis and generate KB articles with AI</p>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
              <th className="py-2 px-4 font-semibold">ID</th><th className="py-2 px-4 font-semibold">Pattern</th><th className="py-2 px-4 font-semibold">Module</th>
              <th className="py-2 px-4 font-semibold">Tickets</th><th className="py-2 px-4 font-semibold">Severity</th><th className="py-2 px-4 font-semibold">Esc %</th><th className="py-2 px-4 font-semibold">Avg Res</th>
            </tr></thead>
            <tbody>
              {clusters.map(c=>(
                <tr key={c.id} className="border-b border-slate-100 hover:bg-rp-light/30 transition-colors cursor-pointer">
                  <td className="py-2.5 px-4 text-sm font-mono text-slate-400">{c.id}</td>
                  <td className="py-2.5 px-4"><Link href={`/root-cause/${c.id}`} className="text-rp-navy hover:text-rp-teal font-medium">{c.name.substring(0,60)}</Link></td>
                  <td className="py-2.5 px-4 text-sm text-slate-500">{c.category}</td>
                  <td className="py-2.5 px-4 font-semibold">{c.ticketCount}</td>
                  <td className="py-2.5 px-4"><span className={`px-2 py-0.5 rounded text-xs font-semibold ${c.severity==="Critical"?"bg-red-100 text-red-700":c.severity==="High"?"bg-orange-100 text-orange-700":c.severity==="Medium"?"bg-amber-100 text-amber-700":"bg-emerald-100 text-emerald-700"}`}>{c.severity}</span></td>
                  <td className="py-2.5 px-4 text-sm">{c.escalationRate}%</td>
                  <td className="py-2.5 px-4 text-sm text-slate-500">{c.avgResolutionTime>0?`${Math.round(c.avgResolutionTime/60)}h`:"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}
