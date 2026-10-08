"use client";

import React, { useState } from "react";
import { TraceNode } from "@/lib/types";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AstNodeVisualizerProps {
  trace: TraceNode;
  level?: number;
}

function formatRuleValue(val: any): string {
  if (typeof val === "number") {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)} Lakh`;
    return `₹${val.toLocaleString("en-IN")}`;
  }
  if (typeof val === "boolean") return val ? "Verified / Registered" : "Pending / Missing";
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

function formatOperatorLabel(op: string): string {
  switch (op) {
    case "EQUALS": return "Requirement";
    case "LTE": return "Upper Ceiling";
    case "GTE": return "Minimum Threshold";
    case "IN": return "Eligible Entities";
    case "CONTAINS": return "Includes";
    case "AND": return "Mandatory Condition";
    case "OR": return "Alternate Pathway";
    default: return op;
  }
}

export function AstNodeVisualizer({ trace, level = 0 }: AstNodeVisualizerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const isGroup = trace.type === "group" && trace.children && trace.children.length > 0;

  return (
    <div className={cn("transition-all text-xs", level > 0 && "ml-5 pl-4 border-l border-[var(--rule)] my-2")}>
      <div 
        className={cn(
          "flex items-start justify-between p-3.5 border transition-colors bg-[var(--paper)] rounded-xs",
          trace.passed 
            ? "border-[var(--rule)]" 
            : "border-[var(--stamp)]/30 bg-[#FAF4ED]"
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
              <span className="font-sans text-[11px] font-semibold text-[var(--ink-soft)] px-2 py-0.5 bg-[var(--paper-deep)] border border-[var(--rule)] rounded-xs">
                {formatOperatorLabel(trace.operator)}
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
              <div className="font-sans text-[12px] text-[var(--ink-soft)] pt-1 flex items-center gap-2 flex-wrap">
                <span>Rule: <strong className="text-[var(--ink)] font-semibold">{formatRuleValue(trace.targetValue)}</strong></span>
                <span>·</span>
                <span>Your Record: <strong className={trace.passed ? "text-[var(--verified)] font-semibold" : "text-[var(--stamp)] font-semibold"}>
                  {trace.actualValue !== undefined ? formatRuleValue(trace.actualValue) : "Not Provided"}
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
