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
import { SEED_ORGANIZATIONS } from "../data/seed-organizations";
import { SEED_SCHEMES } from "../data/seed-schemes";
import { SEED_DOCUMENTS } from "../data/seed-documents";
import { SEED_APPLICATIONS, SEED_EXPENSES } from "../data/seed-applications";
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
  addDocument: (docType: DocumentType, fileName: string, rawOcrText?: string) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>(SEED_ORGANIZATIONS);
  const [currentOrgId, setCurrentOrgId] = useState<string>(SEED_ORGANIZATIONS[1].id); // Vidyut Micro Mobility
  const [schemes, setSchemes] = useState<Scheme[]>(SEED_SCHEMES);
  const [documents, setDocuments] = useState<UserDocument[]>(SEED_DOCUMENTS);
  const [applications, setApplications] = useState<Application[]>(SEED_APPLICATIONS);
  const [expenses, setExpenses] = useState<GrantExpense[]>(SEED_EXPENSES);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isSupabaseConfigured);

  // Hydrate from Supabase on client mount if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    async function hydrateFromSupabase() {
      try {
        const [orgs, dbSchemes, docs, apps, exps] = await Promise.all([
          fetchOrganizationsFromDb(),
          fetchSchemesFromDb(),
          fetchUserDocumentsFromDb(),
          fetchApplicationsFromDb(),
          fetchGrantExpensesFromDb()
        ]);

        if (orgs.length > 0) setOrganizations(orgs);
        if (dbSchemes.length > 0) setSchemes(dbSchemes);
        if (docs.length > 0) setDocuments(docs);
        if (apps.length > 0) setApplications(apps);
        if (exps.length > 0) setExpenses(exps);
        setIsCloudConnected(true);
      } catch (e) {
        console.warn("Could not hydrate from Supabase, using seed defaults:", e);
      }
    }

    hydrateFromSupabase();
  }, []);

  const currentOrg = organizations.find(o => o.id === currentOrgId) || organizations[0];

  const addOrganization = (org: Organization) => {
    setOrganizations(prev => [org, ...prev]);
    setCurrentOrgId(org.id);
    if (isSupabaseConfigured) {
      insertOrganizationToDb(org);
    }
  };

  const addScheme = (newScheme: Scheme) => {
    setSchemes(prev => [newScheme, ...prev]);
    if (isSupabaseConfigured) {
      insertSchemesToDb([newScheme]);
    }
  };

  const batchAddSchemes = (newSchemes: Scheme[]) => {
    setSchemes(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const filteredNew = newSchemes.filter(s => !existingIds.has(s.id));
      return [...filteredNew, ...prev];
    });
    if (isSupabaseConfigured) {
      insertSchemesToDb(newSchemes);
    }
  };

  const addDocument = (docType: DocumentType, fileName: string, rawOcrText: string = "") => {
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

    setDocuments(prev => [newDoc, ...prev]);
    if (isSupabaseConfigured) {
      insertUserDocumentToDb(newDoc);
    }
  };

  const getOrgEvaluation = (schemeId: string): EvaluationResult | null => {
    const scheme = schemes.find(s => s.id === schemeId);
    if (!scheme) return null;
    return evaluateSchemeEligibility(scheme.eligibilityAst, currentOrg);
  };

  const getOrgDocumentReadiness = (schemeId: string) => {
    const scheme = schemes.find(s => s.id === schemeId);
    if (!scheme) {
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

    setApplications(prev => prev.map(a => {
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
    }));

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

    setApplications(prev => [newApp, ...prev]);
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
    setExpenses(prev => [newExp, ...prev]);
    if (isSupabaseConfigured) {
      insertGrantExpenseToDb(newExp);
    }
  };

  return (
    <AppContext.Provider
      value={{
        organizations,
        currentOrg,
        setCurrentOrgId,
        addOrganization,
        schemes,
        addScheme,
        batchAddSchemes,
        documents,
        addDocument,
        applications,
        moveApplicationState,
        createNewApplication,
        expenses,
        addExpense,
        getOrgEvaluation,
        getOrgDocumentReadiness,
        isCloudConnected
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
