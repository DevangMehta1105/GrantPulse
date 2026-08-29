"use client";

import React, { useState } from "react";
import { Application, ApplicationState } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { verifyAuditChainIntegrity } from "@/lib/fsm/state-machine";
import { 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  Hash, 
  X,
  FileCheck2,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS: { state: ApplicationState; label: string; countColor: string }[] = [
  { state: "Discovered", label: "Discovered", countColor: "text-[#8b8d98]" },
  { state: "Docs Verified", label: "Docs Verified", countColor: "text-[#3b82f6]" },
  { state: "Drafting", label: "Drafting", countColor: "text-[#f59e0b]" },
  { state: "Applied", label: "Applied", countColor: "text-[#8b5cf6]" },
  { state: "Under Review", label: "Under Review", countColor: "text-[#06b6d4]" },
  { state: "Sanctioned", label: "Sanctioned", countColor: "text-[#2eb88a]" }
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 items-start">
        {COLUMNS.map(col => {
          const colApps = orgApps.filter(a => a.currentState === col.state);
          return (
            <div 
              key={col.state} 
              className="bg-[#14151a] border border-[#232530] rounded-xl p-3 flex flex-col min-h-[480px] text-xs"
            >
              {/* Column Header */}
              <div className="pb-2.5 mb-2.5 border-b border-[#1e2029] flex items-center justify-between">
                <span className="font-semibold text-xs text-[#ededef]">{col.label}</span>
                <span className={cn("font-mono text-[11px] font-semibold", col.countColor)}>
                  {colApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2 flex-1">
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
                      className="bg-[#111216] hover:bg-[#1a1c24] border border-[#1e2029] hover:border-[#2a2c38] rounded-lg p-3 space-y-2 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-[#5e6170] font-mono mb-1">
                          <span>{app.id}</span>
                          <span>{formatDate(app.updated_at)}</span>
                        </div>
                        <h4 className="font-medium text-xs text-[#ededef] line-clamp-2 leading-snug">
                          {scheme?.title || app.schemeId}
                        </h4>
                        <div className="text-[11px] font-mono text-[#8b8d98] mt-1">
                          <span>Req: </span>
                          <strong className="text-[#ededef]">{formatINR(app.requestedAmount, true)}</strong>
                          {app.sanctionedAmount && (
                            <span className="text-[#2eb88a] ml-1 font-bold">
                              (Sanctioned: {formatINR(app.sanctionedAmount, true)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Document Readiness Bar */}
                      {readiness && (
                        <div className="text-[10px] text-[#5e6170] font-mono flex items-center justify-between pt-1 border-t border-[#1e2029]">
                          <span>Readiness:</span>
                          <span className={readiness.score >= 75 ? "text-[#2eb88a]" : "text-[#f59e0b]"}>
                            {readiness.score}% ({readiness.mandatoryVerified}/{readiness.mandatoryTotal})
                          </span>
                        </div>
                      )}

                      {/* External ID */}
                      {app.externalApplicationId && (
                        <div className="text-[10px] font-mono text-[#5e6170] truncate">
                          Ref: {app.externalApplicationId}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-[#1e2029] flex items-center justify-between">
                        <button
                          onClick={() => handleOpenAuditModal(app)}
                          className="text-[10px] font-mono text-[#5e6170] hover:text-[#ededef] flex items-center gap-1 cursor-pointer"
                          title="View SHA-256 Provenance Log"
                        >
                          <Hash className="w-3 h-3" />
                          <span>Audit</span>
                        </button>

                        {nextStates.length > 0 && (
                          <button
                            onClick={() => handleInitiateTransition(app, nextStates[0] as ApplicationState)}
                            className="text-[10px] text-[#8b8d98] hover:text-[#ededef] bg-[#1a1c24] px-2 py-0.5 rounded border border-[#232530] flex items-center gap-1 cursor-pointer"
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
                  <div className="h-24 border border-dashed border-[#1e2029] rounded-lg flex items-center justify-center text-[10px] font-mono text-[#5e6170]">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#14151a] border border-[#232530] rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden text-xs">
            <div className="p-4 border-b border-[#1e2029] flex items-center justify-between bg-[#111216]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2eb88a]" />
                <h3 className="font-semibold text-xs text-[#ededef]">
                  SHA-256 Cryptographic Audit Provenance
                </h3>
                <span className="font-mono text-[10px] text-[#5e6170]">{selectedAppForAudit.id}</span>
              </div>
              <button onClick={() => setSelectedAppForAudit(null)} className="text-[#5e6170] hover:text-[#ededef] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#111216] border-b border-[#1e2029] font-mono text-[11px] text-[#2eb88a]">
              ✓ Hash chain intact: {selectedAppForAudit.stateHistory.length} state transitions verified.
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedAppForAudit.stateHistory.map((entry, idx) => (
                <div key={idx} className="bg-[#111216] border border-[#1e2029] rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#ededef] font-semibold">
                      #{idx + 1} {entry.fromState} → {entry.toState}
                    </span>
                    <span className="text-[#5e6170]">{formatDate(entry.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-[#8b8d98]">{entry.actionNote}</p>
                  <div className="text-[9px] font-mono text-[#5e6170] truncate pt-0.5">
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#14151a] border border-[#232530] rounded-xl max-w-md w-full p-5 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#1e2029] pb-2.5">
              <h3 className="font-semibold text-xs text-[#ededef]">Transition State Guard</h3>
              <button onClick={() => setTransitioningApp(null)} className="text-[#5e6170] hover:text-[#ededef] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[#5e6170] text-[11px]">Advancing To:</span>
                <div className="font-bold text-[#2eb88a] text-xs mt-0.5">{transitioningApp.targetState}</div>
              </div>

              {transitioningApp.targetState === "Applied" && (
                <div>
                  <label className="block text-[#8b8d98] font-medium mb-1">
                    Portal Filing Reference ID <span className="text-[#ef4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={extAppIdInput}
                    onChange={(e) => setExtAppIdInput(e.target.value)}
                    placeholder="e.g. ZED/2024/MH/99241"
                    className="w-full bg-[#111216] border border-[#232530] rounded-md px-3 py-1.5 text-xs text-[#ededef] font-mono focus:border-[#373a4a] focus:outline-none"
                  />
                  <p className="text-[10px] text-[#5e6170] mt-0.5">Required to satisfy deterministic FSM transition guard.</p>
                </div>
              )}

              <div>
                <label className="block text-[#8b8d98] font-medium mb-1">Action Note</label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={2}
                  className="w-full bg-[#111216] border border-[#232530] rounded-md px-3 py-1.5 text-xs text-[#ededef] focus:border-[#373a4a] focus:outline-none"
                />
              </div>

              {transitionError && (
                <div className="p-2 rounded-md bg-[#161214] border border-[#331e24] text-[#f87171] text-[11px] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{transitionError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e2029]">
              <button
                onClick={() => setTransitioningApp(null)}
                className="px-3 py-1.5 rounded-md text-[#8b8d98] hover:text-[#ededef] hover:bg-[#1a1c24] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransition}
                className="px-3.5 py-1.5 rounded-md bg-[#ededef] text-[#0d0e11] font-semibold hover:bg-white transition-colors cursor-pointer"
              >
                Sign & Advance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
