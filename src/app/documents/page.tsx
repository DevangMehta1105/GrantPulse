"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DocumentType } from "@/lib/types";
import { INDIAN_REG_REGEXES } from "@/lib/ocr/validator";
import { formatDate } from "@/lib/utils";
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
    setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <div className="wrap py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--rule)] pb-6">
        <div className="font-mono text-[12px] tracking-wider uppercase text-[var(--stamp)] mb-2">
          Regulatory Vault · OCR Regex Verification
        </div>
        <h1 className="text-3xl md:text-4xl font-medium serif text-[var(--ink)] tracking-tight">
          The Document Folder
        </h1>
        <p className="text-[15px] text-[var(--ink-soft)] mt-2 measure">
          Upload registration certificates once; GrantPulse checks formats, expiry dates, and name matches automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Form */}
        <div className="lg:col-span-5 bg-[var(--paper-deep)] border border-[var(--rule)] p-6 space-y-4">
          <h2 className="font-mono text-xs uppercase font-medium text-[var(--ink)] border-b border-[var(--rule)] pb-3">
            Add Certificate &amp; Parse OCR
          </h2>

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[var(--ink)] mb-1">Document Category</label>
              <select
                value={selectedDocType}
                onChange={(e) => handleDocTypeChange(e.target.value as DocumentType)}
                className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--ink)] cursor-pointer"
              >
                {Object.keys(INDIAN_REG_REGEXES).map(type => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <p className="text-[11px] font-mono text-[var(--ink-soft)] mt-1">
                Syntax: {INDIAN_REG_REGEXES[selectedDocType]?.description}
              </p>
            </div>

            <div>
              <label className="block font-medium text-[var(--ink)] mb-1">File Name</label>
              <input
                type="text"
                value={fileNameInput}
                onChange={(e) => setFileNameInput(e.target.value)}
                className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--ink)]"
                required
              />
            </div>

            <div>
              <label className="block font-medium text-[var(--ink)] mb-1">OCR Text Payload (Simulated / Live)</label>
              <textarea
                value={ocrTextInput}
                onChange={(e) => setOcrTextInput(e.target.value)}
                rows={4}
                className="w-full bg-[var(--paper)] border border-[var(--rule)] p-3 text-[var(--ink)] font-mono text-[11px] focus:outline-none focus:border-[var(--ink)]"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-ink w-full py-2.5"
            >
              Parse Syntax &amp; Save to Vault
            </button>

            {justAdded && (
              <div className="p-2.5 bg-[var(--verified-bg)] border border-[var(--verified)] text-[var(--verified)] font-mono text-[11px] text-center">
                ✓ Document verified &amp; added to case file.
              </div>
            )}
          </form>
        </div>

        {/* Vault Table */}
        <div className="lg:col-span-7 bg-[var(--paper-deep)] border border-[var(--rule)] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
            <h3 className="font-mono text-xs uppercase font-medium text-[var(--ink)]">
              Verified Certificates ({orgDocs.length})
            </h3>
            <span className="font-mono text-[11px] text-[var(--ink-soft)]">{currentOrg.name}</span>
          </div>

          <div className="space-y-3">
            {orgDocs.map(doc => (
              <div
                key={doc.id}
                className="p-4 bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--ink-soft)]">
                    <span className="uppercase">{doc.docType.replace(/_/g, ' ')}</span>
                    <span>·</span>
                    <span>Uploaded {formatDate(doc.uploadedAt)}</span>
                  </div>
                  <div className="font-medium text-sm text-[var(--ink)] truncate">{doc.fileName}</div>
                  {doc.ocrExtractedData?.extractedId && (
                    <div className="font-mono text-[var(--verified)] text-[11px] font-medium">
                      Extracted ID: {doc.ocrExtractedData.extractedId}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 font-mono">
                  <span className={cn(
                    "px-2 py-1 rounded-xs font-medium text-[11px]",
                    doc.verificationStatus === "VERIFIED" ? "bg-[var(--verified-bg)] text-[var(--verified)]" : "bg-[var(--pending-bg)] text-[var(--pending)]"
                  )}>
                    {doc.verificationStatus}
                  </span>
                </div>
              </div>
            ))}

            {orgDocs.length === 0 && (
              <div className="p-8 text-center text-xs font-mono text-[var(--ink-soft)]">
                No documents in vault. Upload one using the form on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
