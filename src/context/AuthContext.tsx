"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useApp } from "./AppContext";
import { EntityType, Organization, UdyamTier, ComplianceFlags } from "@/lib/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "msme_founder" | "ngo_trustee" | "evaluator" | "compliance_officer";
  orgId: string;
  orgName: string;
  entityType: EntityType;
  avatarInitials: string;
  onboardingCompleted?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signupWithPassword: (params: {
    name: string;
    email: string;
    password: string;
    orgName: string;
    entityType: EntityType;
    state: string;
    sector?: string;
    turnoverInr?: number;
    udyamTier?: UdyamTier;
    complianceFlags?: Partial<ComplianceFlags>;
  }) => Promise<{ success: boolean; error?: string }>;
  completeOnboarding: (params: {
    orgName: string;
    entityType: EntityType;
    state: string;
    sector?: string;
    turnoverInr?: number;
    udyamTier?: UdyamTier;
    complianceFlags?: Partial<ComplianceFlags>;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setCurrentOrgId, addOrganization } = useApp();

  const extractUserFromSession = (sessionUser: any): AuthUser => {
    const email = sessionUser.email || "";
    const meta = sessionUser.user_metadata || {};
    const displayName = meta.full_name || meta.name || email.split("@")[0] || "Officer";
    const initials = displayName.slice(0, 2).toUpperCase();
    const entityType = (meta.entityType as EntityType) || "Private Limited";
    const isNgo = entityType === "Trust" || entityType === "Society";
    const role = meta.role || (isNgo ? "ngo_trustee" : "msme_founder");
    const orgId = meta.orgId || `org-${sessionUser.id.slice(0, 8)}`;
    const orgName = meta.orgName || `${displayName}'s Enterprise`;

    const onboardingCompleted = meta.onboardingCompleted === true;

    return {
      id: sessionUser.id,
      email,
      name: displayName,
      role,
      orgId,
      orgName,
      entityType,
      avatarInitials: initials,
      onboardingCompleted
    };
  };

  useEffect(() => {
    // 1. Check Supabase session if cloud connection is active
    const supabase = getBrowserSupabase();
    if (supabase && isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const authUser = extractUserFromSession(session.user);
          setUser(authUser);
          localStorage.setItem("gp_auth_user", JSON.stringify(authUser));
        } else {
          // Session expired or not found — clear stale local cache
          localStorage.removeItem("gp_auth_user");
          setUser(null);
        }
        setIsLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const authUser = extractUserFromSession(session.user);
          setUser(authUser);
          localStorage.setItem("gp_auth_user", JSON.stringify(authUser));
        } else {
          setUser(null);
          localStorage.removeItem("gp_auth_user");
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    } else {
      // 2. Local storage session check
      const savedUser = localStorage.getItem("gp_auth_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const loginWithPassword = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setIsLoading(false);
      return { success: false, error: "Please enter a valid official email address." };
    }

    if (!password || password.length < 8) {
      setIsLoading(false);
      return { success: false, error: "Password must be at least 8 characters." };
    }

    const supabase = getBrowserSupabase();

    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        const meta = data.user.user_metadata || {};
        const initials = (meta.name || cleanEmail).slice(0, 2).toUpperCase();
        const authed: AuthUser = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          name: meta.name || cleanEmail.split("@")[0].replace(/[._]/g, " "),
          role: meta.role || (meta.entityType === "Trust" || meta.entityType === "Society" ? "ngo_trustee" : "msme_founder"),
          orgId: meta.orgId || `org-${data.user.id.slice(0, 8)}`,
          orgName: meta.orgName || "Enrolled Organization",
          entityType: (meta.entityType as EntityType) || "Private Limited",
          avatarInitials: initials
        };

        setUser(authed);
        setCurrentOrgId(authed.orgId);
        localStorage.setItem("gp_auth_user", JSON.stringify(authed));
      }

      setIsLoading(false);
      return { success: true };
    }

    // Local / Offline standard verification
    // Generate authorized officer profile from credentials
    const isNgo = cleanEmail.includes("trust") || cleanEmail.includes("ngo") || cleanEmail.includes("society");
    const isEvaluator = cleanEmail.includes("gov") || cleanEmail.includes("officer");
    const role = isEvaluator ? "evaluator" : isNgo ? "ngo_trustee" : "msme_founder";
    const entityType: EntityType = isNgo ? "Trust" : "Private Limited";
    const orgId = `org-${cleanEmail.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`;
    const officerName = cleanEmail.split("@")[0]
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    const orgName = `${officerName}'s ${isNgo ? "Trust" : "Enterprises"}`;

    const initials = officerName.slice(0, 2).toUpperCase();

    const loggedInUser: AuthUser = {
      id: `usr-${Date.now().toString(36)}`,
      email: cleanEmail,
      name: officerName || "Authorized Officer",
      role,
      orgId,
      orgName,
      entityType,
      avatarInitials: initials
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
    entityType: EntityType;
    state: string;
    sector?: string;
    turnoverInr?: number;
    udyamTier?: UdyamTier;
    complianceFlags?: Partial<ComplianceFlags>;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const cleanEmail = params.email.trim().toLowerCase();

    if (!params.name.trim()) {
      setIsLoading(false);
      return { success: false, error: "Authorized officer name is required." };
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setIsLoading(false);
      return { success: false, error: "Please enter a valid official email address." };
    }

    if (params.password.length < 8) {
      setIsLoading(false);
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    if (!params.orgName.trim()) {
      setIsLoading(false);
      return { success: false, error: "Organization name is required." };
    }

    const newOrgId = `org-${Date.now().toString(36)}`;
    const initials = params.name.trim().slice(0, 2).toUpperCase();
    const isNgo = params.entityType === "Trust" || params.entityType === "Society" || params.entityType === "Section 8";
    const role = isNgo ? "ngo_trustee" : "msme_founder";

    const supabase = getBrowserSupabase();

    if (supabase && isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: params.password,
        options: {
          data: {
            name: params.name.trim(),
            orgId: newOrgId,
            orgName: params.orgName.trim(),
            entityType: params.entityType,
            state: params.state,
            sector: params.sector || "CleanTech & EV",
            role,
            onboardingCompleted: true
          }
        }
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      const authed: AuthUser = {
        id: data.user?.id || `usr-${Date.now().toString(36)}`,
        email: cleanEmail,
        name: params.name.trim(),
        role,
        orgId: newOrgId,
        orgName: params.orgName.trim(),
        entityType: params.entityType,
        avatarInitials: initials,
        onboardingCompleted: true
      };

      // Register new organization into application store
      const defaultCompliance: ComplianceFlags = {
        hasGstin: !isNgo,
        hasPan: true,
        hasUdyam: !isNgo,
        has12A: isNgo,
        has80G: isNgo,
        hasNgoDarpan: isNgo,
        hasCsr1: isNgo,
        hasFcra: false,
        ...params.complianceFlags
      };

      const newOrganization: Organization = {
        id: newOrgId,
        name: params.orgName.trim(),
        entityType: params.entityType,
        turnoverInr: params.turnoverInr !== undefined ? params.turnoverInr : (isNgo ? 8500000 : 48000000),
        incorporationDate: new Date().toISOString().split("T")[0],
        yearsOfOperation: 3,
        udyamTier: params.udyamTier || (isNgo ? "None" : "Small"),
        state: params.state,
        sector: params.sector || "CleanTech & EV",
        complianceFlags: defaultCompliance,
        missionDescription: `${params.orgName.trim()} operating in ${params.sector || "Innovation & Technology"} within ${params.state}.`,
        contactEmail: cleanEmail,
        created_at: new Date().toISOString()
      };

      addOrganization(newOrganization);
      setUser(authed);
      localStorage.setItem("gp_auth_user", JSON.stringify(authed));
      setIsLoading(false);
      return { success: true };
    }

    // Local / Offline Sign up
    const defaultComplianceLocal: ComplianceFlags = {
      hasGstin: !isNgo,
      hasPan: true,
      hasUdyam: !isNgo,
      has12A: isNgo,
      has80G: isNgo,
      hasNgoDarpan: isNgo,
      hasCsr1: isNgo,
      hasFcra: false,
      ...params.complianceFlags
    };

    const newOrganization: Organization = {
      id: newOrgId,
      name: params.orgName.trim(),
      entityType: params.entityType,
      turnoverInr: params.turnoverInr !== undefined ? params.turnoverInr : (isNgo ? 8500000 : 48000000),
      incorporationDate: new Date().toISOString().split("T")[0],
      yearsOfOperation: 3,
      udyamTier: params.udyamTier || (isNgo ? "None" : "Small"),
      state: params.state,
      sector: params.sector || "CleanTech & EV",
      complianceFlags: defaultComplianceLocal,
      missionDescription: `${params.orgName.trim()} operating in ${params.sector || "Innovation & Technology"} within ${params.state}.`,
      contactEmail: cleanEmail,
      created_at: new Date().toISOString()
    };

    const newUser: AuthUser = {
      id: `usr-${Date.now().toString(36)}`,
      email: cleanEmail,
      name: params.name.trim(),
      role,
      orgId: newOrgId,
      orgName: params.orgName.trim(),
      entityType: params.entityType,
      avatarInitials: initials,
      onboardingCompleted: true
    };

    addOrganization(newOrganization);
    setUser(newUser);
    localStorage.setItem("gp_auth_user", JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    const supabase = getBrowserSupabase();
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, error: "Supabase authentication client is not configured." };
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent"
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to initialize Google OAuth." };
    }
  };

  const completeOnboarding = async (params: {
    orgName: string;
    entityType: EntityType;
    state: string;
    sector?: string;
    turnoverInr?: number;
    udyamTier?: UdyamTier;
    complianceFlags?: Partial<ComplianceFlags>;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "No active officer session found." };
    }

    const orgId = user.orgId || `org-${user.id.slice(0, 8)}`;
    const isNgo = params.entityType === "Trust" || params.entityType === "Society" || params.entityType === "Section 8";
    const role = isNgo ? "ngo_trustee" : "msme_founder";

    const updatedUser: AuthUser = {
      ...user,
      orgId,
      orgName: params.orgName.trim(),
      entityType: params.entityType,
      role,
      onboardingCompleted: true
    };

    const newOrganization: Organization = {
      id: orgId,
      name: params.orgName.trim(),
      entityType: params.entityType,
      turnoverInr: params.turnoverInr !== undefined ? params.turnoverInr : (isNgo ? 8500000 : 48000000),
      incorporationDate: new Date().toISOString().split("T")[0],
      yearsOfOperation: 3,
      udyamTier: params.udyamTier || (isNgo ? "None" : "Small"),
      state: params.state,
      sector: params.sector || "CleanTech & EV Mobility",
      complianceFlags: {
        hasPan: true,
        hasGstin: !isNgo && !!params.complianceFlags?.hasGstin,
        hasUdyam: !isNgo && !!params.complianceFlags?.hasUdyam,
        has12A: isNgo && !!params.complianceFlags?.has12A,
        has80G: isNgo && !!params.complianceFlags?.has80G,
        hasNgoDarpan: isNgo && !!params.complianceFlags?.hasNgoDarpan,
        hasCsr1: isNgo && !!params.complianceFlags?.hasCsr1,
        hasFcra: false,
        ...params.complianceFlags
      },
      missionDescription: `${params.orgName.trim()} operating in ${params.sector || "Innovation & Technology"} within ${params.state}.`,
      contactEmail: user.email,
      created_at: new Date().toISOString()
    };

    addOrganization(newOrganization);
    setCurrentOrgId(orgId);
    setUser(updatedUser);
    localStorage.setItem("gp_auth_user", JSON.stringify(updatedUser));

    const supabase = getBrowserSupabase();
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.updateUser({
          data: {
            onboardingCompleted: true,
            orgId,
            orgName: params.orgName.trim(),
            entityType: params.entityType,
            role,
            state: params.state,
            sector: params.sector
          }
        });
      } catch (err) {
        console.warn("Could not sync onboarding state to Supabase user metadata:", err);
      }
    }

    return { success: true };
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
        loginWithGoogle,
        signupWithPassword,
        completeOnboarding,
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
