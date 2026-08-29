"use client";

import React, { useState } from "react";
import { TraceNode } from "@/lib/types";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AstNodeVisualizerProps {
  trace: TraceNode;
  level?: number;
}

export function AstNodeVisualizer({ trace, level = 0 }: AstNodeVisualizerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isGroup = trace.type === "group" && trace.children && trace.children.length > 0;

  return (
    <div className={cn("transition-all text-xs", level > 0 && "ml-5 pl-4 border-l border-[var(--rule)] my-2")}>
      <div 
        className={cn(
          "flex items-start justify-between p-3.5 border transition-colors bg-[var(--paper)]",
          trace.passed 
            ? "border-[var(--rule)]" 
            : "border-[var(--rule)]"
        )}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Mark */}
          <span className={cn("mark", trace.passed ? "yes" : "no")}>
            {trace.passed ? "✓" : "✕"}
          </span>

          {/* Node Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] uppercase text-[var(--ink-soft)] px-1.5 py-0.2 bg-[var(--paper-deep)] border border-[var(--rule)]">
                {trace.operator}
              </span>
              <span className="font-medium text-sm text-[var(--ink)]">
                {trace.description}
              </span>
            </div>

            <p className="text-[13px] text-[var(--ink-soft)] leading-snug">
              {trace.reason}
            </p>

            {/* Condition Values */}
            {trace.type === "condition" && trace.targetValue !== undefined && (
              <div className="font-mono text-[11px] text-[var(--ink-soft)] pt-1">
                <span>Rule: <strong className="text-[var(--ink)]">{JSON.stringify(trace.targetValue)}</strong></span>
                <span> · </span>
                <span>Entity has: <strong className={trace.passed ? "text-[var(--verified)] font-medium" : "text-[var(--stamp)] font-medium"}>
                  {trace.actualValue !== undefined ? JSON.stringify(trace.actualValue) : "null"}
                </strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible toggle */}
        {isGroup && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors ml-2 cursor-pointer flex-shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Children */}
      {isGroup && isExpanded && trace.children && (
        <div className="mt-1.5 space-y-1.5">
          {trace.children.map((child) => (
            <AstNodeVisualizer key={child.id} trace={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
