"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sparkles, 
  Compass, 
  Layers, 
  GitFork, 
  FileCheck2, 
  KanbanSquare, 
  BotMessageSquare, 
  ScrollText, 
  ShieldCheck,
  Landmark,
  ChevronRight,
  TrendingUp,
  Workflow
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  pillColor?: string;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Guided Workflow",
    items: [
      {
        name: "Lifecycle Wizard",
        href: "/",
        icon: Workflow,
        badge: "Start Here",
        pillColor: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
      },
      {
        name: "Grant Catalog",
        href: "/schemes",
        icon: Layers,
        badge: "6 Active"
      },
      {
        name: "AST Reasoner",
        href: "/eligibility",
        icon: GitFork,
        badge: "Explain"
      },
      {
        name: "What-If Simulator",
        href: "/counterfactual",
        icon: Sparkles,
        badge: "ROI Delta"
      }
    ]
  },
  {
    title: "Execution & Vault",
    items: [
      {
        name: "FSM Pipeline",
        href: "/pipeline",
        icon: KanbanSquare,
        badge: "SHA-256"
      },
      {
        name: "Document & OCR",
        href: "/documents",
        icon: FileCheck2,
        badge: "Regex"
      },
      {
        name: "AI Proposal Co-Pilot",
        href: "/copilot",
        icon: BotMessageSquare,
        badge: "AI"
      }
    ]
  },
  {
    title: "Sanction & Compliance",
    items: [
      {
        name: "GFR 12-A Ledger",
        href: "/compliance",
        icon: ScrollText,
        badge: "Ledger"
      }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0c0e14] border-r border-[#1a1f2c] flex flex-col h-screen sticky top-0 text-slate-300 select-none z-40">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#1a1f2c] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Landmark className="w-4.5 h-4.5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">Grant<span className="text-emerald-400">Pulse</span></span>
              <span className="text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">OS</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">MSME & NGO Operating System</p>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {group.title}
            </div>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group relative",
                    isActive
                      ? "bg-[#141923] text-emerald-400 border border-[#232a3b] shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#12151e]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200")} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span className={cn(
                      "text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded",
                      item.pillColor || (isActive ? "bg-emerald-400/20 text-emerald-300" : "bg-[#181d28] text-slate-400 group-hover:text-slate-300")
                    )}>
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-emerald-400" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#1a1f2c] bg-[#090b10]/60">
        <div className="p-2.5 rounded-xl bg-[#11141c] border border-[#1e2433] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="font-semibold text-slate-200 text-[11px]">Audit Proof</div>
              <div className="text-[9px] text-slate-400 font-mono">SHA-256 Verified</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
