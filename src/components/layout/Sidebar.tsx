"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  GitFork, 
  Sparkles, 
  FileCheck2, 
  KanbanSquare, 
  BotMessageSquare, 
  ScrollText, 
  ShieldCheck,
  TrendingUp,
  Landmark
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: "Schemes Catalog",
    href: "/schemes",
    icon: Layers,
    badge: "6 Active"
  },
  {
    name: "AST Eligibility Engine",
    href: "/eligibility",
    icon: GitFork,
    badge: "Core #1"
  },
  {
    name: "Counterfactual Simulator",
    href: "/counterfactual",
    icon: Sparkles,
    badge: "What-If"
  },
  {
    name: "Document & OCR Vault",
    href: "/documents",
    icon: FileCheck2,
    badge: "Regex"
  },
  {
    name: "Kanban Pipeline",
    href: "/pipeline",
    icon: KanbanSquare,
    badge: "SHA-256"
  },
  {
    name: "Proposal Co-Pilot",
    href: "/copilot",
    icon: BotMessageSquare,
    badge: "AI"
  },
  {
    name: "Post-Sanction & GFR 12-A",
    href: "/compliance",
    icon: ScrollText,
    badge: "Ledger"
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 text-slate-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Landmark className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight">Grant<span className="text-emerald-400">Pulse</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OS</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">MSME & NGO Grant Engine</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Operating System
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200")} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                  isActive 
                    ? "bg-emerald-400/20 text-emerald-300"
                    : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Deterministic AST Engine
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">v3.0</span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cryptographic Proof</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-mono">SHA-256 Hash Chain Active</p>
        </div>
      </div>
    </aside>
  );
}
