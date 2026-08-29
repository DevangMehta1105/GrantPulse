"use client";

import React from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Sparkles, KanbanSquare, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PipelinePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pillar E • Deterministic FSM & SHA-256 Hash Chain</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Grant Lifecycle Pipeline Workspace
          </h1>
          <p className="text-sm text-slate-400">
            FSM transitions with document readiness guards and mathematical SHA-256 audit integrity logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/schemes"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <span>+ Add Scheme</span>
          </Link>
        </div>
      </div>

      {/* Kanban Board Component */}
      <KanbanBoard />
    </div>
  );
}
