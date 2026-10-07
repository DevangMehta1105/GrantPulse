"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid official email address.");
      return;
    }

    if (!password || password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);

    const res = await loginWithPassword(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      router.push("/pipeline");
    } else {
      setErrorMsg(res.error || "Authentication clearance failed. Please verify credentials.");
    }
  };

  return (
    <div className="min-h-[85vh] py-10 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-[540px]">
        
        {/* Top nav */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D8D0BE] mb-6">
          <Link href="/" className="flex items-center gap-2.5 no-underline text-[#22271F]">
            <div className="w-[30px] h-[30px] rounded-full border border-[#5C5648] flex items-center justify-center text-xs font-medium">
              GP
            </div>
            <span className="font-serif text-[17px] font-semibold text-[#22271F] tracking-tight">
              GrantPulse
            </span>
          </Link>

          <Link
            href="/signup"
            className="text-[13px] text-[#22271F] hover:text-[#5C5648] flex items-center gap-1.5 px-3 py-1.5 border border-[#C9C0AC] rounded-md transition-colors font-medium bg-transparent"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#5C5648]" />
            <span>Create account</span>
          </Link>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50/80 border border-red-200 text-red-800 text-[13px] rounded-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-[#FAF7F0] border border-[#D8D0BE] rounded-xl p-6 sm:p-7 shadow-xs">
          <p className="text-[13px] text-[#5C5648] mb-1 font-mono">
            Welcome back
          </p>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#22271F] mb-5 tracking-tight">
            Sign in to your officer account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Official email address */}
            <div>
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
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] text-[#5C5648] font-medium">
                  Password
                </label>
                <span className="text-[11px] text-[#7A7466]">
                  Minimum 8 characters
                </span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your security password"
                required
                className="w-full h-10 px-3 py-2 text-[14px] bg-white border border-[#C9C0AC] rounded-md text-[#22271F] placeholder:text-[#9C9585] focus:outline-none focus:border-[#22271F] focus:ring-1 focus:ring-[#22271F] transition-colors"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-[#22271F] hover:bg-[#343D31] text-[#FAF7F0] rounded-md text-[14px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#C97A67]" />
                    <span>Verifying credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Subtitle */}
        <p className="text-[12px] text-[#7A7466] text-center mt-4">
          Don&apos;t have an officer account?{" "}
          <Link
            href="/signup"
            className="text-[#22271F] font-medium hover:underline inline-flex items-center"
          >
            Create an account
          </Link>
        </p>

      </div>
    </div>
  );
}
