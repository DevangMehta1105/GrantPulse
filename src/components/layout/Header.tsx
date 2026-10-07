"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown, LogOut, User, Lock, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();
  const { organizations, currentOrg, setCurrentOrgId } = useApp();
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const links = [
    { name: "Eligibility Trace", href: "/eligibility" },
    { name: "Schemes Catalog", href: "/schemes" },
    { name: "Document Vault", href: "/documents" },
    { name: "Pipeline", href: "/pipeline" },
    { name: "Ledger", href: "/compliance" },
    { name: "Harvester", href: "/ingestion" }
  ];

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

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
        <nav className="hidden lg:flex items-center gap-5 text-[13px] font-mono">
          {links.map(link => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "no-underline transition-colors whitespace-nowrap py-1",
                  isActive 
                    ? "text-[var(--ink)] font-bold border-b-2 border-[var(--stamp)]" 
                    : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: User Clearance Profile & Entity Selector */}
        <div className="flex items-center gap-3 flex-shrink-0">
          
          {/* Organization Switcher */}
          <div className="relative inline-block">
            <select
              value={currentOrg.id}
              onChange={(e) => setCurrentOrgId(e.target.value)}
              className="appearance-none bg-[var(--paper-deep)] hover:bg-[var(--rule)]/40 text-[var(--ink)] font-mono text-[11px] font-medium pl-2.5 pr-6 py-1.5 rounded-xs border border-[var(--rule)] focus:outline-none focus:border-[var(--ink)] cursor-pointer max-w-[150px] sm:max-w-[190px] truncate"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name} ({org.entityType})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[var(--ink-soft)] absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* User Auth Profile Chip */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 bg-[var(--paper-deep)] hover:bg-[#E4DCCB] border border-[var(--rule)] rounded-full text-xs font-mono transition-colors cursor-pointer"
              >
                <span className="w-6 h-6 rounded-full bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-bold text-[10px]">
                  {user.avatarInitials}
                </span>
                <span className="font-bold text-[var(--ink)] hidden sm:inline truncate max-w-[110px]">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-[var(--ink-soft)]" />
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-[var(--paper)] border border-[var(--rule)] rounded-lg shadow-lg p-3 space-y-3 z-50 font-mono text-xs animate-fade-in">
                    
                    {/* User Identity */}
                    <div className="border-b border-[var(--rule)]/70 pb-2 space-y-0.5">
                      <div className="font-bold text-[var(--ink)] text-sm">{user.name}</div>
                      <div className="text-[10px] text-[var(--ink-soft)] truncate">{user.email}</div>
                      <div className="text-[10px] font-bold text-[var(--stamp)] uppercase pt-0.5">
                        {user.role.replace(/_/g, ' ')} · {user.orgName}
                      </div>
                    </div>

                    {/* Sign Out */}
                    <div className="pt-1 flex items-center justify-between">
                      <Link
                        href="/documents"
                        onClick={() => setShowUserDropdown(false)}
                        className="text-[11px] text-[var(--ink-soft)] hover:text-[var(--ink)]"
                      >
                        Vault Records
                      </Link>
                      <button
                        onClick={() => { logout(); setShowUserDropdown(false); }}
                        className="text-[11px] font-bold text-[var(--stamp)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>

                  </div>
                </>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="px-3 py-1.5 bg-[#22271F] hover:bg-[#343D31] text-[#FAF7F0] font-sans text-xs font-medium rounded-md flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign in</span>
            </Link>
          )}

          {/* Quick CTA */}
          <Link href="/eligibility" className="btn-ink text-[12px] py-1.5 px-3 whitespace-nowrap font-mono hidden sm:inline-flex">
            Check Match
          </Link>
        </div>
      </div>
    </header>
  );
}
