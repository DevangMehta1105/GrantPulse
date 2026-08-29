"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { organizations, currentOrg, setCurrentOrgId } = useApp();

  const links = [
    { name: "How matching works", href: "/eligibility" },
    { name: "Schemes", href: "/schemes" },
    { name: "Document Vault", href: "/documents" },
    { name: "Pipeline", href: "/pipeline" },
    { name: "Ledger", href: "/compliance" }
  ];

  return (
    <header className="border-b border-[var(--rule)] bg-[var(--paper)] sticky top-0 z-40">
      <div className="wrap flex items-center justify-between py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 text-[var(--ink)] no-underline text-xl font-semibold serif">
          <span className="w-7 h-7 rounded-full border-[1.5px] border-[var(--ink)] flex items-center justify-center font-mono text-[11px] font-medium flex-shrink-0">
            GP
          </span>
          <span>GrantPulse</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[14.5px]">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "no-underline transition-colors",
                  isActive ? "text-[var(--ink)] font-semibold border-b border-[var(--ink)] pb-0.5" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Entity Switcher & Eligibility CTA */}
        <div className="flex items-center gap-3">
          {/* Subtle Entity Selector */}
          <div className="relative inline-block">
            <select
              value={currentOrg.id}
              onChange={(e) => setCurrentOrgId(e.target.value)}
              className="appearance-none bg-[var(--paper-deep)] hover:bg-[var(--rule)]/40 text-[var(--ink)] font-mono text-[11px] font-medium pl-2.5 pr-6 py-1.5 rounded-xs border border-[var(--rule)] focus:outline-none focus:border-[var(--ink)] cursor-pointer"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.entityType})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--ink-soft)] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link href="/eligibility" className="btn-ink text-[13.5px] py-1.5 px-3.5">
            Start eligibility check
          </Link>
        </div>
      </div>
    </header>
  );
}
