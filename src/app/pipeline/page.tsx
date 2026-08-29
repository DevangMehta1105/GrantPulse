"use client";

import React from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export default function PipelinePage() {
  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-lg font-bold text-[#ededef]">Application Pipeline Workspace</h1>
        <p className="text-xs text-[#8b8d98]">
          Deterministic FSM transition guards with SHA-256 cryptographic provenance logging.
        </p>
      </div>

      <KanbanBoard />
    </div>
  );
}
