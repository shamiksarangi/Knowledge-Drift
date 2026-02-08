"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Overview", href: "/dashboard", desc: "Platform summary" },
  { label: "Root Cause Mining", href: "/root-cause", desc: "Failure pattern detection" },
  { label: "Knowledge Quality", href: "/knowledge", desc: "KB health & decay" },
  { label: "Learning Engine", href: "/learning", desc: "Auto-generated articles" },
  { label: "Evaluation", href: "/evaluation", desc: "Retrieval accuracy" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-rp-navy flex flex-col z-30">
      <div className="p-5">
        <Link href="/dashboard">
          <span className="text-sm font-bold text-white tracking-tight">KnowledgeDrift</span>
          <p className="text-xs text-rp-teal mt-0.5 font-medium">for RealPage PropertySuite</p>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 mt-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={`block px-3 py-2.5 rounded-lg transition-colors ${
                active ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}>
              <span className="text-sm font-medium">{item.label}</span>
              {active && <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-rp-teal" />
          <span className="text-sm text-white/40">Mistral-7B active</span>
        </div>
      </div>
    </aside>
  );
}
