"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { 
  Menu, 
  X, 
  FileText, 
  File, 
  GitBranch, 
  Receipt, 
  ChevronDown, 
  Landmark, 
  User, 
  Check, 
  Plus, 
  LogOut, 
  ExternalLink,
  Compass,
  Sparkles,
  Database
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { organizations, currentOrg, setCurrentOrgId } = useApp();
  const { user, logout } = useAuth();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const moreRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setIsOrgOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close all panels when pathname changes
  useEffect(() => {
    setIsMoreOpen(false);
    setIsOrgOpen(false);
    setIsUserOpen(false);
    setIsDrawerOpen(false);
  }, [pathname]);

  // Auth & Onboarding pages are 100% isolated: NEVER render navbar on login/signup/auth/onboarding
  if (pathname === "/login" || pathname === "/signup" || pathname.startsWith("/auth/") || pathname === "/onboarding") {
    return null;
  }

  const isSchemesActive = pathname === "/schemes" || pathname.startsWith("/schemes/");
  const isDocumentsActive = pathname === "/documents";
  const isPipelineActive = pathname === "/pipeline";
  const isLedgerActive = pathname === "/compliance";
  const isMoreActive =
    pathname === "/ingestion" ||
    pathname === "/counterfactual" ||
    pathname === "/copilot" ||
    pathname === "/eligibility";

  return (
    <>
      {/* Top Navbar Container (Option 4: Left Group + Right Actions) */}
      <header className="sticky top-2 z-40 px-3 sm:px-6 py-1.5 w-full max-w-[1400px] mx-auto font-sans">
        <div className="bg-[#EAE4D6] border border-[rgba(42,38,33,0.14)] rounded-xl shadow-xs px-3 sm:px-4 h-[52px] flex items-center justify-between gap-3">
          
          {/* ---- LEFT GROUP ---- */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            
            {/* Hamburger Menu Icon */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="p-1.5 text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] rounded-md transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
            >
              <Menu className="w-5 h-5 text-[#2A2621]" strokeWidth={2} />
            </button>

            {/* Primary Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-[13px]">
              
              {/* Discover grants */}
              <Link
                href="/schemes"
                className={`flex items-center gap-2 py-1.5 transition-colors relative no-underline cursor-pointer ${
                  isSchemesActive
                    ? "text-[#2A2621] font-semibold after:content-[''] after:absolute after:bottom-[-7px] after:left-0 after:right-0 after:h-[2px] after:bg-[#2A2621]"
                    : "text-[#5A554C] hover:text-[#2A2621] font-medium"
                }`}
              >
                <FileText className={`w-4 h-4 ${isSchemesActive ? "text-[#2A2621]" : "text-[#5A554C]"}`} strokeWidth={1.8} />
                <span>Discover grants</span>
              </Link>

              {/* Document vault */}
              <Link
                href="/documents"
                className={`flex items-center gap-2 py-1.5 transition-colors relative no-underline cursor-pointer ${
                  isDocumentsActive
                    ? "text-[#2A2621] font-semibold after:content-[''] after:absolute after:bottom-[-7px] after:left-0 after:right-0 after:h-[2px] after:bg-[#2A2621]"
                    : "text-[#5A554C] hover:text-[#2A2621] font-medium"
                }`}
              >
                <File className={`w-4 h-4 ${isDocumentsActive ? "text-[#2A2621]" : "text-[#5A554C]"}`} strokeWidth={1.8} />
                <span>Document vault</span>
              </Link>

              {/* Pipeline */}
              <Link
                href="/pipeline"
                className={`flex items-center gap-2 py-1.5 transition-colors relative no-underline cursor-pointer ${
                  isPipelineActive
                    ? "text-[#2A2621] font-semibold after:content-[''] after:absolute after:bottom-[-7px] after:left-0 after:right-0 after:h-[2px] after:bg-[#2A2621]"
                    : "text-[#5A554C] hover:text-[#2A2621] font-medium"
                }`}
              >
                <GitBranch className={`w-4 h-4 ${isPipelineActive ? "text-[#2A2621]" : "text-[#5A554C]"}`} strokeWidth={1.8} />
                <span>Pipeline</span>
              </Link>

              {/* Proposal Co-Pilot */}
              <Link
                href="/copilot"
                className={`flex items-center gap-2 py-1.5 transition-colors relative no-underline cursor-pointer ${
                  pathname === "/copilot"
                    ? "text-[#2A2621] font-semibold after:content-[''] after:absolute after:bottom-[-7px] after:left-0 after:right-0 after:h-[2px] after:bg-[#2A2621]"
                    : "text-[#5A554C] hover:text-[#2A2621] font-medium"
                }`}
              >
                <Sparkles className={`w-4 h-4 ${pathname === "/copilot" ? "text-[#2A2621]" : "text-[#5A554C]"}`} strokeWidth={1.8} />
                <span>Proposal co-pilot</span>
              </Link>

              {/* More ⌵ Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`flex items-center gap-1 py-1.5 cursor-pointer bg-transparent border-none text-[13px] transition-colors ${
                    isMoreActive || isMoreOpen
                      ? "text-[#2A2621] font-semibold"
                      : "text-[#5A554C] hover:text-[#2A2621] font-medium"
                  }`}
                >
                  <span>More</span>
                  <ChevronDown 
                    className={`w-3.5 h-3.5 text-[#5A554C] transition-transform duration-200 ${
                      isMoreOpen ? "rotate-180" : ""
                    }`} 
                  />
                </button>

                {isMoreOpen && (
                  <div className="absolute top-[calc(100%+12px)] left-0 w-56 bg-[#EFEAE0] border border-[rgba(42,38,33,0.14)] rounded-xl shadow-lg p-1.5 z-50 text-[13px] font-sans animate-fade-in">
                    <Link
                      href="/eligibility"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-[#5A554C] hover:text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] rounded-lg no-underline transition-colors"
                    >
                      <Compass className="w-4 h-4 text-[#B5452B]" />
                      <span>Eligibility explainer</span>
                    </Link>
                    <Link
                      href="/compliance"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-[#5A554C] hover:text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] rounded-lg no-underline transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-[#B5452B]" />
                      <span>GFR 12-A Ledger</span>
                    </Link>
                    <Link
                      href="/counterfactual"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-[#5A554C] hover:text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] rounded-lg no-underline transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-[#B5452B]" />
                      <span>What-if simulator</span>
                    </Link>
                    <div className="h-[1px] bg-[rgba(42,38,33,0.1)] my-1" />
                    <Link
                      href="/ingestion"
                      onClick={() => setIsMoreOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-[#8b8579] hover:text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] rounded-lg no-underline transition-colors text-xs font-mono"
                    >
                      <Database className="w-3.5 h-3.5 text-[#8b8579]" />
                      <span>Catalog harvester (Admin)</span>
                    </Link>
                  </div>
                )}
              </div>

            </nav>

            {/* Mobile Title Badge if Nav Links Hidden */}
            <Link href="/" className="md:hidden flex items-center gap-2 no-underline text-[#2A2621]">
              <span className="w-6 h-6 rounded-full border border-[rgba(42,38,33,0.25)] flex items-center justify-center font-mono text-[10px] font-bold">
                GP
              </span>
              <span className="font-serif font-bold text-[15px] tracking-tight">
                GrantPulse
              </span>
            </Link>

          </div>

          {/* ---- RIGHT ACTIONS ---- */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            
            {/* Incomplete Profile Indicator Banner */}
            {user && !user.onboardingCompleted && (
              <Link
                href="/onboarding"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#FFF4DC] border border-[#E0A838] rounded-full text-[11px] font-mono text-[#734A00] font-semibold hover:bg-[#FFECC2] transition-colors shadow-2xs no-underline"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span>Complete Questionnaire</span>
              </Link>
            )}

            {/* Subtle Divider */}
            <div className="hidden sm:block h-4 w-[1px] bg-[rgba(42,38,33,0.18)] mx-1" />

            {/* Organization Selector Pill */}
            <div className="relative" ref={orgRef}>
              <button
                type="button"
                onClick={() => setIsOrgOpen(!isOrgOpen)}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-[rgba(42,38,33,0.15)] bg-transparent hover:bg-[rgba(42,38,33,0.05)] text-[12px] sm:text-[13px] text-[#2A2621] cursor-pointer transition-colors max-w-[160px] sm:max-w-[240px]"
              >
                <Landmark className="w-3.5 h-3.5 text-[#2A2621] flex-shrink-0" strokeWidth={1.8} />
                <span className="truncate font-mono">
                  {organizations.length > 0 ? `${currentOrg.name} (${currentOrg.entityType})` : "Enroll Entity"}
                </span>
                <ChevronDown 
                  className={`w-3 h-3 text-[#5A554C] flex-shrink-0 transition-transform duration-200 ${
                    isOrgOpen ? "rotate-180" : ""
                  }`} 
                />
              </button>

              {/* Organization Switcher Dropdown */}
              {isOrgOpen && (
                <div className="absolute top-[calc(100%+12px)] right-0 w-72 bg-[#EFEAE0] border border-[rgba(42,38,33,0.14)] rounded-xl shadow-xl p-2 z-50 text-xs font-mono animate-fade-in">
                  <div className="px-2 py-1 text-[10px] uppercase font-bold text-[#5A554C] border-b border-[rgba(42,38,33,0.1)] mb-1">
                    Active Entity Profile:
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-0.5">
                    {organizations.length === 0 && (
                      <div className="px-2.5 py-3 text-center text-[11px] text-[#5A554C]">
                        No entities enrolled yet.
                      </div>
                    )}
                    {organizations.map((org) => {
                      const isCurrent = org.id === currentOrg.id;
                      return (
                        <button
                          key={org.id}
                          type="button"
                          onClick={() => {
                            setCurrentOrgId(org.id);
                            setIsOrgOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer border-none ${
                            isCurrent
                              ? "bg-[rgba(42,38,33,0.08)] font-bold text-[#2A2621]"
                              : "bg-transparent text-[#5A554C] hover:bg-[rgba(42,38,33,0.05)] hover:text-[#2A2621]"
                          }`}
                        >
                          <div className="truncate mr-2">
                            <div className="truncate font-semibold">{org.name}</div>
                            <div className="text-[10px] text-[#5A554C]">
                              {org.entityType} · {org.state}
                            </div>
                          </div>
                          {isCurrent && (
                            <Check className="w-3.5 h-3.5 text-[#B5452B] flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-1.5 border-t border-[rgba(42,38,33,0.1)] mt-1">
                    <Link
                      href="/signup"
                      onClick={() => setIsOrgOpen(false)}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-[#B5452B] hover:bg-[rgba(42,38,33,0.05)] rounded-lg flex items-center gap-1.5 no-underline transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Enroll New Entity</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Action / Sign in */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[rgba(42,38,33,0.05)] text-[13px] font-medium text-[#2A2621] cursor-pointer transition-colors border-none bg-transparent"
                >
                  <User className="w-4 h-4 text-[#2A2621] flex-shrink-0" strokeWidth={1.8} />
                  <span className="hidden sm:inline font-mono">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown 
                    className={`w-3 h-3 text-[#5A554C] flex-shrink-0 transition-transform duration-200 ${
                      isUserOpen ? "rotate-180" : ""
                    }`} 
                  />
                </button>

                {/* Authenticated User Menu */}
                {isUserOpen && (
                  <div className="absolute top-[calc(100%+12px)] right-0 w-60 bg-[#EFEAE0] border border-[rgba(42,38,33,0.14)] rounded-xl shadow-xl p-3 z-50 text-xs font-mono animate-fade-in">
                    <div className="border-b border-[rgba(42,38,33,0.1)] pb-2 mb-2">
                      <div className="font-bold text-[#2A2621] text-[13px]">{user.name}</div>
                      <div className="text-[11px] text-[#5A554C] truncate">{user.email}</div>
                      <div className="text-[10px] text-[#B5452B] font-bold uppercase mt-0.5">
                        {user.role.replace(/_/g, " ")}
                      </div>
                    </div>
                    {user && !user.onboardingCompleted && (
                      <Link
                        href="/onboarding"
                        onClick={() => setIsUserOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 text-[12px] text-amber-900 bg-[#FFF7E6] border border-[#E0A838] font-bold rounded-lg no-underline transition-colors mb-2"
                      >
                        <span className="text-sm">⚠️</span>
                        <span>Complete Questionnaire</span>
                      </Link>
                    )}
                    <div className="space-y-1">
                      <Link
                        href="/documents"
                        onClick={() => setIsUserOpen(false)}
                        className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-[#5A554C] hover:text-[#2A2621] hover:bg-[rgba(42,38,33,0.05)] rounded-lg no-underline transition-colors"
                      >
                        <File className="w-3.5 h-3.5" />
                        <span>Vault Records</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setIsUserOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-semibold text-[#B5452B] hover:bg-red-50/50 rounded-lg cursor-pointer border-none bg-transparent text-left transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[rgba(42,38,33,0.05)] text-[13px] font-medium text-[#2A2621] cursor-pointer transition-colors no-underline"
              >
                <User className="w-4 h-4 text-[#2A2621] flex-shrink-0" strokeWidth={1.8} />
                <span>Sign in</span>
              </Link>
            )}

          </div>

        </div>
      </header>

      {/* Slide-out Navigation Drawer for Hamburger Menu */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-80 max-w-[85vw] bg-[#EFEAE0] border-r border-[rgba(42,38,33,0.14)] h-full shadow-2xl p-6 flex flex-col justify-between z-50 animate-slide-in font-sans">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(42,38,33,0.12)]">
                <Link href="/" onClick={() => setIsDrawerOpen(false)} className="flex items-center gap-2.5 no-underline text-[#2A2621]">
                  <span className="w-8 h-8 rounded-full border border-[#2A2621] flex items-center justify-center font-mono text-xs font-bold bg-[#EAE4D6]">
                    GP
                  </span>
                  <div>
                    <div className="font-serif font-bold text-lg leading-tight">GrantPulse</div>
                    <div className="font-mono text-[10px] text-[#5A554C]">Operating System 2026</div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-md text-[#5A554C] hover:text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] cursor-pointer border-none bg-transparent"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Incomplete profile alert in mobile drawer */}
              {user && !user.onboardingCompleted && (
                <div className="mb-2 p-3 bg-[#FFF7E6] border border-[#E0A838] rounded-lg">
                  <div className="text-[11px] font-bold text-[#734A00] flex items-center gap-1.5 mb-1.5">
                    <span>⚠️ Profile Incomplete</span>
                  </div>
                  <Link
                    href="/onboarding"
                    onClick={() => setIsDrawerOpen(false)}
                    className="block text-center py-1.5 px-2 bg-[#22271F] text-[#FAF7F0] rounded text-xs font-mono font-bold no-underline"
                  >
                    Fill Questionnaire →
                  </Link>
                </div>
              )}

              {/* Full Section Directory */}
              <div className="space-y-1 font-sans text-xs">
                <div className="text-[10px] uppercase font-bold text-[#5A554C] px-3 py-1 font-mono">
                  Primary Workflow
                </div>

                <Link
                  href="/schemes"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] transition-colors no-underline font-medium"
                >
                  <FileText className="w-4 h-4 text-[#B5452B]" />
                  <span>Discover Grants</span>
                </Link>

                <Link
                  href="/documents"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] transition-colors no-underline font-medium"
                >
                  <File className="w-4 h-4 text-[#B5452B]" />
                  <span>Document Vault</span>
                </Link>

                <Link
                  href="/pipeline"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] transition-colors no-underline font-medium"
                >
                  <GitBranch className="w-4 h-4 text-[#B5452B]" />
                  <span>Application Pipeline</span>
                </Link>

                <Link
                  href="/copilot"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] transition-colors no-underline font-medium"
                >
                  <Sparkles className="w-4 h-4 text-[#B5452B]" />
                  <span>Proposal Co-Pilot</span>
                </Link>

                <div className="pt-3 text-[10px] uppercase font-bold text-[#5A554C] px-3 py-1 font-mono">
                  Analysis &amp; Compliance
                </div>

                <Link
                  href="/eligibility"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] transition-colors no-underline font-medium"
                >
                  <Compass className="w-4 h-4 text-[#B5452B]" />
                  <span>Eligibility Explainer</span>
                </Link>

                <Link
                  href="/compliance"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] transition-colors no-underline font-medium"
                >
                  <Receipt className="w-4 h-4 text-[#B5452B]" />
                  <span>GFR 12-A Ledger</span>
                </Link>

                <Link
                  href="/counterfactual"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] transition-colors no-underline font-medium"
                >
                  <Receipt className="w-4 h-4 text-[#B5452B]" />
                  <span>What-If Simulator</span>
                </Link>

                <div className="pt-2">
                  <Link
                    href="/ingestion"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-[#8b8579] hover:text-[#2A2621] hover:bg-[rgba(42,38,33,0.06)] transition-colors no-underline text-xs font-mono"
                  >
                    <Database className="w-3.5 h-3.5 text-[#8b8579]" />
                    <span>Catalog Harvester (Admin)</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-[rgba(42,38,33,0.12)] text-xs font-mono text-[#5A554C]">
              <div className="font-semibold text-[#2A2621] mb-1">
                Active: {currentOrg.name}
              </div>
              <div>{currentOrg.entityType} · {currentOrg.state}</div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
