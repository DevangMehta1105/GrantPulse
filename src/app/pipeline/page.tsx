"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useApp } from "@/context/AppContext";

export default function PipelinePage() {
  const { applications } = useApp();

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-8 space-y-6">
      <div className="border-b border-[var(--rule)] pb-5">
        <div className="font-mono text-[11px] tracking-widest uppercase text-[var(--stamp)] mb-1 flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[var(--stamp)] animate-pulse"></span>
          Pillar E · Deterministic FSM &amp; Provenance Engine
        </div>
        <h1 className="text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
          Grant Application Pipeline Tracker
        </h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-3xl">
          Advance applications through deterministic FSM state guards with cryptographically chained SHA-256 audit logs.
        </p>
      </div>

      <KanbanBoard />

      {/* Lifecycle Flow Action Banner */}
      <div className="mt-8 p-5 bg-[#E6DFD0] border border-[#22271F]/20 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
        {applications.length > 0 ? (
          <>
            <div className="space-y-1 text-center md:text-left">
              <div className="text-[10px] tracking-widest uppercase text-[var(--stamp)] font-bold flex items-center justify-center md:justify-start gap-1.5">
                <span>Active Application in Pipeline</span>
                <span>&rarr;</span>
              </div>
              <div className="font-serif font-bold text-base text-[var(--ink)]">
                Ready to draft your proposal dossier or auto-fill questions?
              </div>
              <p className="text-xs text-[var(--ink-soft)]">
                Use AI Proposal Co-Pilot to synthesize Detailed Project Reports (DPR) and populate official portal questions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/copilot"
                className="px-5 py-2.5 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] text-xs font-mono font-bold rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <span>Open Proposal Co-Pilot &amp; Autofill</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1 text-center md:text-left">
              <div className="text-[10px] tracking-widest uppercase text-[var(--stamp)] font-bold flex items-center justify-center md:justify-start gap-1.5">
                <span>Pipeline Idle</span>
                <span>&rarr;</span>
              </div>
              <div className="font-serif font-bold text-base text-[var(--ink)]">
                No active grants enrolled in the pipeline tracker yet
              </div>
              <p className="text-xs text-[var(--ink-soft)]">
                Explore the grant discovery catalog and click &quot;View Eligibility &amp; Apply&quot; to enroll an application into this FSM board.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/schemes"
                className="px-5 py-2.5 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] text-xs font-mono font-bold rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <span>Browse Grant Discovery Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
