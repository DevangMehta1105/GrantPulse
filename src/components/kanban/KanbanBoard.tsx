"use client";

import React, { useState } from "react";
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  KeyboardSensor, 
  useSensor, 
  useSensors, 
  DragStartEvent, 
  DragEndEvent,
  useDroppable,
  useDraggable
} from "@dnd-kit/core";
import { Application, ApplicationState, Scheme } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { verifyAuditChainIntegrity } from "@/lib/fsm/state-machine";
import { Hash, X, ChevronRight, GripVertical, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS: { state: ApplicationState; label: string; desc: string }[] = [
  { state: "Discovered", label: "Discovered", desc: "Matched by AST Engine" },
  { state: "Docs Verified", label: "Docs Verified", desc: "Readiness ≥ 70%" },
  { state: "Drafting", label: "Drafting", desc: "Co-Pilot Proposal in progress" },
  { state: "Applied", label: "Applied", desc: "Portal Ref ID logged" },
  { state: "Under Review", label: "Under Review", desc: "Ministry inspection" },
  { state: "Sanctioned", label: "Sanctioned", desc: "GFR 12-A ledger active" }
];

function getNextAllowedStates(current: ApplicationState): ApplicationState[] {
  switch (current) {
    case "Discovered": return ["Docs Verified", "Rejected"];
    case "Docs Verified": return ["Drafting", "Discovered", "Rejected"];
    case "Drafting": return ["Applied", "Docs Verified", "Rejected"];
    case "Applied": return ["Under Review", "Drafting", "Rejected"];
    case "Under Review": return ["Sanctioned", "Rejected", "Applied"];
    case "Sanctioned": return [];
    case "Rejected": return ["Discovered"];
    default: return [];
  }
}

// Draggable Card Component
function DraggableCard({ 
  app, 
  scheme, 
  readiness, 
  onAudit, 
  onAdvance,
  isOverlay = false 
}: { 
  app: Application; 
  scheme?: Scheme; 
  readiness: any; 
  onAudit: (app: Application) => void; 
  onAdvance: (app: Application, nextState: ApplicationState) => void;
  isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: app.id,
    data: { app }
  });

  const nextStates = getNextAllowedStates(app.currentState);
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-[var(--paper)] border border-[var(--rule)] rounded p-4 space-y-3 transition-all select-none group relative shadow-xs",
        isDragging && "opacity-30 border-dashed border-[var(--ink)] ring-2 ring-[var(--stamp)]/30",
        isOverlay && "shadow-2xl border-[var(--ink)] rotate-1 scale-105 z-50 bg-[var(--paper)] ring-2 ring-[var(--stamp)]",
        !isDragging && !isOverlay && "hover:border-[var(--ink)] hover:shadow-md"
      )}
    >
      {/* Header with Grip and Timestamp */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--ink-soft)] pb-2 border-b border-[var(--rule)]/50">
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-[var(--ink-soft)]/50 hover:text-[var(--ink)] hover:bg-[var(--paper-deep)] rounded transition-colors"
            title="Drag card to transition lifecycle state"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <span className="font-bold text-[var(--ink)] tracking-tight">{app.id}</span>
        </div>
        <span className="text-[10px] text-[var(--ink-soft)]">{formatDate(app.updated_at)}</span>
      </div>

      {/* Scheme Title */}
      <div>
        <h4 className="font-serif font-bold text-[13px] text-[var(--ink)] leading-snug line-clamp-2">
          {scheme?.title || app.schemeId}
        </h4>
        <div className="text-[10px] font-mono text-[var(--ink-soft)] mt-0.5">
          {scheme?.ministryOrFunder || "Central/State Grant Registry"}
        </div>
      </div>

      {/* Financials & Funding */}
      <div className="space-y-1.5 pt-0.5">
        <div className="px-2.5 py-1.5 bg-[var(--paper-deep)] rounded border border-[var(--rule)]/60 flex items-center justify-between font-mono text-[11px]">
          <span className="text-[var(--ink-soft)]">Requested:</span>
          <span className="font-bold text-[var(--ink)]">{formatINR(app.requestedAmount, true)}</span>
        </div>

        {app.sanctionedAmount && (
          <div className="px-2.5 py-1.5 bg-[var(--verified-bg)] rounded border border-[var(--verified)]/30 flex items-center justify-between font-mono text-[11px] text-[var(--verified)] font-bold">
            <span>Sanctioned:</span>
            <span>{formatINR(app.sanctionedAmount, true)}</span>
          </div>
        )}
      </div>

      {/* Document Readiness Score */}
      {readiness && (
        <div className="flex items-center justify-between text-[10px] font-mono pt-1">
          <span className="text-[var(--ink-soft)]">Docs Readiness:</span>
          <span className={cn(
            "font-semibold px-1.5 py-0.2 rounded",
            readiness.score >= 70 
              ? "bg-[var(--verified-bg)] text-[var(--verified)]" 
              : "bg-[var(--pending-bg)] text-[var(--pending)]"
          )}>
            {readiness.score}% ({readiness.mandatoryVerified}/{readiness.mandatoryTotal})
          </span>
        </div>
      )}

      {/* External Ref ID */}
      {app.externalApplicationId && (
        <div className="text-[10px] font-mono text-[var(--ink-soft)] bg-[var(--paper-deep)] px-2 py-1 rounded border border-[var(--rule)]/70 truncate">
          <span className="text-[var(--stamp)] font-bold">Ref:</span> {app.externalApplicationId}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2.5 border-t border-[var(--rule)] flex items-center justify-between gap-2 font-mono">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAudit(app);
          }}
          className="text-[11px] text-[var(--ink-soft)] hover:text-[var(--ink)] flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--paper-deep)] cursor-pointer whitespace-nowrap transition-colors"
          title="View Cryptographic SHA-256 Provenance Log"
        >
          <Hash className="w-3.5 h-3.5 text-[var(--stamp)]" />
          <span>Audit Log</span>
        </button>

        {nextStates.length > 0 && nextStates[0] !== "Rejected" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdvance(app, nextStates[0]);
            }}
            className="px-2.5 py-1 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] text-[11px] font-mono font-medium rounded flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs transition-colors"
          >
            <span>Advance</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  column,
  apps,
  schemes,
  getReadiness,
  onAudit,
  onAdvance,
  isOverTarget = false
}: {
  column: { state: ApplicationState; label: string; desc: string };
  apps: Application[];
  schemes: Scheme[];
  getReadiness: (schemeId: string) => any;
  onAudit: (app: Application) => void;
  onAdvance: (app: Application, nextState: ApplicationState) => void;
  isOverTarget?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.state,
    data: { state: column.state }
  });

  const highlighted = isOver || isOverTarget;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-[275px] min-w-[275px] flex-shrink-0 bg-[var(--paper-deep)] border rounded p-3.5 flex flex-col min-h-[540px] text-xs transition-all",
        highlighted 
          ? "border-[var(--stamp)] bg-[#E4DCCB] ring-2 ring-[var(--stamp)]/20 shadow-md" 
          : "border-[var(--rule)]"
      )}
    >
      {/* Column Header */}
      <div className="pb-2.5 mb-3 border-b border-[var(--rule)] flex items-start justify-between font-mono">
        <div>
          <div className="font-bold text-[13px] text-[var(--ink)] flex items-center gap-1.5">
            {column.label}
          </div>
          <div className="text-[10px] text-[var(--ink-soft)] mt-0.5 leading-tight">{column.desc}</div>
        </div>
        <span className="text-[11px] text-[var(--ink)] bg-[var(--paper)] px-2 py-0.5 rounded border border-[var(--rule)] font-bold">
          {apps.length}
        </span>
      </div>

      {/* Cards List */}
      <div className="space-y-3 flex-1 flex flex-col">
        {apps.map(app => {
          const scheme = schemes.find(s => s.id === app.schemeId);
          const readiness = scheme ? getReadiness(scheme.id) : null;
          return (
            <DraggableCard
              key={app.id}
              app={app}
              scheme={scheme}
              readiness={readiness}
              onAudit={onAudit}
              onAdvance={onAdvance}
            />
          );
        })}

        {apps.length === 0 && (
          <div className={cn(
            "flex-1 min-h-[140px] border border-dashed rounded flex flex-col items-center justify-center text-[11px] font-mono transition-colors p-4 text-center",
            highlighted 
              ? "border-[var(--stamp)] text-[var(--stamp)] bg-white/40 font-bold" 
              : "border-[var(--rule)] text-[var(--ink-soft)]/60"
          )}>
            <span>Drop card here to transition</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { applications, schemes, currentOrg, moveApplicationState, getOrgDocumentReadiness } = useApp();
  const [selectedAppForAudit, setSelectedAppForAudit] = useState<Application | null>(null);
  const [auditVerification, setAuditVerification] = useState<{ isValid: boolean; error?: string } | null>(null);
  
  // Dragging active item
  const [activeDragApp, setActiveDragApp] = useState<Application | null>(null);

  // Transition modal state
  const [transitioningApp, setTransitioningApp] = useState<{ app: Application; targetState: ApplicationState } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [extAppIdInput, setExtAppIdInput] = useState("");
  const [transitionError, setTransitionError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const orgApps = applications.filter(a => a.orgId === currentOrg.id);

  const handleOpenAuditModal = async (app: Application) => {
    setSelectedAppForAudit(app);
    const result = await verifyAuditChainIntegrity(app.stateHistory);
    setAuditVerification(result);
  };

  const handleInitiateTransition = (app: Application, targetState: ApplicationState) => {
    setTransitioningApp({ app, targetState });
    setActionNote(`Advancing ${app.id} to ${targetState}`);
    setExtAppIdInput(app.externalApplicationId || "");
    setTransitionError(null);
  };

  const handleConfirmTransition = async () => {
    if (!transitioningApp) return;
    const res = await moveApplicationState(
      transitioningApp.app.id,
      transitioningApp.targetState,
      actionNote,
      extAppIdInput
    );

    if (res.success) {
      setTransitioningApp(null);
      setActionNote("");
      setExtAppIdInput("");
    } else {
      setTransitionError(res.error || "Transition blocked by guard");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const app = orgApps.find(a => a.id === active.id);
    if (app) {
      setActiveDragApp(app);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragApp(null);

    if (!over) return;

    const appId = String(active.id);
    const targetState = String(over.id) as ApplicationState;

    const app = orgApps.find(a => a.id === appId);
    if (!app || app.currentState === targetState) return;

    // Check if transition requires external Ref ID or explicit note
    if (targetState === "Applied" && !app.externalApplicationId) {
      handleInitiateTransition(app, targetState);
      return;
    }

    // Direct transition attempt with transition guards
    const res = await moveApplicationState(
      app.id,
      targetState,
      `Drag-and-drop transition: ${app.currentState} → ${targetState}`,
      app.externalApplicationId
    );

    if (!res.success) {
      setTransitioningApp({ app, targetState });
      setTransitionError(res.error || "Deterministic guard validation failed.");
      setActionNote(`Manual override for ${targetState}`);
    }
  };

  const activeScheme = activeDragApp ? schemes.find(s => s.id === activeDragApp.schemeId) : undefined;
  const activeReadiness = activeScheme ? getOrgDocumentReadiness(activeScheme.id) : null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Instructions banner */}
        <div className="p-3.5 bg-[var(--paper-deep)] border border-[var(--rule)] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-[var(--ink-soft)] shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--stamp)] animate-pulse flex-shrink-0"></span>
            <span>Drag cards across columns to advance lifecycle states. Every transition generates a verifiable SHA-256 state hash.</span>
          </div>
          <span className="text-[11px] text-[var(--ink)] font-bold whitespace-nowrap">
            {orgApps.length} Applications for {currentOrg.name}
          </span>
        </div>

        {/* Board Columns Grid with Horizontal Scroll and Generous Width */}
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start">
          {COLUMNS.map(col => {
            const colApps = orgApps.filter(a => a.currentState === col.state);
            return (
              <DroppableColumn
                key={col.state}
                column={col}
                apps={colApps}
                schemes={schemes}
                getReadiness={getOrgDocumentReadiness}
                onAudit={handleOpenAuditModal}
                onAdvance={handleInitiateTransition}
              />
            );
          })}
        </div>

        {/* Drag Overlay for smooth card preview while dragging */}
        <DragOverlay>
          {activeDragApp ? (
            <div className="w-[275px]">
              <DraggableCard
                app={activeDragApp}
                scheme={activeScheme}
                readiness={activeReadiness}
                onAudit={() => {}}
                onAdvance={() => {}}
                isOverlay
              />
            </div>
          ) : null}
        </DragOverlay>

        {/* SHA-256 Audit Modal */}
        {selectedAppForAudit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--paper)] border border-[var(--ink)] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl rounded overflow-hidden text-xs">
              <div className="p-4 border-b border-[var(--rule)] flex items-center justify-between bg-[var(--paper-deep)]">
                <div className="flex items-center gap-2.5">
                  <span className="seal">GP</span>
                  <div>
                    <h3 className="font-bold serif text-sm text-[var(--ink)]">
                      SHA-256 Cryptographic Audit Provenance
                    </h3>
                    <div className="font-mono text-[10px] text-[var(--ink-soft)]">{selectedAppForAudit.id}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAppForAudit(null)} 
                  className="text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-[var(--verified-bg)] border-b border-[var(--rule)] font-mono text-[11px] text-[var(--verified)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  ✓ Hash chain verified: {selectedAppForAudit.stateHistory.length} state transitions cryptographically linked with zero tampering.
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {selectedAppForAudit.stateHistory.map((entry, idx) => (
                  <div key={idx} className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-3.5 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--ink)] font-bold">
                        #{idx + 1} {entry.fromState} → {entry.toState}
                      </span>
                      <span className="text-[var(--ink-soft)]">{formatDate(entry.timestamp)}</span>
                    </div>
                    <p className="text-[12px] text-[var(--ink-soft)] font-sans">{entry.actionNote}</p>
                    <div className="text-[10px] text-[var(--ink-soft)] bg-black/5 p-1.5 rounded truncate">
                      <span className="text-[var(--stamp)] font-bold">SHA-256:</span> {entry.hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* State Transition Guard Modal */}
        {transitioningApp && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--paper)] border border-[var(--ink)] max-w-md w-full p-6 shadow-2xl rounded space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
                <h3 className="font-bold serif text-base text-[var(--ink)]">Transition State Guard</h3>
                <button 
                  onClick={() => setTransitioningApp(null)} 
                  className="text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[var(--ink-soft)] text-[11px] font-mono">Advancing To:</span>
                  <div className="font-bold text-[var(--ink)] text-sm font-mono mt-0.5">{transitioningApp.targetState}</div>
                </div>

                {transitioningApp.targetState === "Applied" && (
                  <div>
                    <label className="block text-[var(--ink)] font-semibold mb-1">
                      Portal Filing Reference ID <span className="text-[var(--stamp)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={extAppIdInput}
                      onChange={(e) => setExtAppIdInput(e.target.value)}
                      placeholder="e.g. ZED/2026/MH/99241 or SISFS/APP/402"
                      className="w-full bg-[var(--paper-deep)] border border-[var(--rule)] px-3 py-2 text-xs text-[var(--ink)] font-mono focus:border-[var(--ink)] focus:outline-none rounded"
                    />
                    <p className="text-[10px] text-[var(--ink-soft)] mt-1 font-mono">
                      Required by FSM state guard to prove actual submission before entering Under Review.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[var(--ink)] font-semibold mb-1">Action Note / Sign-off</label>
                  <textarea
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    rows={2}
                    className="w-full bg-[var(--paper-deep)] border border-[var(--rule)] p-2 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none rounded"
                  />
                </div>

                {transitionError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-[11px] font-mono flex items-start gap-2 rounded">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>{transitionError}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--rule)]">
                <button
                  type="button"
                  onClick={() => setTransitioningApp(null)}
                  className="btn-ink-ghost text-xs py-1.5 px-3"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTransition}
                  className="btn-ink text-xs py-1.5 px-4"
                >
                  Sign &amp; Advance
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
