"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useApp } from "./AppContext";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "msme_founder" | "ngo_trustee" | "evaluator" | "compliance_officer";
  orgId: string;
  orgName: string;
  entityType: string;
  avatarInitials: string;
}

const DEMO_PERSONAS: Record<string, AuthUser> = {
  msme: {
    id: "usr-devang-01",
    email: "founder@vidyutmobility.in",
    name: "Devang Mehta",
    role: "msme_founder",
    orgId: "org-vidyut-ev",
    orgName: "Vidyut Micro Mobility Pvt Ltd",
    entityType: "Private Limited",
    avatarInitials: "DM"
  },
  ngo: {
    id: "usr-priya-02",
    email: "director@arogyatrust.org",
    name: "Dr. Priya Sharma",
    role: "ngo_trustee",
    orgId: "org-arogya-trust",
    orgName: "Arogya Rural Healthcare & Water Trust",
    entityType: "Trust",
    avatarInitials: "PS"
  },
  evaluator: {
    id: "usr-eval-03",
    email: "officer@momsme.gov.in",
    name: "Rajesh Varma, IES",
    role: "evaluator",
    orgId: "org-vidyut-ev",
    orgName: "Ministry of MSME / DST Evaluation Desk",
    entityType: "Ministry Desk",
    avatarInitials: "RV"
  }
};

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithPassword: (params: {
    name: string;
    email: string;
    password: string;
    orgName: string;
    entityType: string;
    state: string;
  }) => Promise<{ success: boolean; error?: string }>;
  quickLoginAs: (persona: "msme" | "ngo" | "evaluator") => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEMO_PERSONAS.msme);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setCurrentOrgId } = useApp();

  useEffect(() => {
    // Check Supabase session if configured
    const supabase = getBrowserSupabase();
    if (supabase && isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || "user@grantpulse.in";
          const meta = session.user.user_metadata || {};
          const initials = (meta.name || email).slice(0, 2).toUpperCase();

          setUser({
            id: session.user.id,
            email,
            name: meta.name || email.split("@")[0],
            role: meta.role || "msme_founder",
            orgId: meta.orgId || "org-vidyut-ev",
            orgName: meta.orgName || "Enrolled Organization",
            entityType: meta.entityType || "Private Limited",
            avatarInitials: initials
          });
        }
        setIsLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = session.user.email || "user@grantpulse.in";
          const meta = session.user.user_metadata || {};
          const initials = (meta.name || email).slice(0, 2).toUpperCase();

          setUser({
            id: session.user.id,
            email,
            name: meta.name || email.split("@")[0],
            role: meta.role || "msme_founder",
            orgId: meta.orgId || "org-vidyut-ev",
            orgName: meta.orgName || "Enrolled Organization",
            entityType: meta.entityType || "Private Limited",
            avatarInitials: initials
          });
        } else {
          // If logged out from Supabase, retain demo persona or null
          setUser(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // Local demo mode default
      const savedUser = localStorage.getItem("gp_auth_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(DEMO_PERSONAS.msme);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const loginWithPassword = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getBrowserSupabase();

    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const meta = data.user.user_metadata || {};
        const initials = (meta.name || email).slice(0, 2).toUpperCase();
        const authed: AuthUser = {
          id: data.user.id,
          email: data.user.email || email,
          name: meta.name || email.split("@")[0],
          role: meta.role || "msme_founder",
          orgId: meta.orgId || "org-vidyut-ev",
          orgName: meta.orgName || "Enrolled Organization",
          entityType: meta.entityType || "Private Limited",
          avatarInitials: initials
        };
        setUser(authed);
        setCurrentOrgId(authed.orgId);
      }
      setIsLoading(false);
      return { success: true };
    }

    // Demo Mode Verification
    const isNgo = email.toLowerCase().includes("arogya") || email.toLowerCase().includes("trust") || email.toLowerCase().includes("ngo");
    const isEvaluator = email.toLowerCase().includes("gov") || email.toLowerCase().includes("officer");
    const persona = isNgo ? DEMO_PERSONAS.ngo : isEvaluator ? DEMO_PERSONAS.evaluator : DEMO_PERSONAS.msme;

    const loggedInUser: AuthUser = {
      ...persona,
      email: email.trim(),
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    };

    setUser(loggedInUser);
    setCurrentOrgId(loggedInUser.orgId);
    localStorage.setItem("gp_auth_user", JSON.stringify(loggedInUser));
    setIsLoading(false);
    return { success: true };
  };

  const signupWithPassword = async (params: {
    name: string;
    email: string;
    password: string;
    orgName: string;
    entityType: string;
    state: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getBrowserSupabase();

    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            name: params.name,
            orgName: params.orgName,
            entityType: params.entityType,
            state: params.state,
            role: params.entityType === "Trust" || params.entityType === "Society" || params.entityType === "Section 8" ? "ngo_trustee" : "msme_founder"
          }
        }
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const initials = params.name.slice(0, 2).toUpperCase();
        const authed: AuthUser = {
          id: data.user.id,
          email: params.email,
          name: params.name,
          role: params.entityType === "Trust" || params.entityType === "Society" ? "ngo_trustee" : "msme_founder",
          orgId: `org-${Date.now().toString().slice(-4)}`,
          orgName: params.orgName,
          entityType: params.entityType,
          avatarInitials: initials
        };
        setUser(authed);
      }
      setIsLoading(false);
      return { success: true };
    }

    // Demo Mode Sign up
    const newOrgId = `org-${Date.now().toString().slice(-4)}`;
    const initials = params.name.slice(0, 2).toUpperCase();
    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      email: params.email,
      name: params.name,
      role: params.entityType === "Trust" || params.entityType === "Society" ? "ngo_trustee" : "msme_founder",
      orgId: newOrgId,
      orgName: params.orgName,
      entityType: params.entityType,
      avatarInitials: initials
    };

    setUser(newUser);
    localStorage.setItem("gp_auth_user", JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const quickLoginAs = (personaKey: "msme" | "ngo" | "evaluator") => {
    const persona = DEMO_PERSONAS[personaKey];
    setUser(persona);
    setCurrentOrgId(persona.orgId);
    localStorage.setItem("gp_auth_user", JSON.stringify(persona));
  };

  const logout = async () => {
    const supabase = getBrowserSupabase();
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem("gp_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithPassword,
        signupWithPassword,
        quickLoginAs,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
