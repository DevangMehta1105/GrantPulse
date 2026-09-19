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
  Landmark,
  FileSpreadsheet,
  DownloadCloud
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Grant Catalog", href: "/schemes", icon: Layers },
      { name: "Portal Harvester", href: "/ingestion", icon: DownloadCloud },
      { name: "AST Reasoner", href: "/eligibility", icon: GitFork },
      { name: "What-If Simulator", href: "/counterfactual", icon: Sparkles }
    ]
  },
  {
    title: "WORKFLOW",
    items: [
      { name: "Pipeline Kanban", href: "/pipeline", icon: KanbanSquare },
      { name: "Document Vault", href: "/documents", icon: FileCheck2 },
      { name: "Proposal Co-Pilot", href: "/copilot", icon: BotMessageSquare }
    ]
  },
  {
    title: "COMPLIANCE",
    items: [
      { name: "GFR 12-A Ledger", href: "/compliance", icon: ScrollText }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0d0e11] border-r border-[#1e2029] flex flex-col h-screen sticky top-0 text-[#8b8d98] select-none text-xs">
      {/* Brand Header */}
      <div className="h-14 px-4 border-b border-[#1e2029] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-white text-[#0d0e11] flex items-center justify-center font-black text-xs">
            GP
          </div>
          <span className="font-semibold text-sm text-[#ededef] tracking-tight">
            GrantPulse
          </span>
        </Link>
        <span className="text-[10px] font-mono text-[#5e6170] px-1.5 py-0.5 rounded bg-[#14151a] border border-[#1e2029]">
          v3.0
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-2.5 pb-1 text-[10px] font-mono font-semibold tracking-wider text-[#5e6170]">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-md font-medium transition-colors",
                    isActive
                      ? "bg-[#1a1c24] text-[#ededef] shadow-sm"
                      : "text-[#8b8d98] hover:text-[#ededef] hover:bg-[#14151a]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4", isActive ? "text-[#ededef]" : "text-[#5e6170]")} />
                    <span>{item.name}</span>
                  </div>

                  {item.count && (
                    <span className="text-[10px] font-mono text-[#5e6170] bg-[#14151a] px-1.5 py-0.2 rounded">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Audit Status */}
      <div className="p-3 border-t border-[#1e2029]">
        <div className="px-2.5 py-2 rounded-md bg-[#14151a] border border-[#1e2029] flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-[#8b8d98]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2eb88a]" />
            <span className="font-mono">SHA-256 Provenance</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-[#2eb88a]" />
        </div>
      </div>
    </aside>
  );
}
