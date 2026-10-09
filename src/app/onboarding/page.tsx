"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { EntityType, UdyamTier } from "@/lib/types";
import { Building2, CheckCircle2, ShieldCheck, ArrowRight, Loader2, Sparkles, FileText } from "lucide-react";
import Link from "next/link";

const INDIAN_STATES = [
  "Karnataka", "Maharashtra", "Delhi", "Gujarat", "Tamil Nadu",
  "Telangana", "Uttar Pradesh", "Rajasthan", "Kerala", "West Bengal",
  "Madhya Pradesh", "Haryana", "Punjab", "Odisha", "Andhra Pradesh", "Bihar"
];

const ENTITY_TYPES: EntityType[] = [
  "Private Limited", "LLP", "Trust", "Society", "Section 8", "Proprietorship", "Partnership"
];

const SECTORS = [
  "CleanTech & EV Mobility",
  "Healthcare & Rural Sanitation",
  "AgriTech & Food Processing",
  "DeepTech & Artificial Intelligence",
  "Renewable Energy & Sustainability",
  "Social Welfare & Education",
  "Textiles, Handicrafts & MSME"
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding, isLoading: authLoading } = useAuth();
  const { currentOrg } = useApp();

  const [orgName, setOrgName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("Private Limited");
  const [state, setState] = useState("Karnataka");
  const [sector, setSector] = useState("CleanTech & EV Mobility");
  const [turnoverOption, setTurnoverOption] = useState<string>("2.5cr_10cr");
  const [udyamTier, setUdyamTier] = useState<UdyamTier>("Small");

  // Compliance Flags
  const [hasPan, setHasPan] = useState(true);
  const [hasGstin, setHasGstin] = useState(true);
  const [hasUdyam, setHasUdyam] = useState(true);
  const [has12A80G, setHas12A80G] = useState(true);
  const [hasNgoDarpan, setHasNgoDarpan] = useState(true);
  const [hasCsr1, setHasCsr1] = useState(true);
  const [missionDescription, setMissionDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isNgo = entityType === "Trust" || entityType === "Society" || entityType === "Section 8";

  // Prepopulate if user already had some details or default org
  useEffect(() => {
    if (user?.name && !orgName) {
      setOrgName(`${user.name}'s Enterprise`);
    }
  }, [user, orgName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!orgName.trim()) {
      setErrorMsg("Please enter your legal enterprise or entity name.");
      return;
    }

    let turnoverInr = 48000000;
    if (turnoverOption === "under_50l") turnoverInr = 3500000;
    else if (turnoverOption === "50l_2.5cr") turnoverInr = 15000000;
    else if (turnoverOption === "2.5cr_10cr") turnoverInr = 48000000;
    else if (turnoverOption === "10cr_50cr") turnoverInr = 240000000;
    else if (turnoverOption === "above_50cr") turnoverInr = 650000000;

    setIsSubmitting(true);

    const res = await completeOnboarding({
      orgName: orgName.trim(),
      entityType,
      state,
      sector,
      turnoverInr,
      udyamTier: isNgo ? "None" : (hasUdyam ? udyamTier : "None"),
      complianceFlags: {
        hasPan: true,
        hasGstin: !isNgo && hasGstin,
        hasUdyam: !isNgo && hasUdyam,
        has12A: isNgo && has12A80G,
        has80G: isNgo && has12A80G,
        hasNgoDarpan: isNgo && hasNgoDarpan,
        hasCsr1: isNgo && hasCsr1,
        hasFcra: false
      }
    });

    setIsSubmitting(false);

    if (res.success) {
      router.push("/schemes?onboarded=true");
    } else {
      setErrorMsg(res.error || "Failed to finalize organization profile.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-[#5C5648]" />
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] py-10 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-[680px]">

        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D8D0BE] mb-6">
          <Link href="/" className="flex items-center gap-2.5 no-underline text-[#22271F]">
            <div className="w-[30px] h-[30px] rounded-full border border-[#5C5648] flex items-center justify-center text-xs font-serif font-medium">
              GP
            </div>
            <span className="font-serif text-[17px] font-semibold text-[#22271F] tracking-tight">
              GrantPulse
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-[#5C5648]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Profile Incomplete</span>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-[#F5EFE1] border border-[#D8D0BE] rounded-xl flex items-start gap-3.5">
          <Sparkles className="w-5 h-5 text-[#8F5224] flex-shrink-0 mt-0.5" />
          <div className="text-[13px] leading-relaxed text-[#4A4335]">
            <p className="font-semibold text-[#22271F] mb-0.5">
              Welcome, {user?.name || "Officer"} ({user?.email})
            </p>
            You have authenticated via Google. GrantPulse operates on deterministic AST eligibility models. Complete this 1-minute questionnaire to calibrate your organization against 100+ government subsidies and CSR grants.
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 text-[13px] rounded-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-[#FAF7F0] border border-[#D8D0BE] rounded-xl p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#7A7466] mb-1">
                Step 1 of 1 · Questionnaire
              </p>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#22271F] tracking-tight">
                Organization Compliance Profile
              </h1>
            </div>

            {/* Legal Entity Name */}
            <div>
              <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                Legal Entity / Enterprise Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Vidyut Mobility Solutions Private Limited"
                required
                className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] placeholder:text-[#9C9585] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors"
              />
            </div>

            {/* Entity Type & State Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Legal Entity Type
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as EntityType)}
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors cursor-pointer"
                >
                  {ENTITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Registered State (HQ)
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors cursor-pointer"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sector */}
            <div>
              <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                Primary Operating Sector
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors cursor-pointer"
              >
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            {/* Annual Turnover Bracket */}
            <div>
              <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                Annual Operating Turnover (FY 2025-26)
              </label>
              <select
                value={turnoverOption}
                onChange={(e) => setTurnoverOption(e.target.value)}
                className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors cursor-pointer"
              >
                <option value="under_50l">Under ₹50 Lakhs (Seed / Micro)</option>
                <option value="50l_2.5cr">₹50 Lakhs – ₹2.5 Crores (Early Growth)</option>
                <option value="2.5cr_10cr">₹2.5 Crores – ₹10 Crores (Small Enterprise)</option>
                <option value="10cr_50cr">₹10 Crores – ₹50 Crores (Medium Enterprise)</option>
                <option value="above_50cr">Above ₹50 Crores (Large / Established)</option>
              </select>
            </div>

            {/* Entity-Specific Compliance Registrations */}
            <div className="pt-2 border-t border-[#D8D0BE]">
              <p className="text-[13px] font-semibold text-[#22271F] mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3F6B52]" />
                <span>Statutory Registrations &amp; Clearances</span>
              </p>

              {!isNgo ? (
                /* For-Profit MSME / Company Registrations */
                <div className="space-y-3 bg-white p-3.5 border border-[#C9C0AC] rounded-md text-[13px]">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasUdyam}
                      onChange={(e) => setHasUdyam(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22271F] focus:ring-0 border-[#C9C0AC] cursor-pointer"
                    />
                    <span className="text-[#22271F] font-medium">
                      Registered on Udyam MSME Portal (Ministry of MSME)
                    </span>
                  </label>

                  {hasUdyam && (
                    <div className="pl-6 pt-1 flex items-center gap-2">
                      <span className="text-xs text-[#5C5648]">Udyam Tier:</span>
                      {(["Micro", "Small", "Medium"] as UdyamTier[]).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setUdyamTier(tier)}
                          className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                            udyamTier === tier
                              ? "bg-[#22271F] text-[#FAF7F0] border-[#22271F] font-medium"
                              : "bg-white text-[#5C5648] border-[#C9C0AC] hover:border-[#22271F]"
                          }`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  )}

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasGstin}
                      onChange={(e) => setHasGstin(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22271F] focus:ring-0 border-[#C9C0AC] cursor-pointer"
                    />
                    <span className="text-[#22271F]">
                      Active GST Identification Number (GSTIN)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasPan}
                      onChange={(e) => setHasPan(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22271F] focus:ring-0 border-[#C9C0AC] cursor-pointer"
                    />
                    <span className="text-[#22271F]">
                      Company Permanent Account Number (PAN Card)
                    </span>
                  </label>
                </div>
              ) : (
                /* NGO / Trust / Section 8 Clearances */
                <div className="space-y-3 bg-white p-3.5 border border-[#C9C0AC] rounded-md text-[13px]">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={has12A80G}
                      onChange={(e) => setHas12A80G(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22271F] focus:ring-0 border-[#C9C0AC] cursor-pointer"
                    />
                    <span className="text-[#22271F] font-medium">
                      Income Tax 12A &amp; 80G Exemption Certificates Active
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasNgoDarpan}
                      onChange={(e) => setHasNgoDarpan(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22271F] focus:ring-0 border-[#C9C0AC] cursor-pointer"
                    />
                    <span className="text-[#22271F]">
                      NITI Aayog NGO-Darpan Unique Registration ID
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCsr1}
                      onChange={(e) => setHasCsr1(e.target.checked)}
                      className="w-4 h-4 rounded text-[#22271F] focus:ring-0 border-[#C9C0AC] cursor-pointer"
                    />
                    <span className="text-[#22271F]">
                      MCA Form CSR-1 Registration for Corporate Social Responsibility
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#22271F] hover:bg-[#343D31] text-[#FAF7F0] rounded-md text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Calibrating AST Eligibility Engine...</span>
                  </>
                ) : (
                  <>
                    <span>Save Profile &amp; Discover Matched Grants</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
