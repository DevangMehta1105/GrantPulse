"use client";

import React from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function PipelinePage() {
  return (
    <div className="wrap py-12 space-y-8">
      <div className="border-b border-[var(--rule)] pb-6">
        <div className="font-mono text-[12px] tracking-wider uppercase text-[var(--stamp)] mb-2">
          Pipeline Ledger · FSM Lifecycle Engine
        </div>
        <h1 className="text-3xl md:text-4xl font-medium serif text-[var(--ink)] tracking-tight">
          Application Pipeline Tracker
        </h1>
        <p className="text-[15px] text-[var(--ink-soft)] mt-2 measure">
          Transition applications through state guards with cryptographically chained SHA-256 provenance logs.
        </p>
      </div>

      <KanbanBoard />
    </div>
  );
}
