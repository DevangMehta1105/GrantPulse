"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useApp } from "@/context/AppContext";
import { useAuth, AuthUser } from "@/context/AuthContext";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Organization } from "@/lib/types";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { addOrganization, organizations, setCurrentOrgId } = useApp();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [statusMessage, setStatusMessage] = useState<string>("Verifying Google credentials...");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    async function handleAuthCallback() {
      const supabase = getBrowserSupabase();
      if (!supabase || !isSupabaseConfigured) {
        setStatus("error");
        setErrorMessage("Supabase cloud client is not configured.");
        return;
      }

      try {
        // Exchange token from URL
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus("error");
          setErrorMessage(error.message);
          return;
        }

        const session = data?.session;
        if (!session?.user) {
          // If session is not ready yet, listen for auth state change
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (newSession?.user) {
              await processUserSession(newSession.user);
            }
          });
          return () => {
            authListener.subscription.unsubscribe();
          };
        } else {
          await processUserSession(session.user);
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMessage(err.message || "An unexpected error occurred during Google sign in.");
      }
    }

    async function processUserSession(user: any) {
      const email = user.email || "";
      const meta = user.user_metadata || {};
      const displayName = meta.full_name || meta.name || email.split("@")[0] || "Officer";
      const initials = displayName.slice(0, 2).toUpperCase();

      // Check if this user is existing or brand new:
      // 1. Has metadata flag onboardingCompleted === true
      // 2. Or has an existing recognized organization in organizations list
      const hasOnboardingFlag = meta.onboardingCompleted === true;
      const matchedOrg = organizations.find(o => 
        (meta.orgId && o.id === meta.orgId) ||
        (o.contactEmail && o.contactEmail.toLowerCase() === email.toLowerCase()) ||
        o.id === `org-${user.id.slice(0, 8)}`
      );

      const isExistingUser = hasOnboardingFlag && !!matchedOrg;

      if (isExistingUser) {
        const orgId = matchedOrg ? matchedOrg.id : (meta.orgId || `org-${user.id.slice(0, 8)}`);
        const orgName = matchedOrg ? matchedOrg.name : (meta.orgName || `${displayName}'s Enterprise`);
        const entityType = matchedOrg ? matchedOrg.entityType : "Private Limited";
        const isNgo = entityType === "Trust" || entityType === "Society" || entityType === "Section 8";
        const role = meta.role || (isNgo ? "ngo_trustee" : "msme_founder");

        const authUser: AuthUser = {
          id: user.id,
          email,
          name: displayName,
          role,
          orgId,
          orgName,
          entityType,
          avatarInitials: initials,
          onboardingCompleted: true
        };

        if (matchedOrg) {
          setCurrentOrgId(matchedOrg.id);
        }
        localStorage.setItem("gp_auth_user", JSON.stringify(authUser));
        setStatusMessage("Existing officer clearance verified. Directing to pipeline...");
        setStatus("success");

        setTimeout(() => {
          router.replace("/pipeline");
        }, 800);
      } else {
        // First-time Google user: Do NOT create fake organization data!
        // Direct them to the onboarding questionnaire so they set real details.
        const defaultOrgId = `org-${user.id.slice(0, 8)}`;
        const authUser: AuthUser = {
          id: user.id,
          email,
          name: displayName,
          role: "msme_founder",
          orgId: defaultOrgId,
          orgName: `${displayName}'s Enterprise`,
          entityType: "Private Limited",
          avatarInitials: initials,
          onboardingCompleted: false
        };

        localStorage.setItem("gp_auth_user", JSON.stringify(authUser));
        setStatusMessage("First-time Google Sign-In detected! Directing to organization profile questionnaire...");
        setStatus("success");

        setTimeout(() => {
          router.replace("/onboarding");
        }, 800);
      }
    }

    handleAuthCallback();
  }, [router, addOrganization, organizations, setCurrentOrgId]);

  return (
    <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4 font-sans">
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full border border-[var(--rule)] flex items-center justify-center mx-auto text-sm font-serif font-bold text-[var(--ink)]">
          GP
        </div>

        {status === "processing" && (
          <div className="space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--stamp)] mx-auto" />
            <h2 className="text-lg font-serif font-bold text-[var(--ink)]">
              Verifying Google Credentials...
            </h2>
            <p className="text-xs font-mono text-[var(--ink-soft)]">
              Establishing cryptographically secured clearance with Supabase Auth...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <CheckCircle2 className="w-6 h-6 text-[var(--verified)] mx-auto" />
            <h2 className="text-lg font-serif font-bold text-[var(--ink)]">
              Authentication Approved
            </h2>
            <p className="text-xs font-mono text-[var(--ink-soft)]">
              {statusMessage}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3">
            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
            <h2 className="text-lg font-serif font-bold text-red-800">
              Authentication Failed
            </h2>
            <p className="text-xs font-mono text-red-700">
              {errorMessage || "Could not complete Google authentication."}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="px-4 py-2 bg-[var(--ink)] text-[var(--paper)] rounded text-xs font-mono font-bold inline-block"
              >
                Return to Officer Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
