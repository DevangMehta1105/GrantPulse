"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { EntityType } from "@/lib/types";

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

export default function SignupPage() {
  const router = useRouter();
  const { signupWithPassword, loginWithGoogle } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Officer Account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2: Organization Details
  const [orgName, setOrgName] = useState("");
  const [entityType, setEntityType] = useState<EntityType>("Private Limited");
  const [state, setState] = useState("Karnataka");
  const [sector, setSector] = useState("CleanTech & EV Mobility");
  const [turnoverOption, setTurnoverOption] = useState<string>("2.5cr_10cr");
  const [udyamTier, setUdyamTier] = useState<"Micro" | "Small" | "Medium" | "None">("Small");
  
  // Compliance checkboxes
  const [has12A80G, setHas12A80G] = useState(true);
  const [hasNgoDarpan, setHasNgoDarpan] = useState(true);
  const [hasCsr1, setHasCsr1] = useState(true);
  const [hasUdyam, setHasUdyam] = useState(true);
  const [hasGstin, setHasGstin] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);
    const res = await loginWithGoogle();
    if (!res.success) {
      setErrorMsg(res.error || "Google authentication failed. Please check your network or credentials.");
      setIsGoogleLoading(false);
    }
  };

  const isNgo = entityType === "Trust" || entityType === "Society" || entityType === "Section 8";

  // Password strength logic
  const getPasswordStrength = () => {
    if (!password) return 0;
    if (password.length < 8) return 1;
    const hasNum = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (password.length >= 8 && hasNum && hasSpecial) return 3;
    if (password.length >= 8) return 2;
    return 1;
  };

  const strength = getPasswordStrength();

  const handleStep1Continue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg("Please enter your authorized officer name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid official email address.");
      return;
    }

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!orgName.trim()) {
      setErrorMsg("Please enter your legal organization name.");
      return;
    }

    // Determine numeric turnover from bracket
    let turnoverInr = 48000000;
    if (turnoverOption === "under_50l") turnoverInr = 3500000;
    else if (turnoverOption === "50l_2.5cr") turnoverInr = 15000000;
    else if (turnoverOption === "2.5cr_10cr") turnoverInr = 48000000;
    else if (turnoverOption === "10cr_50cr") turnoverInr = 240000000;
    else if (turnoverOption === "above_50cr") turnoverInr = 650000000;

    setIsSubmitting(true);

    const res = await signupWithPassword({
      name: name.trim(),
      email: email.trim(),
      password,
      orgName: orgName.trim(),
      entityType,
      state,
      sector,
      turnoverInr,
      udyamTier: isNgo ? "None" : (hasUdyam ? udyamTier : "None"),
      complianceFlags: {
        hasGstin: !isNgo && hasGstin,
        hasPan: true,
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
      // Guide user straight to discovering their matches!
      router.push("/schemes");
    } else {
      setErrorMsg(res.error || "Enrollment failed. Please verify submitted details.");
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-[680px]">
        
        {/* Top nav */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D8D0BE] mb-6">
          <Link href="/" className="flex items-center gap-2.5 no-underline text-[#22271F]">
            <div className="w-[30px] height-[30px] h-[30px] rounded-full border border-[#5C5648] flex items-center justify-center text-xs font-medium">
              GP
            </div>
            <span className="font-serif text-[17px] font-semibold text-[#22271F] tracking-tight">
              GrantPulse
            </span>
          </Link>

          <Link
            href="/login"
            className="text-[13px] text-[#22271F] hover:text-[#5C5648] flex items-center gap-1.5 px-3 py-1.5 border border-[#C9C0AC] rounded-md transition-colors font-medium bg-transparent"
          >
            <Lock className="w-3.5 h-3.5 text-[#5C5648]" />
            <span>Sign in</span>
          </Link>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {/* Step 1 Pill */}
          <div className="flex items-center gap-2">
            <div
              className={`w-[22px] h-[22px] rounded-full text-xs font-medium flex items-center justify-center transition-all ${
                step === 1
                  ? "bg-[#22271F] text-[#FAF7F0]"
                  : "bg-[#3F6B52] text-white"
              }`}
            >
              {step === 2 ? <Check className="w-3 h-3 stroke-[2.5]" /> : "1"}
            </div>
            <span
              className={`text-[13px] ${
                step === 1 ? "font-medium text-[#22271F]" : "text-[#3F6B52] font-medium"
              }`}
            >
              Officer account
            </span>
          </div>

          {/* Divider line */}
          <div
            className={`flex-1 h-[0.5px] transition-colors ${
              step === 2 ? "bg-[#3F6B52]" : "bg-[#C9C0AC]"
            }`}
          />

          {/* Step 2 Pill */}
          <div className="flex items-center gap-2">
            <div
              className={`w-[22px] h-[22px] rounded-full text-xs font-medium flex items-center justify-center transition-all ${
                step === 2
                  ? "bg-[#22271F] text-[#FAF7F0]"
                  : "border border-[#C9C0AC] text-[#7A7466]"
              }`}
            >
              2
            </div>
            <span
              className={`text-[13px] ${
                step === 2 ? "font-medium text-[#22271F]" : "text-[#7A7466]"
              }`}
            >
              Organization details
            </span>
          </div>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50/80 border border-red-200 text-red-800 text-[13px] rounded-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-[#FAF7F0] border border-[#D8D0BE] rounded-xl p-6 sm:p-7 shadow-xs">
          {step === 1 ? (
            /* STEP 1: OFFICER ACCOUNT */
            <form onSubmit={handleStep1Continue}>
              <p className="text-[13px] text-[#5C5648] mb-1 font-mono">
                Step 1 of 2
              </p>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#22271F] mb-5 tracking-tight">
                Create your officer account
              </h2>

              {/* Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full h-10 px-4 bg-white hover:bg-[#F3EFE6] border border-[#C9C0AC] hover:border-[#22271F] text-[#22271F] rounded-md text-[14px] font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-[0.99] mb-5"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#5C5648]" />
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {/* Divider */}
              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D8D0BE]" />
                </div>
                <span className="relative px-3 bg-[#FAF7F0] text-[11px] font-mono tracking-wider uppercase text-[#7A7466]">
                  or register with official email
                </span>
              </div>

              {/* Authorized officer name */}
              <div className="mb-4">
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Authorized officer name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Devang Mehta"
                  required
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] placeholder:text-[#9C9585] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors"
                />
              </div>

              {/* Official email address */}
              <div className="mb-4">
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Official email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@vidyutmobility.in"
                  required
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] placeholder:text-[#9C9585] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors"
                />
              </div>

              {/* Password */}
              <div className="mb-2">
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] placeholder:text-[#9C9585] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors"
                />
              </div>

              {/* Password strength 3-bar meter */}
              <div className="flex gap-1 mb-4 mt-2">
                <div
                  className={`h-[3px] flex-1 rounded-xs transition-colors duration-200 ${
                    strength >= 1
                      ? strength === 1
                        ? "bg-[#D03B3B]"
                        : strength === 2
                        ? "bg-[#D97706]"
                        : "bg-[#3F6B52]"
                      : "bg-[#DCD5C6]"
                  }`}
                />
                <div
                  className={`h-[3px] flex-1 rounded-xs transition-colors duration-200 ${
                    strength >= 2
                      ? strength === 2
                        ? "bg-[#D97706]"
                        : "bg-[#3F6B52]"
                      : "bg-[#DCD5C6]"
                  }`}
                />
                <div
                  className={`h-[3px] flex-1 rounded-xs transition-colors duration-200 ${
                    strength === 3 ? "bg-[#3F6B52]" : "bg-[#DCD5C6]"
                  }`}
                />
              </div>

              {/* Confirm password */}
              <div className="mb-6">
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] placeholder:text-[#9C9585] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors"
                />
              </div>

              {/* Continue button */}
              <button
                type="submit"
                className="w-full h-10 bg-[#22271F] hover:bg-[#343D31] text-[#FAF7F0] rounded-md text-[14px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STEP 2: ORGANIZATION DETAILS */
            <form onSubmit={handleStep2Submit}>
              <p className="text-[13px] text-[#5C5648] mb-1 font-mono">
                Step 2 of 2
              </p>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#22271F] mb-5 tracking-tight">
                Organization details
              </h2>

              {/* Legal organization name */}
              <div className="mb-4">
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Legal organization name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Vidyut Micro Mobility Pvt Ltd"
                  required
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] placeholder:text-[#9C9585] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors"
                />
              </div>

              {/* Entity classification */}
              <div className="mb-4">
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Entity classification
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as EntityType)}
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] cursor-pointer"
                >
                  {ENTITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Operating state */}
              <div className="mb-4">
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Principal operating state
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] cursor-pointer"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Sector */}
              <div className="mb-4">
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Primary grant focus sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] cursor-pointer"
                >
                  {SECTORS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Annual Turnover Bracket */}
              <div className="mb-4">
                <label className="block text-[13px] text-[#5C5648] mb-1.5 font-medium">
                  Annual turnover bracket (FY 2023-24)
                </label>
                <select
                  value={turnoverOption}
                  onChange={(e) => setTurnoverOption(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] cursor-pointer"
                >
                  <option value="under_50l">Under ₹50 Lakhs (Early stage / Micro)</option>
                  <option value="50l_2.5cr">₹50 Lakhs to ₹2.5 Crores</option>
                  <option value="2.5cr_10cr">₹2.5 Crores to ₹10 Crores</option>
                  <option value="10cr_50cr">₹10 Crores to ₹50 Crores</option>
                  <option value="above_50cr">Above ₹50 Crores (Large Corporate)</option>
                </select>
              </div>

              {/* Regulatory Accreditations (Checkboxes) */}
              <div className="mb-6 p-3.5 bg-[#EAE4D5] rounded-lg border border-[#C9C0AC]/70">
                <div className="text-[12px] font-mono uppercase tracking-wider text-[#5C5648] font-bold mb-2">
                  Active registrations &amp; compliance
                </div>

                {isNgo ? (
                  <div className="space-y-2 text-[13px] text-[#22271F]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={has12A80G}
                        onChange={(e) => setHas12A80G(e.target.checked)}
                        className="rounded border-[#C9C0AC] text-[#22271F] focus:ring-0"
                      />
                      <span>12A / 80G Tax Exemption (Form 10AC)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasNgoDarpan}
                        onChange={(e) => setHasNgoDarpan(e.target.checked)}
                        className="rounded border-[#C9C0AC] text-[#22271F] focus:ring-0"
                      />
                      <span>NITI Aayog NGO-Darpan Unique ID</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasCsr1}
                        onChange={(e) => setHasCsr1(e.target.checked)}
                        className="rounded border-[#C9C0AC] text-[#22271F] focus:ring-0"
                      />
                      <span>MCA CSR-1 Registration for Corporate Grants</span>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-2 text-[13px] text-[#22271F]">
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasUdyam}
                          onChange={(e) => setHasUdyam(e.target.checked)}
                          className="rounded border-[#C9C0AC] text-[#22271F] focus:ring-0"
                        />
                        <span>Udyam MSME Registration</span>
                      </label>
                      {hasUdyam && (
                        <select
                          value={udyamTier}
                          onChange={(e) => setUdyamTier(e.target.value as any)}
                          className="text-xs px-2 py-1 bg-white border border-[#C9C0AC] rounded text-[#22271F]"
                        >
                          <option value="Micro">Micro</option>
                          <option value="Small">Small</option>
                          <option value="Medium">Medium</option>
                        </select>
                      )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasGstin}
                        onChange={(e) => setHasGstin(e.target.checked)}
                        className="rounded border-[#C9C0AC] text-[#22271F] focus:ring-0"
                      />
                      <span>GSTIN Active Registration</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="h-10 px-4 bg-transparent border border-[#C9C0AC] hover:bg-[#EAE4D5] text-[#22271F] rounded-md text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 bg-[#22271F] hover:bg-[#343D31] text-[#FAF7F0] rounded-md text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C97A67]" />
                      <span>Completing registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Subtitle */}
        <p className="text-[12px] text-[#7A7466] text-center mt-4">
          {step === 1
            ? "You'll add your organization's details next."
            : "By registering, your organization ledger and AST reasoner are initialized."}
        </p>

      </div>
    </div>
  );
}
