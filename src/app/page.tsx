"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/lib/utils";

export default function HomePage() {
  const { currentOrg, schemes, getOrgEvaluation } = useApp();
  const { user } = useAuth();

  // Find a scheme to display in the case file
  const activeScheme = schemes[0] || null;
  const evalResult = activeScheme ? getOrgEvaluation(activeScheme.id) : null;

  // Real-time screening count
  const eligibleSchemes = schemes.filter(s => getOrgEvaluation(s.id)?.isEligible);
  const totalPotentialFunding = eligibleSchemes.reduce((sum, s) => sum + s.maxFundingAmount, 0);

  return (
    <div>
      {/* ---------- HERO SECTION ---------- */}
      <section className="pt-20 pb-16">
        <div className="wrap">
          {/* Incomplete Profile Alert for First-time / Google Users */}
          {user && !user.onboardingCompleted && (
            <div className="mb-8 p-5 bg-[#FFF9EE] border-2 border-[#E0A838] rounded-xl shadow-xs text-[#3A2D13]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FCE8BD] flex items-center justify-center flex-shrink-0 text-lg">
                    ⚠️
                  </div>
                  <div>
                    <h2 className="text-base font-serif font-bold text-[#2A200F]">
                      Organization Profile Incomplete — Questionnaire Pending
                    </h2>
                    <p className="text-[13px] font-sans text-[#5C4A26] mt-0.5 leading-relaxed">
                      You are signed in as <b>{user.email}</b>, but your enterprise registrations, turnover bracket, and compliance clearances have not been submitted. GrantPulse AST match scores will default to provisional estimates until your questionnaire is completed.
                    </p>
                  </div>
                </div>
                <Link
                  href="/onboarding"
                  className="px-4 py-2.5 bg-[#22271F] hover:bg-[#343D31] text-[#FAF7F0] rounded-md text-xs font-mono font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
                >
                  Complete Questionnaire Now →
                </Link>
              </div>
            </div>
          )}

          <div className="font-mono text-[12.5px] tracking-wider uppercase text-[var(--stamp)] mb-4">
            For MSMEs &amp; NGOs registering for government and CSR grants
          </div>

          <h1 className="text-4xl md:text-5xl font-medium serif text-[var(--ink)] leading-[1.15] max-w-[16ch] mb-6 tracking-tight">
            Know exactly which grants you qualify for — and exactly why.
          </h1>

          <p className="text-[17.5px] text-[var(--ink-soft)] measure leading-relaxed mb-8">
            Most portals hand you a list of schemes and leave you to work out the fine print.
            GrantPulse reads your organisation&apos;s actual registrations against each scheme&apos;s
            real eligibility rules, and shows you the reasoning — not just a score.
          </p>

          <div className="flex flex-wrap items-center gap-5 mb-2">
            <Link href="/schemes" className="btn-ink text-[14.5px] py-2.5 px-5">
              Discover matched grants →
            </Link>
            <Link href="/documents" className="link-quiet">
              Document Vault &amp; Credentials →
            </Link>
          </div>

          {/* ---------- SIGNATURE CASE FILE ---------- */}
          {activeScheme && (
            <div className="casefile mt-16" id="casefile">
              <div className="casefile-inner">
                <div className="casefile-top">
                  <div>
                    <div className="casefile-label">
                      {user ? (
                        !user.onboardingCompleted 
                          ? "PROVISIONAL FILE · QUESTIONNAIRE PENDING" 
                          : "ACTIVE AUDIT FILE · LIVE REGISTRATION CHECK"
                      ) : "SAMPLE CASE FILE — READ ONLY"}
                    </div>
                    <div className="casefile-title">{currentOrg.name}</div>
                  </div>
                  <div className="casefile-label">
                    Evaluating against: <b>{activeScheme.title}</b>
                  </div>
                </div>

                <div className="org-facts">
                  <div>Entity type: <b>{currentOrg.entityType}</b></div>
                  <div>Annual turnover: <b>{formatINR(currentOrg.turnoverInr)}</b></div>
                  <div>Udyam tier: <b>{currentOrg.udyamTier !== 'None' ? currentOrg.udyamTier : 'Unregistered'}</b></div>
                  <div>Location: <b>{currentOrg.state}, India</b></div>
                </div>

              <ul className="trace">
                <li>
                  <span className="mark yes">✓</span>
                  <span className="trace-text">
                    <b>Entity type matches</b> — {currentOrg.entityType} accepted for this scheme
                    <span>Rule: entity_type IN [Private Limited, LLP, Section 8, Trust]</span>
                  </span>
                </li>
                <li>
                  <span className="mark yes">✓</span>
                  <span className="trace-text">
                    <b>Turnover within limit</b> — {formatINR(currentOrg.turnoverInr, true)} is under the {formatINR(activeScheme.maxFundingAmount * 50, true)} ceiling
                    <span>Rule: turnover within permissible grant limit</span>
                  </span>
                </li>
                <li>
                  <span className={currentOrg.complianceFlags.has80G ? "mark yes" : "mark no"}>
                    {currentOrg.complianceFlags.has80G ? "✓" : "✕"}
                  </span>
                  <span className="trace-text">
                    <b>{currentOrg.complianceFlags.has80G ? "80G tax exemption active" : "80G registration pending"}</b> — required for tax-exempt disbursement tranche
                    <span>Rule: registrations.80G — {currentOrg.complianceFlags.has80G ? "valid certificate on record" : "provisional filing required"}</span>
                  </span>
                </li>
                <li>
                  <span className={currentOrg.complianceFlags.hasUdyam ? "mark yes" : "mark no"}>
                    {currentOrg.complianceFlags.hasUdyam ? "✓" : "✕"}
                  </span>
                  <span className="trace-text">
                    <b>{currentOrg.complianceFlags.hasUdyam ? "Udyam tier verified" : "Udyam registration required"}</b> — qualifies for enhanced subsidy band
                    <span>Rule: udyam_tier IN [Micro, Small, Medium]</span>
                  </span>
                </li>
              </ul>

              <div className="stamp-row">
                <div className="stamp">
                  {eligibleSchemes.length} of {schemes.length} screened — eligible now
                </div>
                <p>
                  {eligibleSchemes.length > 0 
                    ? `Currently unlocks an estimated ${formatINR(totalPotentialFunding, true)} in non-dilutive government and CSR grant capital.`
                    : "Upload missing registration certificates in your Document Vault to unlock immediate grant programs."
                  }
                </p>
              </div>
            </div>
          </div>
          )}

          {!activeScheme && (
            <div className="casefile mt-16 p-8 text-center bg-[var(--paper-deep)] border border-dashed border-[var(--rule)] rounded">
              <div className="font-mono text-xs text-[var(--stamp)] uppercase mb-2">Scheme Catalog Clean</div>
              <p className="text-sm text-[var(--ink-soft)] max-w-md mx-auto mb-4">
                All mock schemes have been wiped. Ingest real government grant schemes from myScheme, Startup India, or CSR Xchange via the Scheme Harvester.
              </p>
              <Link href="/ingestion" className="btn-ink text-xs py-2 px-4 inline-block">
                Launch Scheme Harvester →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ---------- PHILOSOPHY SECTION ---------- */}
      <section className="py-24 border-t border-[var(--rule)]">
        <div className="wrap">
          <h2 className="text-3xl font-medium serif text-[var(--ink)] mb-6 max-w-[18ch] tracking-tight">
            Not a dashboard. A case file.
          </h2>
          <div className="measure space-y-4 text-[16.5px] text-[var(--ink-soft)] leading-relaxed">
            <p>
              Every scheme has a rulebook, and every rulebook is negotiable if you know what&apos;s
              actually being asked. So instead of a wall of match percentages, GrantPulse keeps
              one open file at a time — your organisation&apos;s facts, laid against one scheme&apos;s
              real conditions, line by line.
            </p>
            <p className="pull-quote">
              A percentage tells you how close you are. A reasoning trace tells you what to do next.
            </p>
            <p>
              That&apos;s the whole design decision behind this homepage, too: the numbers exist,
              and you&apos;ll see them once you&apos;re inside — but the front door opens onto one worked
              example, not a spreadsheet. Read it before you commit.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- THREE PANELS SECTION ---------- */}
      <section className="pb-24">
        <div className="wrap">
          <div className="mb-11">
            <div className="font-mono text-[12.5px] tracking-wider uppercase text-[var(--stamp)] mb-3">
              What&apos;s inside the workspace
            </div>
            <h2 className="text-2xl md:text-3xl font-medium serif text-[var(--ink)] tracking-tight">
              Three things this replaces on your desk
            </h2>
          </div>

          <div className="panel-grid">
            {/* Panel 1: Match */}
            <Link href="/eligibility" className="panel no-underline text-inherit group block hover:bg-[var(--paper-deep)] transition-colors">
              <div className="idx font-mono text-[12px] text-[var(--stamp)] mb-4">01 · Match</div>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="mb-4">
                <circle cx="14" cy="14" r="9" stroke="#22271F" strokeWidth="1.4"/>
                <line x1="20.5" y1="20.5" x2="29" y2="29" stroke="#22271F" strokeWidth="1.4"/>
              </svg>
              <h3 className="text-lg font-medium serif text-[var(--ink)] mb-2 group-hover:underline">
                The scheme finder
              </h3>
              <p className="text-[14.5px] text-[var(--ink-soft)] leading-relaxed">
                Rule-based eligibility with a visible reasoning trace, plus a &quot;what if&quot; check for registrations you haven&apos;t filed yet.
              </p>
            </Link>

            {/* Panel 2: Verify */}
            <Link href="/documents" className="panel no-underline text-inherit group block hover:bg-[var(--paper-deep)] transition-colors">
              <div className="idx font-mono text-[12px] text-[var(--stamp)] mb-4">02 · Verify</div>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="mb-4">
                <rect x="7" y="4" width="20" height="26" rx="1" stroke="#22271F" strokeWidth="1.4"/>
                <path d="M12 13h10M12 18h10M12 23h6" stroke="#22271F" strokeWidth="1.4"/>
              </svg>
              <h3 className="text-lg font-medium serif text-[var(--ink)] mb-2 group-hover:underline">
                The document folder
              </h3>
              <p className="text-[14.5px] text-[var(--ink-soft)] leading-relaxed">
                Upload registration certificates once; GrantPulse checks formats, expiry dates, and name matches automatically.
              </p>
            </Link>

            {/* Panel 3: Track */}
            <Link href="/pipeline" className="panel no-underline text-inherit group block hover:bg-[var(--paper-deep)] transition-colors">
              <div className="idx font-mono text-[12px] text-[var(--stamp)] mb-4">03 · Track</div>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="mb-4">
                <path d="M5 17h24M17 5v24" stroke="#22271F" strokeWidth="1.4" strokeDasharray="1 4"/>
                <circle cx="17" cy="17" r="12" stroke="#22271F" strokeWidth="1.4"/>
              </svg>
              <h3 className="text-lg font-medium serif text-[var(--ink)] mb-2 group-hover:underline">
                The application ledger
              </h3>
              <p className="text-[14.5px] text-[var(--ink-soft)] leading-relaxed">
                Every status change is logged in a tamper-evident chain, from first discovery through to sanctioned funds.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
