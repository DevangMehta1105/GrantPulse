"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  Organization, 
  Scheme, 
  UserDocument, 
  Application, 
  ApplicationState, 
  GrantExpense, 
  EvaluationResult,
  DocumentType
} from "../lib/types";
import { evaluateSchemeEligibility } from "../lib/ast-engine/evaluator";
import { createTransitionLog, canTransition } from "../lib/fsm/state-machine";
import { validateDocumentOcr, calculateDocumentReadiness } from "../lib/ocr/validator";
import { isSupabaseConfigured } from "../lib/supabase/client";
import {
  fetchOrganizationsFromDb,
  fetchSchemesFromDb,
  fetchUserDocumentsFromDb,
  fetchApplicationsFromDb,
  fetchGrantExpensesFromDb,
  insertOrganizationToDb,
  insertSchemesToDb,
  insertUserDocumentToDb,
  deleteUserDocumentFromDb,
  saveApplicationToDb,
  insertGrantExpenseToDb
} from "../lib/supabase/service";

interface AppContextType {
  organizations: Organization[];
  currentOrg: Organization;
  setCurrentOrgId: (id: string) => void;
  addOrganization: (org: Organization) => void;
  schemes: Scheme[];
  addScheme: (scheme: Scheme) => void;
  batchAddSchemes: (newSchemes: Scheme[]) => void;
  documents: UserDocument[];
  addDocument: (docType: DocumentType, fileName: string, rawOcrText?: string) => { success: boolean; document: UserDocument; error?: string };
  deleteDocument: (docId: string) => void;
  applications: Application[];
  moveApplicationState: (
    appId: string, 
    targetState: ApplicationState, 
    actionNote: string, 
    externalAppId?: string
  ) => Promise<{ success: boolean; error?: string }>;
  createNewApplication: (schemeId: string, requestedAmount: number) => Promise<Application>;
  expenses: GrantExpense[];
  addExpense: (expense: Omit<GrantExpense, "id" | "timestamp">) => void;
  getOrgEvaluation: (schemeId: string) => EvaluationResult | null;
  getOrgDocumentReadiness: (schemeId: string) => ReturnType<typeof calculateDocumentReadiness>;
  isCloudConnected: boolean;
  isHydrating: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const EMPTY_ORGANIZATION: Organization = {
  id: "",
  name: "No Organization Enrolled",
  entityType: "Private Limited",
  turnoverInr: 0,
  incorporationDate: new Date().toISOString().split("T")[0],
  yearsOfOperation: 0,
  udyamTier: "None",
  state: "National",
  sector: "General",
  complianceFlags: {
    hasGstin: false,
    hasPan: false,
    hasUdyam: false,
    has12A: false,
    has80G: false,
    hasNgoDarpan: false,
    hasFcra: false,
    hasCsr1: false
  },
  missionDescription: "Register your organization to start grant eligibility evaluations.",
  contactEmail: "",
  created_at: new Date().toISOString()
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [expenses, setExpenses] = useState<GrantExpense[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isSupabaseConfigured);
  const [isHydrating, setIsHydrating] = useState<boolean>(true);

  // Initialize immediately from localStorage cache on browser mount, then hydrate fresh from Supabase
  useEffect(() => {
    try {
      const cachedSchemes = localStorage.getItem("grantpulse_schemes");
      if (cachedSchemes) {
        const parsed = JSON.parse(cachedSchemes);
        if (Array.isArray(parsed) && parsed.length > 0) setSchemes(parsed);
      }
      const cachedOrgs = localStorage.getItem("grantpulse_orgs");
      if (cachedOrgs) {
        const parsed = JSON.parse(cachedOrgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrganizations(parsed);
          const savedCurrentOrgId = localStorage.getItem("grantpulse_current_org_id");
          if (savedCurrentOrgId && parsed.some((o: Organization) => o.id === savedCurrentOrgId)) {
            setCurrentOrgId(savedCurrentOrgId);
          } else {
            setCurrentOrgId(parsed[0].id);
          }
        }
      }
      const cachedDocs = localStorage.getItem("grantpulse_docs");
      if (cachedDocs) {
        const parsed = JSON.parse(cachedDocs);
        if (Array.isArray(parsed) && parsed.length > 0) setDocuments(parsed);
      }
      const cachedApps = localStorage.getItem("grantpulse_apps");
      if (cachedApps) {
        const parsed = JSON.parse(cachedApps);
        if (Array.isArray(parsed) && parsed.length > 0) setApplications(parsed);
      }
      const cachedExps = localStorage.getItem("grantpulse_exps");
      if (cachedExps) {
        const parsed = JSON.parse(cachedExps);
        if (Array.isArray(parsed) && parsed.length > 0) setExpenses(parsed);
      }
    } catch (e) {
      console.warn("Could not read from local cache:", e);
    }

    async function hydrateFromSupabase() {
      try {
        const [orgs, dbSchemes, docs, apps, exps] = await Promise.all([
          fetchOrganizationsFromDb(),
          fetchSchemesFromDb(),
          fetchUserDocumentsFromDb(),
          fetchApplicationsFromDb(),
          fetchGrantExpensesFromDb()
        ]);

        if (orgs.length > 0) {
          setOrganizations(orgs);
          try {
            localStorage.setItem("grantpulse_orgs", JSON.stringify(orgs));
          } catch {}
          setCurrentOrgId(prev => {
            const chosen = prev || orgs[0].id;
            try { localStorage.setItem("grantpulse_current_org_id", chosen); } catch {}
            return chosen;
          });
        }

        if (dbSchemes.length > 0) {
          setSchemes(dbSchemes);
          try {
            localStorage.setItem("grantpulse_schemes", JSON.stringify(dbSchemes));
          } catch {}
        }

        if (docs.length > 0) {
          setDocuments(docs);
          try {
            localStorage.setItem("grantpulse_docs", JSON.stringify(docs));
          } catch {}
        }

        if (apps.length > 0) {
          setApplications(apps);
          try {
            localStorage.setItem("grantpulse_apps", JSON.stringify(apps));
          } catch {}
        }

        if (exps.length > 0) {
          setExpenses(exps);
          try {
            localStorage.setItem("grantpulse_exps", JSON.stringify(exps));
          } catch {}
        }

        if (isSupabaseConfigured) {
          setIsCloudConnected(true);
        }
      } catch (e) {
        console.warn("Could not hydrate from Supabase:", e);
      } finally {
        setIsHydrating(false);
      }
    }

    hydrateFromSupabase();
  }, []);

  const currentOrg = organizations.find(o => o.id === currentOrgId) || organizations[0] || EMPTY_ORGANIZATION;

  const handleSetCurrentOrgId = (id: string) => {
    setCurrentOrgId(id);
    try {
      localStorage.setItem("grantpulse_current_org_id", id);
    } catch {}
  };

  const addOrganization = (org: Organization) => {
    setOrganizations(prev => {
      const updated = [org, ...prev];
      try { localStorage.setItem("grantpulse_orgs", JSON.stringify(updated)); } catch {}
      return updated;
    });
    handleSetCurrentOrgId(org.id);
    if (isSupabaseConfigured) {
      insertOrganizationToDb(org);
    }
  };

  const addScheme = (newScheme: Scheme) => {
    setSchemes(prev => {
      const updated = [newScheme, ...prev];
      try { localStorage.setItem("grantpulse_schemes", JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (isSupabaseConfigured) {
      insertSchemesToDb([newScheme]);
    }
  };

  const batchAddSchemes = async (newSchemes: Scheme[]) => {
    setSchemes(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const filteredNew = newSchemes.filter(s => !existingIds.has(s.id));
      const updated = [...filteredNew, ...prev];
      try { localStorage.setItem("grantpulse_schemes", JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (isSupabaseConfigured) {
      await insertSchemesToDb(newSchemes);
    }
  };

  const addDocument = (
    docType: DocumentType, 
    fileName: string, 
    rawOcrText: string = ""
  ): { success: boolean; document: UserDocument; error?: string } => {
    const ocrResult = validateDocumentOcr(docType, rawOcrText);
    const newDoc: UserDocument = {
      id: `doc-${Date.now()}`,
      orgId: currentOrg.id,
      docType,
      fileName,
      fileSize: Math.floor(Math.random() * 400000) + 150000,
      fileUrl: "/docs/user-upload.pdf",
      uploadedAt: new Date().toISOString(),
      verificationStatus: ocrResult.isValid ? "VERIFIED" : "FAILED",
      ocrExtractedData: {
        extractedId: ocrResult.extractedId,
        confidenceScore: ocrResult.confidenceScore,
        rawTextSnippet: rawOcrText.slice(0, 300) || `${docType} certificate text snippet for ${currentOrg.name}`
      },
      validationErrors: ocrResult.errors,
      verifiedAt: ocrResult.isValid ? new Date().toISOString() : undefined
    };

    // Only vault statutory certificates that pass verification
    if (ocrResult.isValid) {
      setDocuments(prev => {
        const updated = [newDoc, ...prev];
        try { localStorage.setItem("grantpulse_docs", JSON.stringify(updated)); } catch {}
        return updated;
      });
      if (isSupabaseConfigured) {
        insertUserDocumentToDb(newDoc);
      }
      return { success: true, document: newDoc };
    } else {
      return { 
        success: false, 
        document: newDoc, 
        error: ocrResult.errors?.join("; ") || `Certificate validation failed for ${docType.replace(/_/g, ' ')}. Expected regulatory pattern was not found in the uploaded file.`
      };
    }
  };

  const deleteDocument = (docId: string) => {
    setDocuments(prev => {
      const updated = prev.filter(d => d.id !== docId);
      try { localStorage.setItem("grantpulse_docs", JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (isSupabaseConfigured) {
      deleteUserDocumentFromDb(docId);
    }
  };

  const getOrgEvaluation = (schemeId: string): EvaluationResult | null => {
    if (!currentOrg || !currentOrg.id) return null;
    const scheme = schemes.find(s => s.id === schemeId);
    if (!scheme) return null;
    return evaluateSchemeEligibility(scheme.eligibilityAst, currentOrg);
  };

  const getOrgDocumentReadiness = (schemeId: string) => {
    const scheme = schemes.find(s => s.id === schemeId);
    if (!scheme || !currentOrg || !currentOrg.id) {
      return { score: 0, mandatoryTotal: 0, mandatoryVerified: 0, missingMandatory: [], verifiedDocs: [] };
    }
    const orgDocs = documents.filter(d => d.orgId === currentOrg.id);
    return calculateDocumentReadiness(scheme.requiredDocuments, orgDocs);
  };

  const moveApplicationState = async (
    appId: string, 
    targetState: ApplicationState, 
    actionNote: string, 
    externalAppId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const app = applications.find(a => a.id === appId);
    if (!app) return { success: false, error: "Application not found" };

    const scheme = schemes.find(s => s.id === app.schemeId);
    const readiness = scheme ? getOrgDocumentReadiness(scheme.id) : undefined;

    const guardCheck = canTransition(app.currentState, targetState, {
      documentReadinessScore: readiness?.score,
      externalAppId: externalAppId || app.externalApplicationId,
      sanctionedAmount: app.sanctionedAmount
    });

    if (!guardCheck.allowed) {
      return { success: false, error: guardCheck.reason };
    }

    const lastLog = app.stateHistory[app.stateHistory.length - 1];
    const prevHash = lastLog ? lastLog.hash : "0000000000000000000000000000000000000000000000000000000000000000";

    const newLog = await createTransitionLog(
      app.currentState,
      targetState,
      "Compliance Officer",
      actionNote || `Transitioned to ${targetState}`,
      prevHash
    );

    let updatedAppObj: Application | null = null;

    setApplications(prev => {
      const updated = prev.map(a => {
        if (a.id === appId) {
          updatedAppObj = {
            ...a,
            currentState: targetState,
            externalApplicationId: externalAppId || a.externalApplicationId,
            updated_at: new Date().toISOString(),
            stateHistory: [...a.stateHistory, newLog]
          };
          return updatedAppObj;
        }
        return a;
      });
      try { localStorage.setItem("grantpulse_apps", JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (isSupabaseConfigured && updatedAppObj) {
      saveApplicationToDb(updatedAppObj);
    }

    return { success: true };
  };

  const createNewApplication = async (schemeId: string, requestedAmount: number): Promise<Application> => {
    const scheme = schemes.find(s => s.id === schemeId);
    const evalResult = getOrgEvaluation(schemeId);

    const genesisLog = await createTransitionLog(
      "Genesis",
      "Discovered",
      "Auto-Discovery Matcher",
      `Discovered scheme "${scheme?.title || schemeId}" with match score ${evalResult?.matchScore || 0}%`,
      "0000000000000000000000000000000000000000000000000000000000000000"
    );

    const newApp: Application = {
      id: `app-${Date.now()}`,
      orgId: currentOrg.id,
      schemeId,
      currentState: "Discovered",
      matchScore: evalResult?.matchScore || 0,
      matchTrace: evalResult?.trace,
      requestedAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      stateHistory: [genesisLog]
    };

    setApplications(prev => {
      const updated = [newApp, ...prev];
      try { localStorage.setItem("grantpulse_apps", JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (isSupabaseConfigured) {
      saveApplicationToDb(newApp);
    }

    return newApp;
  };

  const addExpense = (expense: Omit<GrantExpense, "id" | "timestamp">) => {
    const newExp: GrantExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setExpenses(prev => {
      const updated = [newExp, ...prev];
      try { localStorage.setItem("grantpulse_exps", JSON.stringify(updated)); } catch {}
      return updated;
    });
    if (isSupabaseConfigured) {
      insertGrantExpenseToDb(newExp);
    }
  };

  return (
    <AppContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrgId: handleSetCurrentOrgId,
        addOrganization,
        schemes,
        addScheme,
        batchAddSchemes,
        documents,
        addDocument,
        deleteDocument,
        applications,
        moveApplicationState,
        createNewApplication,
        expenses,
        addExpense,
        getOrgEvaluation,
        getOrgDocumentReadiness,
        isCloudConnected,
        isHydrating
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
