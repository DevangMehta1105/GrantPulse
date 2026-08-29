"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { formatINR } from "@/lib/utils";

export default function HomePage() {
  const { currentOrg, schemes, getOrgEvaluation } = useApp();

  // Find a scheme to display in the case file
  const activeScheme = schemes[0];
  const evalResult = getOrgEvaluation(activeScheme.id);

  return (
    <div>
      {/* ---------- HERO SECTION ---------- */}
      <section className="pt-20 pb-16">
        <div className="wrap">
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
            <Link href="/eligibility" className="btn-ink text-[14.5px] py-2.5 px-5">
              Start eligibility check
            </Link>
            <a href="#casefile" className="link-quiet">
              See a sample case file ↓
            </a>
          </div>

          {/* ---------- SIGNATURE CASE FILE ---------- */}
          <div className="casefile mt-16" id="casefile">
            <div className="casefile-inner">
              <div className="casefile-top">
                <div>
                  <div className="casefile-label">SAMPLE CASE FILE — READ ONLY</div>
                  <div className="casefile-title">{currentOrg.name}</div>
                </div>
                <div className="casefile-label">
                  Checked against: {activeScheme.title}
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
                    <span>Rule: turnover LTE 2500000000</span>
                  </span>
                </li>
                <li>
                  <span className={currentOrg.complianceFlags.has80G ? "mark yes" : "mark no"}>
                    {currentOrg.complianceFlags.has80G ? "✓" : "✕"}
                  </span>
                  <span className="trace-text">
                    <b>{currentOrg.complianceFlags.has80G ? "80G registration verified" : "80G registration missing"}</b> — required for tax-exempt disbursement tranche
                    <span>Rule: registrations.80G EQUALS true — {currentOrg.complianceFlags.has80G ? "valid certificate logged" : "currently pending"}</span>
                  </span>
                </li>
                <li>
                  <span className={currentOrg.complianceFlags.hasUdyam ? "mark yes" : "mark no"}>
                    {currentOrg.complianceFlags.hasUdyam ? "✓" : "✕"}
                  </span>
                  <span className="trace-text">
                    <b>{currentOrg.complianceFlags.hasUdyam ? "Udyam tier eligible" : "Udyam registration required"}</b> — qualifies for enhanced subsidy band
                    <span>Rule: udyam_tier IN [Micro, Small, Medium]</span>
                  </span>
                </li>
              </ul>

              <div className="stamp-row">
                <div className="stamp">
                  6 of 14 screened — eligible now
                </div>
                <p>
                  Filing additional registrations (12A/80G, CSR-1) opens 3 more schemes worth an estimated ₹35L in funding.
                </p>
              </div>
            </div>
          </div>
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
