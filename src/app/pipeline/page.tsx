"use client";

import React from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function PipelinePage() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-8 space-y-6">
      <div className="border-b border-[var(--rule)] pb-5">
        <div className="font-mono text-[11px] tracking-widest uppercase text-[var(--stamp)] mb-1 flex items-center gap-2 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[var(--stamp)] animate-pulse"></span>
          Pillar E · Deterministic FSM & Provenance Engine
        </div>
        <h1 className="text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
          Grant Application Pipeline Tracker
        </h1>
        <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-3xl">
          Advance applications through deterministic FSM state guards with cryptographically chained SHA-256 audit logs.
        </p>
      </div>

      <KanbanBoard />
    </div>
  );
}
