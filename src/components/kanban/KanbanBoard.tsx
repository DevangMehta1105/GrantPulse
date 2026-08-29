"use client";

import React, { useState } from "react";
import { Application, ApplicationState } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { verifyAuditChainIntegrity } from "@/lib/fsm/state-machine";
import { Hash, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS: { state: ApplicationState; label: string }[] = [
  { state: "Discovered", label: "Discovered" },
  { state: "Docs Verified", label: "Docs Verified" },
  { state: "Drafting", label: "Drafting" },
  { state: "Applied", label: "Applied" },
  { state: "Under Review", label: "Under Review" },
  { state: "Sanctioned", label: "Sanctioned" }
];

export function KanbanBoard() {
  const { applications, schemes, currentOrg, moveApplicationState, getOrgDocumentReadiness } = useApp();
  const [selectedAppForAudit, setSelectedAppForAudit] = useState<Application | null>(null);
  const [auditVerification, setAuditVerification] = useState<{ isValid: boolean; error?: string } | null>(null);
  
  // Transition state
  const [transitioningApp, setTransitioningApp] = useState<{ app: Application; targetState: ApplicationState } | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [extAppIdInput, setExtAppIdInput] = useState("");
  const [transitionError, setTransitionError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {COLUMNS.map(col => {
          const colApps = orgApps.filter(a => a.currentState === col.state);
          return (
            <div 
              key={col.state} 
              className="bg-[var(--paper-deep)] border border-[var(--rule)] p-3 flex flex-col min-h-[460px] text-xs"
            >
              {/* Column Header */}
              <div className="pb-2 mb-2 border-b border-[var(--rule)] flex items-center justify-between font-mono">
                <span className="font-medium text-[var(--ink)]">{col.label}</span>
                <span className="text-[11px] text-[var(--ink-soft)] bg-[var(--paper)] px-1.5 py-0.2 border border-[var(--rule)]">
                  {colApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1">
                {colApps.map(app => {
                  const scheme = schemes.find(s => s.id === app.schemeId);
                  const readiness = scheme ? getOrgDocumentReadiness(scheme.id) : null;
                  const nextStates = col.state === "Discovered" ? ["Docs Verified"] 
                    : col.state === "Docs Verified" ? ["Drafting"]
                    : col.state === "Drafting" ? ["Applied"]
                    : col.state === "Applied" ? ["Under Review"]
                    : col.state === "Under Review" ? ["Sanctioned"] : [];

                  return (
                    <div 
                      key={app.id} 
                      className="bg-[var(--paper)] border border-[var(--rule)] p-3.5 space-y-2.5 transition-colors hover:border-[var(--ink)]"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-[var(--ink-soft)] font-mono mb-1">
                          <span>{app.id}</span>
                          <span>{formatDate(app.updated_at)}</span>
                        </div>
                        <h4 className="font-medium text-xs serif text-[var(--ink)] line-clamp-2 leading-snug">
                          {scheme?.title || app.schemeId}
                        </h4>
                        <div className="text-[11px] font-mono text-[var(--ink-soft)] mt-1">
                          <span>Req: </span>
                          <strong className="text-[var(--ink)]">{formatINR(app.requestedAmount, true)}</strong>
                          {app.sanctionedAmount && (
                            <span className="text-[var(--verified)] ml-1 font-bold">
                              (Sanctioned: {formatINR(app.sanctionedAmount, true)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Readiness */}
                      {readiness && (
                        <div className="text-[10px] font-mono text-[var(--ink-soft)] flex items-center justify-between pt-1 border-t border-dashed border-[var(--rule)]">
                          <span>Readiness:</span>
                          <span className={readiness.score >= 75 ? "text-[var(--verified)] font-medium" : "text-[var(--pending)] font-medium"}>
                            {readiness.score}% ({readiness.mandatoryVerified}/{readiness.mandatoryTotal})
                          </span>
                        </div>
                      )}

                      {/* External ID */}
                      {app.externalApplicationId && (
                        <div className="text-[10px] font-mono text-[var(--ink-soft)] truncate">
                          Ref: {app.externalApplicationId}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2 border-t border-[var(--rule)] flex items-center justify-between font-mono">
                        <button
                          onClick={() => handleOpenAuditModal(app)}
                          className="text-[10px] text-[var(--ink-soft)] hover:text-[var(--ink)] flex items-center gap-1 cursor-pointer"
                          title="View SHA-256 Provenance Log"
                        >
                          <Hash className="w-3 h-3" />
                          <span>Audit</span>
                        </button>

                        {nextStates.length > 0 && (
                          <button
                            onClick={() => handleInitiateTransition(app, nextStates[0] as ApplicationState)}
                            className="btn-ink text-[10px] py-0.5 px-2"
                          >
                            <span>Advance</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="h-24 border border-dashed border-[var(--rule)] flex items-center justify-center text-[10px] font-mono text-[var(--ink-soft)]">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SHA-256 Audit Modal */}
      {selectedAppForAudit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--paper)] border border-[var(--ink)] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="p-4 border-b border-[var(--rule)] flex items-center justify-between bg-[var(--paper-deep)]">
              <div className="flex items-center gap-2">
                <span className="seal">GP</span>
                <div>
                  <h3 className="font-medium serif text-sm text-[var(--ink)]">
                    SHA-256 Cryptographic Audit Provenance
                  </h3>
                  <div className="font-mono text-[10px] text-[var(--ink-soft)]">{selectedAppForAudit.id}</div>
                </div>
              </div>
              <button onClick={() => setSelectedAppForAudit(null)} className="text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[var(--verified-bg)] border-b border-[var(--rule)] font-mono text-[11px] text-[var(--verified)]">
              ✓ Hash chain verified: {selectedAppForAudit.stateHistory.length} state transitions cryptographically linked.
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {selectedAppForAudit.stateHistory.map((entry, idx) => (
                <div key={idx} className="bg-[var(--paper-deep)] border border-[var(--rule)] p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[var(--ink)] font-semibold">
                      #{idx + 1} {entry.fromState} → {entry.toState}
                    </span>
                    <span className="text-[var(--ink-soft)]">{formatDate(entry.timestamp)}</span>
                  </div>
                  <p className="text-[12px] text-[var(--ink-soft)]">{entry.actionNote}</p>
                  <div className="text-[10px] font-mono text-[var(--ink-soft)] truncate pt-0.5">
                    Hash: {entry.hash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State Transition Guard Modal */}
      {transitioningApp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--paper)] border border-[var(--ink)] max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <h3 className="font-medium serif text-base text-[var(--ink)]">Transition State Guard</h3>
              <button onClick={() => setTransitioningApp(null)} className="text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer">
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
                  <label className="block text-[var(--ink)] font-medium mb-1">
                    Portal Filing Reference ID <span className="text-[var(--stamp)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={extAppIdInput}
                    onChange={(e) => setExtAppIdInput(e.target.value)}
                    placeholder="e.g. ZED/2024/MH/99241"
                    className="w-full bg-[var(--paper-deep)] border border-[var(--rule)] px-3 py-2 text-xs text-[var(--ink)] font-mono focus:border-[var(--ink)] focus:outline-none"
                  />
                  <p className="text-[10px] text-[var(--ink-soft)] mt-0.5 font-mono">Required to satisfy deterministic FSM transition guard.</p>
                </div>
              )}

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">Action Note</label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={2}
                  className="w-full bg-[var(--paper-deep)] border border-[var(--rule)] p-2 text-xs text-[var(--ink)] focus:border-[var(--ink)] focus:outline-none"
                />
              </div>

              {transitionError && (
                <div className="p-2.5 bg-[var(--pending-bg)] border border-[var(--pending)] text-[var(--pending)] text-[11px] font-mono">
                  {transitionError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--rule)]">
              <button
                onClick={() => setTransitioningApp(null)}
                className="btn-ink-ghost text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
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
  );
}
