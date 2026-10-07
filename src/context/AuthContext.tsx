"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { useApp } from "./AppContext";
import { EntityType, Organization } from "@/lib/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "msme_founder" | "ngo_trustee" | "evaluator" | "compliance_officer";
  orgId: string;
  orgName: string;
  entityType: EntityType;
  avatarInitials: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signupWithPassword: (params: {
    name: string;
    email: string;
    password: string;
    orgName: string;
    entityType: EntityType;
    state: string;
    sector?: string;
    turnoverInr?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setCurrentOrgId, addOrganization } = useApp();

  useEffect(() => {
    // 1. Check Supabase session if cloud connection is active
    const supabase = getBrowserSupabase();
    if (supabase && isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const email = session.user.email || "";
          const meta = session.user.user_metadata || {};
          const initials = (meta.name || email).slice(0, 2).toUpperCase();

          const authUser: AuthUser = {
            id: session.user.id,
            email,
            name: meta.name || email.split("@")[0],
            role: meta.role || (meta.entityType === "Trust" || meta.entityType === "Society" ? "ngo_trustee" : "msme_founder"),
            orgId: meta.orgId || "org-vidyut-ev",
            orgName: meta.orgName || "Enrolled Entity",
            entityType: (meta.entityType as EntityType) || "Private Limited",
            avatarInitials: initials
          };

          setUser(authUser);
          localStorage.setItem("gp_auth_user", JSON.stringify(authUser));
        } else {
          // Check local persistence
          const savedUser = localStorage.getItem("gp_auth_user");
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              setUser(null);
            }
          }
        }
        setIsLoading(false);
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const email = session.user.email || "";
          const meta = session.user.user_metadata || {};
          const initials = (meta.name || email).slice(0, 2).toUpperCase();

          const authUser: AuthUser = {
            id: session.user.id,
            email,
            name: meta.name || email.split("@")[0],
            role: meta.role || (meta.entityType === "Trust" || meta.entityType === "Society" ? "ngo_trustee" : "msme_founder"),
            orgId: meta.orgId || "org-vidyut-ev",
            orgName: meta.orgName || "Enrolled Entity",
            entityType: (meta.entityType as EntityType) || "Private Limited",
            avatarInitials: initials
          };

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
          orgId: meta.orgId || "org-vidyut-ev",
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
    const orgId = isNgo ? "org-arogya-trust" : "org-vidyut-ev";
    const orgName = isNgo ? "Arogya Rural Healthcare & Water Trust" : "Vidyut Micro Mobility Pvt Ltd";

    const officerName = cleanEmail.split("@")[0]
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

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
            role
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
        avatarInitials: initials
      };

      // Register new organization into application store
      const newOrganization: Organization = {
        id: newOrgId,
        name: params.orgName.trim(),
        entityType: params.entityType,
        turnoverInr: params.turnoverInr || 24000000,
        incorporationDate: new Date().toISOString().split("T")[0],
        yearsOfOperation: 2,
        udyamTier: isNgo ? "None" : "Small",
        state: params.state,
        sector: params.sector || "CleanTech & EV",
        complianceFlags: {
          hasGstin: !isNgo,
          hasPan: true,
          hasUdyam: !isNgo,
          has12A: isNgo,
          has80G: isNgo,
          hasNgoDarpan: isNgo,
          hasCsr1: isNgo,
          hasFcra: false
        },
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
    const newOrganization: Organization = {
      id: newOrgId,
      name: params.orgName.trim(),
      entityType: params.entityType,
      turnoverInr: params.turnoverInr || 24000000,
      incorporationDate: new Date().toISOString().split("T")[0],
      yearsOfOperation: 2,
      udyamTier: isNgo ? "None" : "Small",
      state: params.state,
      sector: params.sector || "CleanTech & EV",
      complianceFlags: {
        hasGstin: !isNgo,
        hasPan: true,
        hasUdyam: !isNgo,
        has12A: isNgo,
        has80G: isNgo,
        hasNgoDarpan: isNgo,
        hasCsr1: isNgo,
        hasFcra: false
      },
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
      avatarInitials: initials
    };

    addOrganization(newOrganization);
    setUser(newUser);
    localStorage.setItem("gp_auth_user", JSON.stringify(newUser));
    setIsLoading(false);
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
        signupWithPassword,
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
