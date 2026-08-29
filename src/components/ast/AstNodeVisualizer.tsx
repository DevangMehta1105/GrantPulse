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
    <div className={cn("transition-all", level > 0 && "ml-5 pl-4 border-l border-[#222a3d] my-2")}>
      <div 
        className={cn(
          "flex items-start justify-between p-3.5 rounded-xl border transition-all shadow-sm",
          trace.passed 
            ? "bg-[#0d1718] border-emerald-500/30 hover:border-emerald-500/50" 
            : "bg-[#180e12] border-rose-500/30 hover:border-rose-500/50"
        )}
      >
        <div className="flex items-start gap-3 flex-1">
          {/* Status Icon */}
          <div className="mt-0.5 flex-shrink-0">
            {trace.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400" />
            )}
          </div>

          {/* Node Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono tracking-wider",
                trace.passed ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
              )}>
                {trace.operator}
              </span>

              <span className="font-semibold text-xs text-white">
                {trace.description}
              </span>
            </div>

            {/* Reason description */}
            <p className={cn(
              "text-[11px] leading-relaxed",
              trace.passed ? "text-slate-300" : "text-rose-300/90 font-medium"
            )}>
              {trace.reason}
            </p>

            {/* Target vs Actual if leaf condition */}
            {trace.type === "condition" && trace.targetValue !== undefined && (
              <div className="mt-2 flex items-center gap-3 text-[11px] font-mono bg-[#090b10] px-2.5 py-1 rounded-lg border border-[#1e2433] w-fit">
                <span className="text-slate-400">
                  Required: <strong className="text-slate-200">{JSON.stringify(trace.targetValue)}</strong>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                  Actual: <strong className={trace.passed ? "text-emerald-400" : "text-rose-400"}>
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
            className="p-1 rounded-lg bg-[#151a26] hover:bg-[#1e2536] text-slate-300 transition-colors ml-2 cursor-pointer flex-shrink-0"
            title={isExpanded ? "Collapse group" : "Expand group"}
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Child Nodes */}
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
