"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DocumentType } from "@/lib/types";
import { INDIAN_REG_REGEXES } from "@/lib/ocr/validator";
import { formatDate } from "@/lib/utils";
import { 
  FileCheck2, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  Eye,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_OCR_TEMPLATES: Record<DocumentType, string> = {
  GSTIN_CERTIFICATE: "Government of India GST REG-06. Registration Certificate. Registration Number: 29AABCV9821K1Z3. Legal Name: VIDYUT MICRO MOBILITY PRIVATE LIMITED. Date of issue: 01/09/2022.",
  PAN_CARD: "INCOME TAX DEPARTMENT GOVT OF INDIA. Permanent Account Number AAACG0567K. Name: VIDYUT MICRO MOBILITY PVT LTD. Date: 19/08/2022.",
  UDYAM_CERTIFICATE: "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES. UDYAM REGISTRATION CERTIFICATE: UDYAM-KR-03-0048192. Name: VIDYUT MICRO MOBILITY PRIVATE LIMITED. Enterprise Type: Micro.",
  '12A_REGISTRATION': "ORDER FOR REGISTRATION UNDER SECTION 12A/12AB OF THE INCOME TAX ACT 1961. Unique Registration Number (URN): AABTA4921KE20214. Date of order: 10/05/2021.",
  '80G_REGISTRATION': "APPROVAL UNDER SECTION 80G(5)(vi) OF THE INCOME TAX ACT 1961. URN: AABTA4921KG20218. Valid from AY 2021-22.",
  NGO_DARPAN_CERTIFICATE: "NITI AAYOG NGO DARPAN PORTAL. Unique Identification Number: DL/2024/0398471. Organization: AROGYA RURAL HEALTHCARE TRUST.",
  CSR1_CERTIFICATE: "MINISTRY OF CORPORATE AFFAIRS. FORM CSR-1 REGISTRATION NUMBER: CSR00049281. Assigned to GreenRoots Agro Foundation.",
  FCRA_CERTIFICATE: "MINISTRY OF HOME AFFAIRS. Foreign Contribution Regulation Act (FCRA) Registration Number: 031420987.",
  AUDITED_FINANCIALS: "INDEPENDENT AUDITOR'S REPORT. We have audited the Balance Sheet and Profit and Loss Statement. Chartered Accountant Membership No 049821.",
  PROJECT_PROPOSAL: "DETAILED PROJECT PROPOSAL FOR GRANT FUNDING. Executive Summary, Technical Objectives, Milestone Budget, and SROI Impact KPIs."
};

export default function DocumentsPage() {
  const { documents, currentOrg, addDocument } = useApp();
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>("GSTIN_CERTIFICATE");
  const [fileNameInput, setFileNameInput] = useState("GSTIN_Cert_Uploaded.pdf");
  const [ocrTextInput, setOcrTextInput] = useState(SAMPLE_OCR_TEMPLATES["GSTIN_CERTIFICATE"]);
  const [isSuccessModal, setIsSuccessModal] = useState(false);

  const orgDocs = documents.filter(d => d.orgId === currentOrg.id);

  const handleDocTypeChange = (type: DocumentType) => {
    setSelectedDocType(type);
    setFileNameInput(`${type.toLowerCase()}_sample.pdf`);
    setOcrTextInput(SAMPLE_OCR_TEMPLATES[type] || "");
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument(selectedDocType, fileNameInput, ocrTextInput);
    setIsSuccessModal(true);
    setTimeout(() => setIsSuccessModal(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pillar D • Hosted OCR & Indian Regulatory Regex Audit</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Document Vault & OCR Verification
        </h1>
        <p className="text-sm text-slate-400">
          Automated OCR regex extraction for GSTIN, PAN, Udyam, 12A/80G, NGO Darpan, CSR-1 & FCRA certificates.
        </p>
      </div>

      {/* Upload and Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Simulator */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-400" />
            Upload Document & Run OCR
          </h2>

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Document Category</label>
              <select
                value={selectedDocType}
                onChange={(e) => handleDocTypeChange(e.target.value as DocumentType)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {Object.keys(INDIAN_REG_REGEXES).map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Rule: {INDIAN_REG_REGEXES[selectedDocType]?.description}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">File Name</label>
              <input
                type="text"
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                OCR Extracted Text Payload (Simulated / Live)
              </label>
              <textarea
                value={ocrTextInput}
                onChange={(e) => setOcrTextInput(e.target.value)}
                rows={4}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-slate-300 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Verify & Add to Vault</span>
            </button>

            {isSuccessModal && (
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Document processed and verified by regex engine!</span>
              </div>
            )}
          </form>
        </div>

        {/* Vault Document Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                Verified Entity Documents ({orgDocs.length})
              </h3>
              <span className="text-xs text-slate-400 font-mono">Vault for {currentOrg.name}</span>
            </div>

            <div className="space-y-3">
              {orgDocs.map(doc => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                        {doc.docType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        Uploaded: {formatDate(doc.uploadedAt)}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {doc.fileName}
                    </h4>

                    {/* Extracted ID & Snippet */}
                    {doc.ocrExtractedData && (
                      <div className="text-xs space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                        {doc.ocrExtractedData.extractedId && (
                          <div className="font-mono text-emerald-400 font-bold">
                            Extracted ID: {doc.ocrExtractedData.extractedId}
                          </div>
                        )}
                        {doc.ocrExtractedData.rawTextSnippet && (
                          <p className="text-[11px] text-slate-400 font-mono line-clamp-2">
                            &quot;{doc.ocrExtractedData.rawTextSnippet}&quot;
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right font-mono text-xs">
                      {doc.verificationStatus === "VERIFIED" ? (
                        <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified ({doc.ocrExtractedData?.confidenceScore}%)
                        </span>
                      ) : (
                        <span className="text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Failed Regex
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {orgDocs.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No documents in vault. Upload one using the form on the left.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
