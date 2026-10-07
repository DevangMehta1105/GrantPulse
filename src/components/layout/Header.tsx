"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Lock, LogOut, FileText, Check, Plus } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const { organizations, currentOrg, setCurrentOrgId } = useApp();
  const { user, logout } = useAuth();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const moreRef = useRef<HTMLLIElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
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

  // Close all menus on route change
  useEffect(() => {
    setIsMoreOpen(false);
    setIsOrgOpen(false);
    setIsUserOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Auth pages are 100% isolated: NEVER render navbar on login/signup
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const isSchemesActive = pathname === "/schemes" || pathname.startsWith("/schemes/");
  const isDocumentsActive = pathname === "/documents";
  const isPipelineActive = pathname === "/pipeline";
  const isComplianceActive = pathname === "/compliance";

  const isMoreActive =
    pathname === "/ingestion" ||
    pathname === "/counterfactual" ||
    pathname === "/copilot";

  return (
    <>
      <style jsx>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 14px 32px;
          background: #EFEAE0;
          border-bottom: 1px solid rgba(42, 38, 33, 0.14);
          position: sticky;
          top: 0;
          z-index: 40;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        /* ---- Left: brand ---- */
        .nav-left {
          display: flex;
          align-items: center;
          gap: 28px;
          min-width: 0;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          text-decoration: none;
          color: #2A2621;
          cursor: pointer;
        }
        .brand-mark {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid rgba(42, 38, 33, 0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.02em;
          transition: border-color 0.2s ease, transform 0.2s ease;
          background: transparent;
        }
        .brand:hover .brand-mark {
          border-color: #B5452B;
          transform: rotate(-6deg);
        }
        .brand-text {
          display: flex;
          align-items: baseline;
          gap: 6px;
          white-space: nowrap;
        }
        .brand-name {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 19px;
          font-weight: 600;
          color: #2A2621;
        }
        .brand-tag {
          font-family: "SFMono-Regular", Consolas, Menlo, monospace;
          font-size: 11px;
          color: #5A554C;
          letter-spacing: 0.02em;
        }

        /* ---- Nav links ---- */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .nav-links li {
          position: relative;
        }
        .nav-link {
          display: inline-block;
          padding: 8px 10px;
          font-family: "SFMono-Regular", Consolas, Menlo, monospace;
          font-size: 13px;
          color: #5A554C;
          text-decoration: none;
          border-radius: 6px;
          transition: color 0.18s ease, background 0.18s ease;
          white-space: nowrap;
          position: relative;
        }
        .nav-link:hover {
          color: #2A2621;
          background: rgba(42, 38, 33, 0.05);
        }
        .nav-link.active {
          color: #2A2621;
          font-weight: 600;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 2px;
          height: 2px;
          background: #B5452B;
          border-radius: 2px;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.22s ease;
        }
        .nav-link:hover::after {
          transform: scaleX(0.6);
        }
        .nav-link.active::after {
          transform: scaleX(1);
        }

        /* overflow "More" menu */
        .nav-more {
          position: relative;
        }
        .nav-more-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 10px;
          font-family: "SFMono-Regular", Consolas, Menlo, monospace;
          font-size: 13px;
          color: #5A554C;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .nav-more-btn:hover {
          color: #2A2621;
          background: rgba(42, 38, 33, 0.05);
        }
        .nav-more-btn.active {
          color: #2A2621;
          font-weight: 600;
        }
        .nav-more-btn svg {
          transition: transform 0.2s ease;
        }
        .nav-more.open .nav-more-btn svg {
          transform: rotate(180deg);
        }
        .nav-more-panel {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          min-width: 170px;
          background: #EFEAE0;
          border: 1px solid rgba(42, 38, 33, 0.14);
          border-radius: 10px;
          box-shadow: 0 8px 20px rgba(42, 38, 33, 0.12);
          padding: 6px;
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 50;
        }
        .nav-more.open .nav-more-panel {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .nav-more-panel a {
          display: block;
          padding: 8px 10px;
          font-family: "SFMono-Regular", Consolas, Menlo, monospace;
          font-size: 13px;
          color: #5A554C;
          text-decoration: none;
          border-radius: 6px;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .nav-more-panel a:hover {
          background: rgba(42, 38, 33, 0.06);
          color: #2A2621;
        }

        /* ---- Right cluster ---- */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .org-switch-wrapper {
          position: relative;
        }
        .org-switch {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #E3DDCF;
          border: 1px solid rgba(42, 38, 33, 0.14);
          border-radius: 999px;
          font-family: "SFMono-Regular", Consolas, Menlo, monospace;
          font-size: 13px;
          color: #2A2621;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease;
          user-select: none;
        }
        .org-switch:hover {
          border-color: rgba(42, 38, 33, 0.28);
          background: #DCD5C4;
        }
        .org-switch svg {
          transition: transform 0.2s ease;
          color: #5A554C;
          flex-shrink: 0;
        }
        .org-switch-wrapper.open .org-switch svg {
          transform: rotate(180deg);
        }
        .org-dropdown-panel {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 280px;
          background: #EFEAE0;
          border: 1px solid rgba(42, 38, 33, 0.14);
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(42, 38, 33, 0.14);
          padding: 6px;
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 50;
        }
        .org-switch-wrapper.open .org-dropdown-panel {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        /* User chip */
        .user-chip-wrapper {
          position: relative;
        }
        .user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px 6px 6px;
          border: 1px solid rgba(42, 38, 33, 0.14);
          border-radius: 999px;
          cursor: pointer;
          transition: border-color 0.18s ease, background 0.18s ease;
          text-decoration: none;
          background: transparent;
          user-select: none;
        }
        .user-chip:hover {
          border-color: rgba(42, 38, 33, 0.28);
          background: rgba(42, 38, 33, 0.04);
        }
        .user-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #2A2621;
          color: #EFEAE0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .user-chip span.user-name {
          font-size: 13px;
          font-weight: 600;
          color: #2A2621;
          white-space: nowrap;
        }
        .user-chip svg.chevron {
          color: #5A554C;
          transition: transform 0.2s ease;
          flex-shrink: 0;
        }
        .user-chip-wrapper.open .user-chip svg.chevron {
          transform: rotate(180deg);
        }
        .user-dropdown-panel {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          width: 240px;
          background: #EFEAE0;
          border: 1px solid rgba(42, 38, 33, 0.14);
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(42, 38, 33, 0.14);
          padding: 10px;
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 50;
        }
        .user-chip-wrapper.open .user-dropdown-panel {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        /* CTA */
        .cta {
          padding: 10px 18px;
          background: #2A2621;
          color: #EFEAE0;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.18s ease;
          white-space: nowrap;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .cta:hover {
          background: #3A352D;
        }
        .cta:active {
          transform: scale(0.97);
        }

        @media (max-width: 980px) {
          .nav-links {
            display: none;
          }
          .brand-tag {
            display: none;
          }
          .navbar {
            padding: 12px 16px;
          }
          .org-switch span {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      `}</style>

      <nav className="navbar">
        {/* Left: Brand & Main Navigation */}
        <div className="nav-left">
          <Link href="/" className="brand">
            <span className="brand-mark">GP</span>
            <span className="brand-text">
              <span className="brand-name">GrantPulse</span>
              <span className="brand-tag">Eligibility Trace</span>
            </span>
          </Link>

          <ul className="nav-links">
            <li>
              <Link
                href="/schemes"
                className={`nav-link ${isSchemesActive ? "active" : ""}`}
              >
                Schemes catalog
              </Link>
            </li>
            <li>
              <Link
                href="/documents"
                className={`nav-link ${isDocumentsActive ? "active" : ""}`}
              >
                Document vault
              </Link>
            </li>
            <li>
              <Link
                href="/pipeline"
                className={`nav-link ${isPipelineActive ? "active" : ""}`}
              >
                Pipeline
              </Link>
            </li>
            <li>
              <Link
                href="/compliance"
                className={`nav-link ${isComplianceActive ? "active" : ""}`}
              >
                Ledger
              </Link>
            </li>
            <li className={`nav-more ${isMoreOpen ? "open" : ""}`} ref={moreRef}>
              <button
                className={`nav-more-btn ${isMoreActive ? "active" : ""}`}
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                type="button"
              >
                More
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div className="nav-more-panel">
                <Link href="/ingestion" onClick={() => setIsMoreOpen(false)}>
                  Harvester
                </Link>
                <Link href="/counterfactual" onClick={() => setIsMoreOpen(false)}>
                  Compliance audit
                </Link>
                <Link href="/copilot" onClick={() => setIsMoreOpen(false)}>
                  Proposal Co-Pilot
                </Link>
              </div>
            </li>
          </ul>
        </div>

        {/* Right: Organization Switcher, User Chip, & Action CTA */}
        <div className="nav-right">
          {/* Org Switcher */}
          <div
            className={`org-switch-wrapper ${isOrgOpen ? "open" : ""}`}
            ref={orgRef}
          >
            <div
              className="org-switch"
              onClick={() => setIsOrgOpen(!isOrgOpen)}
            >
              <span className="truncate max-w-[150px] sm:max-w-[210px]">
                {currentOrg.name} ({currentOrg.entityType})
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Organizations Dropdown */}
            <div className="org-dropdown-panel font-mono text-xs">
              <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-[#5A554C] border-b border-[rgba(42,38,33,0.1)]">
                Select Active Organization:
              </div>
              <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                {organizations.map((org) => {
                  const isCurrent = org.id === currentOrg.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        setCurrentOrgId(org.id);
                        setIsOrgOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-md flex items-center justify-between text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? "bg-[rgba(42,38,33,0.08)] font-bold text-[#2A2621]"
                          : "text-[#5A554C] hover:bg-[rgba(42,38,33,0.05)] hover:text-[#2A2621]"
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="truncate text-[12px]">{org.name}</div>
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
              <div className="pt-1.5 border-t border-[rgba(42,38,33,0.1)]">
                <Link
                  href="/signup"
                  onClick={() => setIsOrgOpen(false)}
                  className="px-2.5 py-1.5 text-[11px] font-semibold text-[#B5452B] hover:bg-[rgba(42,38,33,0.05)] rounded-md flex items-center gap-1.5 no-underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enroll New Entity</span>
                </Link>
              </div>
            </div>
          </div>

          {/* User Auth Chip */}
          {user ? (
            <div
              className={`user-chip-wrapper ${isUserOpen ? "open" : ""}`}
              ref={userRef}
            >
              <div
                className="user-chip"
                onClick={() => setIsUserOpen(!isUserOpen)}
              >
                <span className="user-avatar">{user.avatarInitials || "GP"}</span>
                <span className="user-name">{user.name.split(" ")[0]}</span>
                <svg
                  className="chevron"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>

              {/* User Dropdown */}
              <div className="user-dropdown-panel font-mono text-xs">
                <div className="border-b border-[rgba(42,38,33,0.1)] pb-2 mb-2">
                  <div className="font-bold text-[#2A2621] text-[13px]">{user.name}</div>
                  <div className="text-[11px] text-[#5A554C] truncate">{user.email}</div>
                  <div className="text-[10px] text-[#B5452B] font-bold uppercase mt-0.5">
                    {user.role.replace(/_/g, " ")}
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/documents"
                    onClick={() => setIsUserOpen(false)}
                    className="flex items-center gap-2 px-2 py-1.5 text-[12px] text-[#5A554C] hover:text-[#2A2621] hover:bg-[rgba(42,38,33,0.05)] rounded-md no-underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Vault Records</span>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] font-semibold text-[#B5452B] hover:bg-red-50/50 rounded-md cursor-pointer border-none bg-transparent text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="user-chip">
              <span className="user-avatar">
                <Lock className="w-3 h-3 text-[#EFEAE0]" />
              </span>
              <span className="user-name">Sign in</span>
            </Link>
          )}

          {/* Action CTA */}
          <Link href="/eligibility" className="cta">
            Check match
          </Link>
        </div>
      </nav>
    </>
  );
}
