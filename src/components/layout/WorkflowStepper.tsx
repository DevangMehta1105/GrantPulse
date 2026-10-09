"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Application, ApplicationState, Scheme } from "@/lib/types";
import { 
  FileCheck2, 
  Search, 
  Layers, 
  BotMessageSquare, 
  Receipt, 
  ChevronRight, 
  CheckCircle2, 
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Send,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

// FSM state progression order
const FSM_ORDER: ApplicationState[] = [
  "Discovered",
  "Docs Verified",
  "Drafting",
  "Applied",
  "Under Review",
  "Sanctioned"
];

function getStateRank(state: ApplicationState): number {
  switch (state) {
    case "Discovered": return 1;
    case "Docs Verified": return 2;
    case "Drafting": return 3;
    case "Applied": return 4;
    case "Under Review": return 4;
    case "Sanctioned": return 5;
    case "Rejected": return 0;
    default: return 1;
  }
}

export function WorkflowStepper() {
  const pathname = usePathname();
  const { applications, schemes, documents, currentOrg } = useApp();
  const [selectedAppId, setSelectedAppId] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync selected application from localStorage or default to first in list
  useEffect(() => {
    if (applications.length > 0) {
      try {
        const savedAppId = localStorage.getItem("grantpulse_active_app_id");
        if (savedAppId && applications.some(a => a.id === savedAppId)) {
          setSelectedAppId(savedAppId);
        } else {
          setSelectedAppId(applications[0].id);
        }
      } catch {
        setSelectedAppId(applications[0].id);
      }
    }
  }, [applications]);

  const handleSelectApp = (id: string) => {
    setSelectedAppId(id);
    try {
      localStorage.setItem("grantpulse_active_app_id", id);
    } catch {}
  };

  // Only display workflow stepper on the main workflow routes
  const isWorkflowRoute = 
    pathname === "/documents" ||
    pathname === "/schemes" ||
    pathname.startsWith("/schemes/") ||
    pathname === "/pipeline" ||
    pathname === "/copilot" ||
    pathname === "/compliance" ||
    pathname === "/counterfactual" ||
    pathname === "/ingestion";

  if (!isWorkflowRoute) {
    return null;
  }

  // Active application instance
  const activeApp = applications.find(a => a.id === selectedAppId) || applications[0];
  const activeScheme = activeApp ? schemes.find(s => s.id === activeApp.schemeId) : null;
  const currentAppRank = activeApp ? getStateRank(activeApp.currentState) : 0;

  // --------------------------------------------------------------------------
  // Scenario A: An Application is Active in the Pipeline
  // The timeline is directly controlled by the Application's FSM state in Pipeline
  // --------------------------------------------------------------------------
  const APP_STAGES = [
    {
      id: "discovered",
      stepNum: 1,
      label: "Discovered & AST Match",
      shortTitle: "1. AST Match",
      path: activeScheme ? `/schemes/${activeScheme.id}` : "/schemes",
      icon: Search,
      desc: "Matched with applicant profile via Boolean AST Rule Engine.",
      isDone: currentAppRank > 1,
      isCurrent: currentAppRank === 1
    },
    {
      id: "docs_verified",
      stepNum: 2,
      label: "Docs Verification Lock",
      shortTitle: "2. Docs Verified",
      path: "/documents",
      icon: FileCheck2,
      desc: "FSM state guard: Statutory documents verified before drafting.",
      isDone: currentAppRank > 2,
      isCurrent: currentAppRank === 2
    },
    {
      id: "drafting",
      stepNum: 3,
      label: "AI Proposal Co-Pilot",
      shortTitle: "3. Proposal Drafting",
      path: activeApp ? `/copilot?appId=${activeApp.id}` : "/copilot",
      icon: BotMessageSquare,
      desc: "Detailed Project Report (DPR) synthesis & donor form autofill.",
      isDone: currentAppRank > 3,
      isCurrent: currentAppRank === 3
    },
    {
      id: "applied",
      stepNum: 4,
      label: "Applied & Review",
      shortTitle: "4. Portal Submission",
      path: "/pipeline",
      icon: Send,
      desc: "External portal reference ID logged and under ministry review.",
      isDone: currentAppRank > 4,
      isCurrent: currentAppRank === 4
    },
    {
      id: "sanctioned",
      stepNum: 5,
      label: "GFR 12-A Compliance",
      shortTitle: "5. GFR 12-A Ledger",
      path: "/compliance",
      icon: Receipt,
      desc: "Post-sanction expenditure vouchers and GFR 12-A audit certificates.",
      isDone: activeApp?.currentState === "Sanctioned",
      isCurrent: currentAppRank === 5
    }
  ];

  // --------------------------------------------------------------------------
  // Scenario B: No Applications in Pipeline Yet
  // The timeline guides user to setup documents, discover a grant, and enroll
  // --------------------------------------------------------------------------
  const PRE_PIPELINE_STAGES = [
    {
      id: "vault",
      stepNum: 1,
      label: "Credential & Document Vault",
      shortTitle: "1. Document Vault",
      path: "/documents",
      icon: FileCheck2,
      desc: "Upload statutory certificates (12A, 80G, PAN, Udyam) for OCR verification.",
      isDone: documents.some(d => d.verificationStatus === "VERIFIED"),
      isCurrent: pathname === "/documents"
    },
    {
      id: "discovery",
      stepNum: 2,
      label: "Grant Discovery & AST Match",
      shortTitle: "2. Grant Discovery",
      path: "/schemes",
      icon: Search,
      desc: "Browse harvested government & CSR schemes with deterministic AST matching.",
      isDone: false,
      isCurrent: pathname === "/schemes" || pathname.startsWith("/schemes/")
    },
    {
      id: "enroll",
      stepNum: 3,
      label: "Enroll Grant in Pipeline",
      shortTitle: "3. Enroll in Pipeline",
      path: "/schemes",
      icon: Layers,
      desc: "Select an eligible grant and click 'Apply / Track in Pipeline' to begin.",
      isDone: false,
      isCurrent: false
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 pt-3 pb-1 font-sans">
      <div className="bg-[#EAE4D6]/95 border border-[rgba(42,38,33,0.14)] rounded-xl shadow-2xs backdrop-blur-xs transition-all">
        
        {/* Main Header Row */}
        <div className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          
          {/* Left Context: Either Active Application Badge or Pre-Pipeline Indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={cn(
              "w-2 h-2 rounded-full",
              activeApp ? "bg-[var(--verified)] animate-pulse" : "bg-[var(--stamp)] animate-pulse"
            )}></span>

            {activeApp ? (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
                  Active Grant Lifecycle:
                </span>

                {/* Application Selector Dropdown (if multiple) */}
                {applications.length > 1 ? (
                  <select
                    value={activeApp.id}
                    onChange={(e) => handleSelectApp(e.target.value)}
                    className="bg-[var(--paper)] border border-[rgba(42,38,33,0.2)] rounded px-2 py-0.5 font-mono text-[11px] text-[var(--ink)] font-bold cursor-pointer"
                  >
                    {applications.map(app => {
                      const sc = schemes.find(s => s.id === app.schemeId);
                      return (
                        <option key={app.id} value={app.id}>
                          {sc?.title.slice(0, 30) || app.id}... ({app.currentState})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <span className="font-serif font-bold text-xs text-[var(--ink)] max-w-[200px] truncate" title={activeScheme?.title}>
                    {activeScheme?.title || activeApp.id}
                  </span>
                )}

                {/* Current FSM State Pill */}
                <span className="hidden sm:inline-flex px-2 py-0.2 rounded font-mono text-[10px] font-bold bg-[var(--ink)] text-[var(--paper)]">
                  FSM: {activeApp.currentState}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-mono text-[10px] sm:text-[11px] text-[var(--ink)]">
                <span className="font-bold uppercase tracking-wider">
                  Pipeline Idle:
                </span>
                <span className="text-[var(--ink-soft)] hidden sm:inline">
                  No active application enrolled
                </span>
              </div>
            )}
          </div>

          {/* Stepper Nodes */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-max">
            {activeApp ? (
              // Case 1: Application-Specific Lifecycle Stages
              APP_STAGES.map((stage, idx) => {
                const isNavMatch = 
                  (stage.id === "discovered" && (pathname === "/schemes" || pathname.startsWith("/schemes/"))) ||
                  (stage.id === "docs_verified" && pathname === "/documents") ||
                  (stage.id === "drafting" && pathname === "/copilot") ||
                  (stage.id === "applied" && pathname === "/pipeline") ||
                  (stage.id === "sanctioned" && pathname === "/compliance");

                return (
                  <React.Fragment key={stage.id}>
                    <Link
                      href={stage.path}
                      className={cn(
                        "group flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all no-underline cursor-pointer",
                        stage.isCurrent
                          ? "bg-[var(--ink)] text-[var(--paper)] font-bold shadow-xs scale-[1.02]"
                          : stage.isDone
                          ? "bg-[#DFD8C8] text-[var(--ink)] hover:bg-[#D5CDBC] font-medium"
                          : "text-[var(--ink-soft)] hover:bg-[rgba(42,38,33,0.06)] hover:text-[var(--ink)]",
                        isNavMatch && !stage.isCurrent && "ring-1 ring-[var(--ink)]/40"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-colors",
                        stage.isCurrent
                          ? "bg-[var(--stamp)] text-white"
                          : stage.isDone
                          ? "bg-[var(--verified)] text-white"
                          : "bg-[rgba(42,38,33,0.12)] text-[var(--ink)]"
                      )}>
                        {stage.isDone ? (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        ) : (
                          <span>{stage.stepNum}</span>
                        )}
                      </div>

                      <span className="hidden md:inline whitespace-nowrap">{stage.label}</span>
                      <span className="md:hidden whitespace-nowrap">{stage.shortTitle}</span>

                      {stage.isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-[rgba(239,234,224,0.2)] text-[var(--paper)] hidden lg:inline-block">
                          CURRENT
                        </span>
                      )}
                    </Link>

                    {idx < APP_STAGES.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-[rgba(42,38,33,0.3)] flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              // Case 2: Pre-Pipeline Onboarding Stages (Setup -> Discovery -> Apply)
              PRE_PIPELINE_STAGES.map((stage, idx) => {
                return (
                  <React.Fragment key={stage.id}>
                    <Link
                      href={stage.path}
                      className={cn(
                        "group flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all no-underline cursor-pointer",
                        stage.isCurrent
                          ? "bg-[var(--ink)] text-[var(--paper)] font-bold shadow-xs scale-[1.02]"
                          : stage.isDone
                          ? "bg-[#DFD8C8] text-[var(--ink)] hover:bg-[#D5CDBC] font-medium"
                          : "text-[var(--ink-soft)] hover:bg-[rgba(42,38,33,0.06)] hover:text-[var(--ink)]"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-colors",
                        stage.isCurrent
                          ? "bg-[var(--stamp)] text-white"
                          : stage.isDone
                          ? "bg-[var(--verified)] text-white"
                          : "bg-[rgba(42,38,33,0.12)] text-[var(--ink)]"
                      )}>
                        {stage.isDone ? (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        ) : (
                          <span>{stage.stepNum}</span>
                        )}
                      </div>

                      <span className="hidden md:inline whitespace-nowrap">{stage.label}</span>
                      <span className="md:hidden whitespace-nowrap">{stage.shortTitle}</span>
                    </Link>

                    {idx < PRE_PIPELINE_STAGES.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-[rgba(42,38,33,0.3)] flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Expand/Collapse Explanatory Guide Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[10px] font-mono font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] px-2 py-1 rounded bg-[rgba(42,38,33,0.04)] hover:bg-[rgba(42,38,33,0.08)] transition-colors flex-shrink-0 cursor-pointer"
            title="Toggle end-to-end grant workflow architecture guide"
          >
            <span>{isExpanded ? "Hide Guide" : "FSM Guide"}</span>
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Informative Guidance Drawer (Panel Review Ready) */}
        {isExpanded && (
          <div className="border-t border-[rgba(42,38,33,0.1)] px-4 sm:px-6 py-4 bg-[#E5DEC7]/60 rounded-b-xl animate-fadeInUp">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-3 border-b border-[rgba(42,38,33,0.08)] gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--stamp)]" />
                <span className="font-serif font-bold text-sm text-[var(--ink)]">
                  {activeApp 
                    ? `Finite State Machine Lifecycle for ${activeScheme?.title || activeApp.id}`
                    : "Pre-Pipeline Discovery & Grant Ingestion Architecture"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--ink-soft)]">
                Evaluated for: {currentOrg.name} ({currentOrg.entityType})
              </span>
            </div>

            {activeApp ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {APP_STAGES.map((s) => (
                  <div 
                    key={s.id} 
                    className={cn(
                      "p-3 rounded-lg border text-xs font-mono space-y-1.5 transition-all",
                      s.isCurrent 
                        ? "bg-[var(--paper)] border-[var(--ink)] shadow-2xs ring-1 ring-[var(--stamp)]/30" 
                        : s.isDone
                        ? "bg-[#ECE6D7] border-[var(--verified)]/40"
                        : "bg-[#ECE6D7]/60 border-[rgba(42,38,33,0.1)] opacity-70"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-[var(--stamp)]">STAGE 0{s.stepNum}</span>
                      {s.isCurrent ? (
                        <span className="px-1.5 py-0.2 bg-[var(--ink)] text-[var(--paper)] rounded text-[9px] font-bold">
                          FSM CURRENT
                        </span>
                      ) : s.isDone ? (
                        <span className="text-[var(--verified)] font-bold flex items-center gap-1">
                          ✓ DONE
                        </span>
                      ) : (
                        <span className="text-[var(--ink-soft)]">PENDING</span>
                      )}
                    </div>
                    <div className="font-bold text-[var(--ink)] text-[11px] leading-tight font-serif">
                      {s.label}
                    </div>
                    <p className="text-[10px] text-[var(--ink-soft)] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[var(--paper)] rounded-lg border border-[var(--rule)] space-y-2 text-xs font-mono">
                <div className="font-serif font-bold text-sm text-[var(--ink)]">
                  How an Application Timeline is Activated:
                </div>
                <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
                  1. Upload your entity certificates in <strong>Document Vault</strong>.<br />
                  2. In <strong>Grant Discovery</strong>, the AST engine evaluates your turnover and registrations.<br />
                  3. Click <strong>&quot;View Eligibility &amp; Apply&quot;</strong> on any grant to enroll it into the <strong>Pipeline Tracker</strong>. The moment it enters the pipeline, this timeline binds to that application and tracks its deterministic FSM progression from Discovery all the way to GFR 12-A Compliance.
                </p>
                <div className="pt-2">
                  <Link 
                    href="/schemes" 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--ink)] text-[var(--paper)] rounded text-xs font-bold"
                  >
                    <span>Browse Grant Discovery Catalog &rarr;</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
