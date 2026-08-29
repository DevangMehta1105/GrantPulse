"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DocumentType } from "@/lib/types";
import { INDIAN_REG_REGEXES } from "@/lib/ocr/validator";
import { formatDate } from "@/lib/utils";
import { FileCheck2, UploadCloud, Check, X, Plus } from "lucide-react";
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
  const [justAdded, setJustAdded] = useState(false);

  const orgDocs = documents.filter(d => d.orgId === currentOrg.id);

  const handleDocTypeChange = (type: DocumentType) => {
    setSelectedDocType(type);
    setFileNameInput(`${type.toLowerCase()}_sample.pdf`);
    setOcrTextInput(SAMPLE_OCR_TEMPLATES[type] || "");
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument(selectedDocType, fileNameInput, ocrTextInput);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="space-y-6 text-xs">
      <div>
        <h1 className="text-lg font-bold text-[#ededef]">Document Vault & OCR Validator</h1>
        <p className="text-xs text-[#8b8d98]">
          Automated syntax extraction for GSTIN, PAN, Udyam, 12A/80G, NGO Darpan, CSR-1 & FCRA certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload Form */}
        <div className="lg:col-span-5 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-xs text-[#ededef] uppercase font-mono border-b border-[#1e2029] pb-3">
            Add Document & Run Parser
          </h2>

          <form onSubmit={handleUploadSubmit} className="space-y-3">
            <div>
              <label className="block text-[#8b8d98] font-medium mb-1">Document Category</label>
              <select
                value={selectedDocType}
                onChange={(e) => handleDocTypeChange(e.target.value as DocumentType)}
                className="w-full bg-[#111216] border border-[#232530] rounded-md px-3 py-1.5 text-[#ededef] focus:outline-none focus:border-[#373a4a] cursor-pointer"
              >
                {Object.keys(INDIAN_REG_REGEXES).map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <p className="text-[10px] text-[#5e6170] mt-1 font-mono">
                Pattern: {INDIAN_REG_REGEXES[selectedDocType]?.description}
              </p>
            </div>

            <div>
              <label className="block text-[#8b8d98] font-medium mb-1">File Name</label>
              <input
                type="text"
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                className="w-full bg-[#111216] border border-[#232530] rounded-md px-3 py-1.5 text-[#ededef] font-mono focus:outline-none focus:border-[#373a4a]"
                required
              />
            </div>

            <div>
              <label className="block text-[#8b8d98] font-medium mb-1">OCR Text Payload</label>
              <textarea
                value={ocrTextInput}
                onChange={(e) => setOcrTextInput(e.target.value)}
                rows={3}
                className="w-full bg-[#111216] border border-[#232530] rounded-md p-2.5 text-[#ededef] font-mono text-[11px] focus:outline-none focus:border-[#373a4a]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-md bg-[#ededef] text-[#0d0e11] font-semibold hover:bg-white transition-colors cursor-pointer"
            >
              Parse & Save to Vault
            </button>

            {justAdded && (
              <div className="text-[11px] text-[#2eb88a] font-mono text-center">
                ✓ Document verified and added to vault.
              </div>
            )}
          </form>
        </div>

        {/* Vault Table */}
        <div className="lg:col-span-7 bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2029] pb-3">
            <h3 className="font-semibold text-xs text-[#ededef] uppercase font-mono">
              Verified Documents ({orgDocs.length})
            </h3>
            <span className="text-[10px] font-mono text-[#5e6170]">{currentOrg.name}</span>
          </div>

          <div className="space-y-2.5">
            {orgDocs.map(doc => (
              <div
                key={doc.id}
                className="p-3 rounded-lg bg-[#111216] border border-[#1e2029] flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#5e6170] uppercase">
                      {doc.docType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-[#5e6170]">
                      {formatDate(doc.uploadedAt)}
                    </span>
                  </div>
                  <div className="font-semibold text-xs text-[#ededef] truncate">{doc.fileName}</div>
                  {doc.ocrExtractedData?.extractedId && (
                    <div className="font-mono text-[#2eb88a] text-[11px]">
                      ID: {doc.ocrExtractedData.extractedId}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <span className={cn(
                    "text-[10px] font-mono font-semibold px-2 py-0.5 rounded",
                    doc.verificationStatus === "VERIFIED" ? "bg-[#13231e] text-[#2eb88a]" : "bg-[#29171b] text-[#ef4444]"
                  )}>
                    {doc.verificationStatus}
                  </span>
                </div>
              </div>
            ))}

            {orgDocs.length === 0 && (
              <div className="p-8 text-center text-xs text-[#5e6170]">
                No documents in vault. Use the upload panel on the left to add one.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
