"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  FileCheck2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPassword, quickLoginAs, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both official email and security password.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await loginWithPassword(email, password);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMsg(res.error || "Authentication clearance failed. Verify credentials.");
    }
  };

  const handlePersonaSelect = (persona: "msme" | "ngo" | "evaluator") => {
    quickLoginAs(persona);
    router.push("/");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-sans">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Case File Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-[var(--stamp)] font-bold">
            <span className="w-2 h-2 rounded-full bg-[var(--stamp)] animate-pulse"></span>
            Security Clearance &amp; Officer Access
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
            Sign In to GrantPulse
          </h1>
          <p className="text-xs text-[var(--ink-soft)] max-w-md mx-auto font-mono">
            Access statutory grant lifecycle records, AST reasoner dossiers, and cryptographically verified GFR ledgers.
          </p>
        </div>

        {/* Main Sign In Dossier Card */}
        <div className="bg-[var(--paper-deep)] border-2 border-[var(--rule)] rounded-lg p-6 md:p-8 space-y-6 shadow-md relative overflow-hidden">
          
          {/* Top Seal Ribbon */}
          <div className="flex items-center justify-between border-b border-[var(--rule)]/70 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full border border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center font-mono text-xs font-bold text-[var(--ink)] shadow-2xs">
                GP
              </span>
              <div>
                <div className="font-serif font-bold text-sm text-[var(--ink)]">
                  Statutory Officer Verification
                </div>
                <div className="font-mono text-[10px] text-[var(--ink-soft)]">
                  Govt. &amp; CSR Grant Protocol 2026
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--verified-bg)] text-[var(--verified)] border border-[var(--verified)]/30 rounded font-bold">
              SHA-256 SECURED
            </span>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono rounded flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[var(--ink)] uppercase">
                Official Email Address:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. founder@vidyutmobility.in"
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] pl-9 pr-3 py-2.5 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[var(--ink)] uppercase">
                  Security Password:
                </label>
                <span className="text-[10px] text-[var(--ink-soft)] font-normal">
                  Min 6 characters
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] pl-9 pr-3 py-2.5 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] font-mono text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[var(--stamp)]" />
                  <span>Verifying Clearance...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[var(--stamp)]" />
                  <span>SIGN IN TO CLEARANCE WORKSPACE</span>
                </>
              )}
            </button>
          </form>

          {/* 1-Click Instant Persona Clearance Panel */}
          <div className="pt-4 border-t border-[var(--rule)]/70 space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[var(--ink-soft)]">
              <span className="font-bold">⚡ Quick Clearance (1-Click Test Personas):</span>
              <span className="text-[var(--stamp)] font-bold">Instant Switch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePersonaSelect("msme")}
                className="p-2.5 bg-[var(--paper)] hover:bg-[#E4DCCB] border border-[var(--rule)] hover:border-[var(--ink)] rounded text-left space-y-0.5 transition-all text-xs group"
              >
                <div className="font-bold text-[var(--ink)] group-hover:text-[var(--stamp)] flex items-center justify-between text-[11px]">
                  <span>Vidyut Mobility</span>
                  <span className="text-[9px] font-mono bg-[var(--paper-deep)] px-1 rounded">MSME</span>
                </div>
                <div className="text-[10px] text-[var(--ink-soft)] font-mono truncate">Devang (Founder)</div>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSelect("ngo")}
                className="p-2.5 bg-[var(--paper)] hover:bg-[#E4DCCB] border border-[var(--rule)] hover:border-[var(--ink)] rounded text-left space-y-0.5 transition-all text-xs group"
              >
                <div className="font-bold text-[var(--ink)] group-hover:text-[var(--stamp)] flex items-center justify-between text-[11px]">
                  <span>Arogya Trust</span>
                  <span className="text-[9px] font-mono bg-[var(--paper-deep)] px-1 rounded">Trust</span>
                </div>
                <div className="text-[10px] text-[var(--ink-soft)] font-mono truncate">Dr. Priya (Trustee)</div>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSelect("evaluator")}
                className="p-2.5 bg-[var(--paper)] hover:bg-[#E4DCCB] border border-[var(--rule)] hover:border-[var(--ink)] rounded text-left space-y-0.5 transition-all text-xs group"
              >
                <div className="font-bold text-[var(--ink)] group-hover:text-[var(--stamp)] flex items-center justify-between text-[11px]">
                  <span>Ministry Desk</span>
                  <span className="text-[9px] font-mono bg-[var(--paper-deep)] px-1 rounded">MoMSME</span>
                </div>
                <div className="text-[10px] text-[var(--ink-soft)] font-mono truncate">Rajesh Varma (IES)</div>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-[var(--rule)]/70 flex items-center justify-between font-mono text-[11px] text-[var(--ink-soft)]">
            <span>New Organization?</span>
            <Link
              href="/signup"
              className="font-bold text-[var(--stamp)] hover:underline flex items-center gap-1"
            >
              <span>Enroll New Entity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
