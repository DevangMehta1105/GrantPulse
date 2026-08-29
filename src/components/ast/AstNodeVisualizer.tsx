"use client";

import React, { useState } from "react";
import { TraceNode } from "@/lib/types";
import { Check, X, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AstNodeVisualizerProps {
  trace: TraceNode;
  level?: number;
}

export function AstNodeVisualizer({ trace, level = 0 }: AstNodeVisualizerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isGroup = trace.type === "group" && trace.children && trace.children.length > 0;

  return (
    <div className={cn("transition-all text-xs", level > 0 && "ml-4 pl-3 border-l border-[#232530] my-1.5")}>
      <div 
        className={cn(
          "flex items-start justify-between p-3 rounded-lg border transition-colors",
          trace.passed 
            ? "bg-[#111614] border-[#1e2e26]" 
            : "bg-[#161214] border-[#331e24]"
        )}
      >
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {/* Status Indicator */}
          <div className={cn(
            "w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0",
            trace.passed ? "bg-[#1b382b] text-[#2eb88a]" : "bg-[#3d1a21] text-[#ef4444]"
          )}>
            {trace.passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
          </div>

          {/* Node Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn(
                "px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold uppercase",
                trace.passed ? "bg-[#182620] text-[#2eb88a]" : "bg-[#29171b] text-[#ef4444]"
              )}>
                {trace.operator}
              </span>
              <span className="font-medium text-[#ededef]">
                {trace.description}
              </span>
            </div>

            <p className={cn(
              "text-[11px] leading-tight",
              trace.passed ? "text-[#8b8d98]" : "text-[#f87171]"
            )}>
              {trace.reason}
            </p>

            {/* Condition Values */}
            {trace.type === "condition" && trace.targetValue !== undefined && (
              <div className="flex items-center gap-2 text-[10px] font-mono text-[#5e6170] pt-0.5">
                <span>Rule: <strong className="text-[#8b8d98]">{JSON.stringify(trace.targetValue)}</strong></span>
                <span>•</span>
                <span>Actual: <strong className={trace.passed ? "text-[#2eb88a]" : "text-[#ef4444]"}>
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
            className="p-1 rounded text-[#5e6170] hover:text-[#ededef] hover:bg-[#1e2029] transition-colors ml-2 cursor-pointer flex-shrink-0"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Children */}
      {isGroup && isExpanded && trace.children && (
        <div className="mt-1 space-y-1">
          {trace.children.map((child) => (
            <AstNodeVisualizer key={child.id} trace={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
