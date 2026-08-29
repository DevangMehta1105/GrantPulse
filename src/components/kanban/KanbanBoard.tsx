"use client";

import React, { useState } from "react";
import { Application, ApplicationState, Scheme } from "@/lib/types";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { verifyAuditChainIntegrity } from "@/lib/fsm/state-machine";
import { 
  ShieldCheck, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Hash, 
  History, 
  X,
  FileCheck2,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLUMNS: { state: ApplicationState; label: string; color: string; desc: string }[] = [
  { state: "Discovered", label: "Discovered", color: "border-sky-500/40 text-sky-400 bg-sky-500/10", desc: "Matched by AST rule engine" },
  { state: "Docs Verified", label: "Docs Verified", color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10", desc: "Mandatory regex OCR checked" },
  { state: "Drafting", label: "Drafting", color: "border-amber-500/40 text-amber-400 bg-amber-500/10", desc: "Proposal & budget compilation" },
  { state: "Applied", label: "Applied", color: "border-purple-500/40 text-purple-400 bg-purple-500/10", desc: "Filing submitted to portal" },
  { state: "Under Review", label: "Under Review", color: "border-blue-500/40 text-blue-400 bg-blue-500/10", desc: "Government desk / field audit" },
  { state: "Sanctioned", label: "Sanctioned", color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", desc: "Grant approved & ledger unlocked" }
];

export function KanbanBoard() {
  const { applications, schemes, currentOrg, moveApplicationState, getOrgDocumentReadiness } = useApp();
  const [selectedAppForAudit, setSelectedAppForAudit] = useState<Application | null>(null);
  const [auditVerification, setAuditVerification] = useState<{ isValid: boolean; error?: string } | null>(null);
  
  // Transition prompt modal
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        {COLUMNS.map(col => {
          const colApps = orgApps.filter(a => a.currentState === col.state);
          return (
            <div 
              key={col.state} 
              className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-3 flex flex-col min-h-[560px] shadow-sm"
            >
              {/* Column Header */}
              <div className="pb-3 mb-3 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", col.color)}>
                      {col.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      {colApps.length}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 leading-tight">{col.desc}</p>
                </div>
              </div>

              {/* Cards list */}
              <div className="flex-1 space-y-3">
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
                      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-xl p-3.5 space-y-3 transition-all hover:border-slate-600 shadow-md group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 mb-1">
                          <span className="font-mono text-emerald-400 font-semibold">{app.id}</span>
                          <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                            {formatDate(app.updated_at)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-white line-clamp-2 leading-snug">
                          {scheme?.title || app.schemeId}
                        </h4>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <span>Req:</span>
                          <strong className="text-slate-200">{formatINR(app.requestedAmount, true)}</strong>
                          {app.sanctionedAmount && (
                            <span className="text-emerald-400 ml-1">
                              (Sanctioned: {formatINR(app.sanctionedAmount, true)})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Document Readiness Pill */}
                      {readiness && (
                        <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
                          <span className="flex items-center gap-1 text-slate-400">
                            <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
                            Readiness:
                          </span>
                          <span className={cn(
                            "font-bold font-mono",
                            readiness.score >= 75 ? "text-emerald-400" : "text-amber-400"
                          )}>
                            {readiness.score}% ({readiness.mandatoryVerified}/{readiness.mandatoryTotal})
                          </span>
                        </div>
                      )}

                      {/* External ID if filed */}
                      {app.externalApplicationId && (
                        <div className="text-[11px] text-slate-400 bg-purple-950/30 border border-purple-800/40 px-2 py-1 rounded font-mono truncate">
                          Ref: <span className="text-purple-300 font-semibold">{app.externalApplicationId}</span>
                        </div>
                      )}

                      {/* Actions & Audit Button */}
                      <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-1">
                        <button
                          onClick={() => handleOpenAuditModal(app)}
                          className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700/50 transition-colors"
                          title="View SHA-256 Audit Trail"
                        >
                          <Hash className="w-3 h-3 text-cyan-400" />
                          <span>Audit Log</span>
                        </button>

                        {/* Transition button */}
                        {nextStates.length > 0 && (
                          <button
                            onClick={() => handleInitiateTransition(app, nextStates[0] as ApplicationState)}
                            className="text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all font-medium"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400 font-medium">
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SHA-256 Audit Ledger Modal */}
      {selectedAppForAudit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    Cryptographic Audit Trail
                    <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-cyan-400 rounded border border-slate-700">
                      {selectedAppForAudit.id}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Deterministic SHA-256 state transition provenance log</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAppForAudit(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cryptographic Integrity Banner */}
            <div className="p-4 bg-slate-950/40 border-b border-slate-800">
              {auditVerification?.isValid ? (
                <div className="flex items-center gap-2.5 text-emerald-400 text-xs font-medium bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Cryptographic Integrity Verified: All {selectedAppForAudit.stateHistory.length} state transitions match mathematically with unbroken hash continuity.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-rose-400 text-xs font-medium bg-rose-950/30 border border-rose-500/30 p-2.5 rounded-xl">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Integrity check warning: {auditVerification?.error}</span>
                </div>
              )}
            </div>

            {/* Log Sequence */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {selectedAppForAudit.stateHistory.map((entry, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-6 h-6 rounded-full bg-slate-700 text-slate-200 font-mono font-bold flex items-center justify-center text-[11px]">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">
                        {entry.fromState} <ArrowRight className="w-3 h-3 inline text-slate-400" /> <span className="text-emerald-400">{entry.toState}</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{formatDate(entry.timestamp)}</span>
                  </div>

                  <p className="text-xs text-slate-300 pl-8">{entry.actionNote}</p>

                  <div className="pl-8 pt-2 grid grid-cols-1 gap-1 text-[10px] font-mono">
                    <div className="text-slate-400 truncate">
                      <span className="text-slate-400">Prev Hash: </span>
                      <span className="text-slate-400">{entry.previousHash}</span>
                    </div>
                    <div className="text-cyan-400 font-semibold truncate bg-slate-900/80 p-1.5 rounded border border-slate-700">
                      <span className="text-slate-400 font-normal">Block Hash: </span>
                      {entry.hash}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* State Transition Guard Modal */}
      {transitioningApp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Confirm State Transition</h3>
              <button onClick={() => setTransitioningApp(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Target State:</span>
                <div className="font-bold text-emerald-400 text-sm mt-0.5">{transitioningApp.targetState}</div>
              </div>

              {transitioningApp.targetState === "Applied" && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Government / Portal Acknowledgement ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={extAppIdInput}
                    onChange={(e) => setExtAppIdInput(e.target.value)}
                    placeholder="e.g. ZED/2024/MH/99241 or CSRX-4412"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Required to satisfy deterministic FSM transition guard.</p>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Audit Action Note</label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {transitionError && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{transitionError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setTransitioningApp(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransition}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
              >
                Sign & Advance (SHA-256)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
