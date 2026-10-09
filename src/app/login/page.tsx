"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserPlus, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPassword, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const redirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      router.push(redirect && redirect.startsWith("/") ? redirect : "/pipeline");
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

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full h-10 px-4 bg-white hover:bg-[#F3EFE6] border border-[#C9C0AC] hover:border-[#22271F] text-[#22271F] rounded-md text-[14px] font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-[0.99]"
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
          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D8D0BE]" />
            </div>
            <span className="relative px-3 bg-[#FAF7F0] text-[11px] font-mono tracking-wider uppercase text-[#7A7466]">
              or official email clearance
            </span>
          </div>

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
