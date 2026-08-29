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
    { name: "Eligibility Trace", href: "/eligibility" },
    { name: "Schemes Catalog", href: "/schemes" },
    { name: "Document Vault", href: "/documents" },
    { name: "Pipeline", href: "/pipeline" },
    { name: "Ledger", href: "/compliance" }
  ];

  return (
    <header className="border-b border-[var(--rule)] bg-[var(--paper)] sticky top-0 z-40">
      <div className="wrap flex items-center justify-between h-16">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2.5 text-[var(--ink)] no-underline text-xl font-semibold serif flex-shrink-0">
          <span className="w-7 h-7 rounded-full border-[1.5px] border-[var(--ink)] flex items-center justify-center font-mono text-[11px] font-medium flex-shrink-0">
            GP
          </span>
          <span>GrantPulse</span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[14px]">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "no-underline transition-colors whitespace-nowrap py-1",
                  isActive 
                    ? "text-[var(--ink)] font-semibold border-b-2 border-[var(--ink)]" 
                    : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Entity Selector & CTA */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Entity Selector */}
          <div className="relative inline-block">
            <select
              value={currentOrg.id}
              onChange={(e) => setCurrentOrgId(e.target.value)}
              className="appearance-none bg-[var(--paper-deep)] hover:bg-[var(--rule)]/40 text-[var(--ink)] font-mono text-[11px] font-medium pl-2.5 pr-6 py-1.5 rounded-xs border border-[var(--rule)] focus:outline-none focus:border-[var(--ink)] cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.entityType})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--ink-soft)] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link href="/eligibility" className="btn-ink text-[13px] py-1.5 px-3 whitespace-nowrap">
            Eligibility Check
          </Link>
        </div>
      </div>
    </header>
  );
}
