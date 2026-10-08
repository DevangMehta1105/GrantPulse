"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "./Header";
import { useAuth } from "@/context/AuthContext";

const PROTECTED_ROUTES = [
  "/pipeline",
  "/documents",
  "/compliance",
  "/copilot",
  "/counterfactual",
  "/ingestion"
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const isAuthRoute = pathname === "/login" || pathname === "/signup";

  // Client-side authentication guard for protected internal routes
  useEffect(() => {
    if (!isLoading && !user) {
      const isProtected = PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));
      if (isProtected) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [user, isLoading, pathname, router]);

  // Auth pages are 100% isolated: NO app navbar, NO global footer, NO dashboard links
  if (isAuthRoute) {
    return (
      <main className="min-h-screen bg-[var(--paper)] flex flex-col justify-center">
        {children}
      </main>
    );
  }

  // If user is accessing a protected route without being authenticated, block access
  const isProtected = PROTECTED_ROUTES.some(route => pathname === route || pathname.startsWith(route + "/"));
  if (!isLoading && !user && isProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] font-mono text-xs text-[var(--ink-soft)]">
        Authentication required. Redirecting to officer sign-in...
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-[var(--rule)] py-9 text-[13px] text-[var(--ink-soft)] bg-[var(--paper)]">
        <div className="wrap flex justify-between flex-wrap gap-3">
          <span>GrantPulse — Grant acquisition &amp; compliance OS for Indian MSMEs &amp; NGOs</span>
          <span className="space-x-3 text-xs">
            <a href="/schemes" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline">Discover Grants</a>
            <span>·</span>
            <a href="/pipeline" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline">Application Pipeline</a>
            <span>·</span>
            <a href="/copilot" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline">Proposal Co-Pilot</a>
            <span>·</span>
            <a href="/eligibility" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline">Eligibility Explainer</a>
            <span>·</span>
            <a href="/compliance" className="text-[var(--ink-soft)] hover:text-[var(--ink)] underline">GFR 12-A Ledger</a>
            <span>·</span>
            <a href="/ingestion" className="text-[#8b8579] hover:text-[var(--ink)] font-mono text-[11px] underline">Admin Harvester</a>
          </span>
        </div>
      </footer>
    </>
  );
}
