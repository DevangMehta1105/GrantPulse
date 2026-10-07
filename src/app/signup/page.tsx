"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  MapPin, 
  ArrowRight, 
  AlertCircle,
  FileCheck2,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { EntityType } from "@/lib/types";

const INDIAN_STATES = [
  "Karnataka", "Maharashtra", "Delhi", "Rajasthan", "Tamil Nadu",
  "Gujarat", "Telangana", "Uttar Pradesh", "West Bengal", "Kerala",
  "Madhya Pradesh", "Haryana", "Punjab", "Bihar", "Odisha", "Andhra Pradesh"
];

const ENTITY_TYPES: EntityType[] = [
  "Private Limited", "LLP", "Trust", "Society", "Section 8", "Proprietorship", "Partnership"
];

export default function SignupPage() {
  const router = useRouter();
  const { signupWithPassword } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orgName, setOrgName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("Private Limited");
  const [state, setState] = useState("Karnataka");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !orgName) {
      setErrorMsg("Please fill in all mandatory statutory enrollment fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await signupWithPassword({
      name,
      email,
      password,
      orgName,
      entityType,
      state
    });

    setIsSubmitting(false);

    if (res.success) {
      router.push("/");
    } else {
      setErrorMsg(res.error || "Enrollment failed. Please verify submitted details.");
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 font-sans">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Case File Header Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase text-[var(--stamp)] font-bold">
            <span className="w-2 h-2 rounded-full bg-[var(--stamp)] animate-pulse"></span>
            Statutory Entity Enrollment &amp; Officer Registration
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
            Enroll Your Organization
          </h1>
          <p className="text-xs text-[var(--ink-soft)] max-w-lg mx-auto font-mono">
            Register your Indian MSME, Startup, or Non-Profit (NGO/Trust) to instantly unlock AST Eligibility Reasoning, What-If Simulators, and Proposal Co-Pilot Dossiers.
          </p>
        </div>

        {/* Main Enrollment Dossier Card */}
        <div className="bg-[var(--paper-deep)] border-2 border-[var(--rule)] rounded-lg p-6 md:p-8 space-y-6 shadow-md relative overflow-hidden">
          
          {/* Top Seal Ribbon */}
          <div className="flex items-center justify-between border-b border-[var(--rule)]/70 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full border border-[var(--ink)] bg-[var(--paper)] flex items-center justify-center font-mono text-xs font-bold text-[var(--ink)] shadow-2xs">
                GP
              </span>
              <div>
                <div className="font-serif font-bold text-sm text-[var(--ink)]">
                  Form GP-REG · New Applicant Ledger Entry
                </div>
                <div className="font-mono text-[10px] text-[var(--ink-soft)]">
                  Standardized MSME &amp; NGO Regulatory Intake
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 bg-[var(--verified-bg)] text-[var(--verified)] border border-[var(--verified)]/30 rounded font-bold">
              VERIFIED PROTOCOL
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
            
            {/* Officer Details (Row 1) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[var(--ink)] uppercase">
                  Authorized Officer Name <span className="text-[var(--stamp)]">*</span>:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Devang Mehta"
                    className="w-full bg-[var(--paper)] border border-[var(--rule)] pl-9 pr-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[var(--ink)] uppercase">
                  Official Email Address <span className="text-[var(--stamp)]">*</span>:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. founder@vidyutmobility.in"
                    className="w-full bg-[var(--paper)] border border-[var(--rule)] pl-9 pr-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password (Row 2) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-[var(--ink)] uppercase">
                  Security Clearance Password <span className="text-[var(--stamp)]">*</span>:
                </label>
                <span className="text-[10px] text-[var(--ink-soft)] font-normal">
                  Minimum 6 characters
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] pl-9 pr-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                  required
                />
              </div>
            </div>

            {/* Organization Info (Row 3) */}
            <div className="pt-2 border-t border-[var(--rule)]/60 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-[var(--ink)] uppercase">
                  Legal Entity / Organization Name <span className="text-[var(--stamp)]">*</span>:
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[var(--ink-soft)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Vidyut Micro Mobility Private Limited"
                    className="w-full bg-[var(--paper)] border border-[var(--rule)] pl-9 pr-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[var(--ink)] uppercase">
                    Statutory Entity Classification:
                  </label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value as EntityType)}
                    className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] cursor-pointer shadow-inner"
                  >
                    {ENTITY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[var(--ink)] uppercase">
                    Principal Operating State:
                  </label>
                  <div className="relative">
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] cursor-pointer shadow-inner"
                    >
                      {INDIAN_STATES.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] font-mono text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[var(--stamp)]" />
                    <span>Enrolling Entity &amp; Initializing Vault...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4 text-[var(--stamp)]" />
                    <span>ENROLL ENTITY &amp; ENTER WORKSPACE</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="pt-3 border-t border-[var(--rule)]/70 flex items-center justify-between font-mono text-[11px] text-[var(--ink-soft)]">
            <span>Already hold security clearance?</span>
            <Link
              href="/login"
              className="font-bold text-[var(--stamp)] hover:underline flex items-center gap-1"
            >
              <span>Sign In to Case File</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
