"use client";

import React, { useState } from "react";
import { TraceNode } from "@/lib/types";
import { CheckCircle2, XCircle, ChevronRight, ChevronDown, Split, Zap, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AstNodeVisualizerProps {
  trace: TraceNode;
  level?: number;
}

export function AstNodeVisualizer({ trace, level = 0 }: AstNodeVisualizerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isGroup = trace.type === "group" && trace.children && trace.children.length > 0;

  return (
    <div className={cn("transition-all", level > 0 && "ml-6 pl-4 border-l-2 border-slate-700/60 my-2")}>
      <div 
        className={cn(
          "flex items-start justify-between p-3.5 rounded-xl border transition-all shadow-sm",
          trace.passed 
            ? "bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50" 
            : "bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50"
        )}
      >
        <div className="flex items-start gap-3 flex-1">
          {/* Status Icon */}
          <div className="mt-0.5">
            {trace.passed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
          </div>

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn(
                "px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono tracking-wider",
                trace.passed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              )}>
                {trace.operator}
              </span>

              <span className="font-semibold text-sm text-slate-200">
                {trace.description}
              </span>
            </div>

            {/* Reason description */}
            <p className={cn(
              "text-xs leading-relaxed",
              trace.passed ? "text-slate-300" : "text-rose-300/90 font-medium"
            )}>
              {trace.reason}
            </p>

            {/* Target vs Actual if leaf condition */}
            {trace.type === "condition" && trace.targetValue !== undefined && (
              <div className="mt-2 flex items-center gap-4 text-xs font-mono bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 w-fit">
                <span className="text-slate-400">
                  Required: <strong className="text-slate-200">{JSON.stringify(trace.targetValue)}</strong>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                  Actual Entity: <strong className={trace.passed ? "text-emerald-400" : "text-rose-400"}>
                    {trace.actualValue !== undefined ? JSON.stringify(trace.actualValue) : "null / missing"}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Expand / Collapse Button for Groups */}
        {isGroup && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors ml-2"
            title={isExpanded ? "Collapse group" : "Expand group"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Child Nodes */}
      {isGroup && isExpanded && trace.children && (
        <div className="mt-2 space-y-2">
          {trace.children.map((child) => (
            <AstNodeVisualizer key={child.id} trace={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
