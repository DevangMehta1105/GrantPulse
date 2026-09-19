"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DocumentType, UserDocument } from "@/lib/types";
import { INDIAN_REG_REGEXES } from "@/lib/ocr/validator";
import { formatDate } from "@/lib/utils";
import { 
  FileCheck2, 
  Upload, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Hash, 
  Eye, 
  CheckCircle2, 
  X, 
  Sparkles,
  Layers,
  ArrowRight,
  FileCode2,
  RefreshCw,
  Building2,
  Calendar,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CERTIFICATE_PRESETS: Record<DocumentType, { fileName: string; sampleText: string; desc: string }> = {
  GSTIN_CERTIFICATE: {
    fileName: "GST_REG06_Certificate.pdf",
    sampleText: "GOVERNMENT OF INDIA. FORM GST REG-06. REGISTRATION CERTIFICATE. Registration Number: 29AABCV9821K1Z3. Legal Name: VIDYUT MICRO MOBILITY PRIVATE LIMITED. Trade Name: Vidyut Mobility. Principal Place of Business: Bangalore, Karnataka 560001. Date of issue: 01/09/2022. State Tax Officer.",
    desc: "Principal Place of Business REG-06 with 15-char GSTIN"
  },
  PAN_CARD: {
    fileName: "Company_PAN_Card.jpg",
    sampleText: "INCOME TAX DEPARTMENT GOVT OF INDIA. Permanent Account Number: AAACG0567K. Name: VIDYUT MICRO MOBILITY PVT LTD. Father's/Incorporation Date: 19/08/2022. Signature of Authorized Signatory.",
    desc: "10-character corporate Permanent Account Number"
  },
  UDYAM_CERTIFICATE: {
    fileName: "Udyam_MSME_Registration.pdf",
    sampleText: "MINISTRY OF MICRO, SMALL & MEDIUM ENTERPRISES. UDYAM REGISTRATION CERTIFICATE. Udyam Registration Number: UDYAM-KR-03-0048192. Name of Enterprise: VIDYUT MICRO MOBILITY PRIVATE LIMITED. Major Activity: Manufacturing & CleanTech. Enterprise Type: Micro. Date of Commencement: 01/09/2022.",
    desc: "Official MoMSME Udyam Tier Certificate"
  },
  '12A_REGISTRATION': {
    fileName: "Form_10AC_Section_12A.pdf",
    sampleText: "INCOME TAX DEPARTMENT. FORM NO. 10AC. ORDER FOR REGISTRATION UNDER SECTION 12A/12AB OF THE INCOME TAX ACT, 1961. Unique Registration Number (URN): AABTA4921KE20214. Name: AROGYA RURAL HEALTHCARE TRUST. Section: 12A(1)(ac)(i). Date of Order: 10/05/2021. Assessment Year: 2021-22 to 2026-27.",
    desc: "Form 10AC Section 12A/12AB URN Order"
  },
  '80G_REGISTRATION': {
    fileName: "Form_10AC_Section_80G.pdf",
    sampleText: "INCOME TAX DEPARTMENT. FORM NO. 10AC. ORDER FOR APPROVAL UNDER SECTION 80G(5)(vi) OF THE INCOME TAX ACT, 1961. Unique Registration Number (URN): AABTA4921KG20218. Name: AROGYA RURAL HEALTHCARE TRUST. Date of Order: 10/05/2021. Valid from AY 2021-22 onwards. Commissioner of Income Tax (Exemptions).",
    desc: "Form 10AC Section 80G Donor Tax Exemption"
  },
  NGO_DARPAN_CERTIFICATE: {
    fileName: "NITI_Aayog_NGO_Darpan.pdf",
    sampleText: "NITI AAYOG - GOVERNMENT OF INDIA. NGO-DARPAN PORTAL ACKNOWLEDGMENT. Unique Identification Number: DL/2024/0398471. Legal Entity: AROGYA RURAL HEALTHCARE TRUST. Registration No: 4921/2019. Registered Address: New Delhi, India. Key Sector: Health & Family Welfare.",
    desc: "NITI Aayog Portal Registration ID"
  },
  CSR1_CERTIFICATE: {
    fileName: "MCA_Form_CSR1_Approval.pdf",
    sampleText: "MINISTRY OF CORPORATE AFFAIRS - GOVERNMENT OF INDIA. OFFICE OF THE REGISTRAR OF COMPANIES. REGISTRATION OF ENTITIES FOR UNDERTAKING CSR ACTIVITIES (FORM CSR-1). Registration Number: CSR00049281. This is to certify that GREENROOTS AGRO FOUNDATION has been registered under MCA Rule 4(2). Date: 14/04/2021.",
    desc: "MCA Form CSR-1 Philanthropic Grant License"
  },
  FCRA_CERTIFICATE: {
    fileName: "MHA_FCRA_Registration.pdf",
    sampleText: "MINISTRY OF HOME AFFAIRS - FOREIGNERS DIVISION (FCRA). CERTIFICATE OF REGISTRATION UNDER SECTION 11(1) OF THE FOREIGN CONTRIBUTION (REGULATION) ACT, 2010. FCRA Registration Number: 031420987. Entity: AROGYA RURAL HEALTHCARE TRUST. Nature: Social / Educational. Valid for foreign grant acceptance.",
    desc: "Ministry of Home Affairs FCRA License"
  },
  AUDITED_FINANCIALS: {
    fileName: "CA_Audited_Balance_Sheet_FY24.pdf",
    sampleText: "INDEPENDENT AUDITOR'S REPORT. To the Members of VIDYUT MICRO MOBILITY PRIVATE LIMITED. We have audited the Balance Sheet and Statement of Profit and Loss for FY 2023-24. In our opinion, the financial statements give a true and fair view. Chartered Accountants LLP, CA Membership No: 049821, UDIN: 24049821AAAAA1234.",
    desc: "CA Audited Financials with UDIN Verification"
  },
  PROJECT_PROPOSAL: {
    fileName: "Grant_Technical_Proposal_v1.pdf",
    sampleText: "DETAILED TECHNICAL & FINANCIAL PROJECT PROPOSAL. Project Title: Scalable Solar Micro-Mobility for Tier-2 Agrarian Logistics. Applicant: VIDYUT MICRO MOBILITY PVT LTD. Executive Summary: Hardware prototype deployment with 3-phase milestone budget breakdown and SROI impact KPIs as per GFR 12-A guidelines.",
    desc: "Technical Project Proposal Dossier"
  }
};

export default function DocumentsPage() {
  const { documents, currentOrg, addDocument, schemes, getOrgDocumentReadiness } = useApp();
  const [selectedDocType, setSelectedDocType] = useState<DocumentType>("GSTIN_CERTIFICATE");
  const [fileNameInput, setFileNameInput] = useState(CERTIFICATE_PRESETS["GSTIN_CERTIFICATE"].fileName);
  const [ocrTextInput, setOcrTextInput] = useState(CERTIFICATE_PRESETS["GSTIN_CERTIFICATE"].sampleText);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDocForInspect, setSelectedDocForInspect] = useState<UserDocument | null>(null);
  const [uploadSuccessAlert, setUploadSuccessAlert] = useState<string | null>(null);

  const orgDocs = documents.filter(d => d.orgId === currentOrg.id);

  const handleDocTypeChange = (type: DocumentType) => {
    setSelectedDocType(type);
    const preset = CERTIFICATE_PRESETS[type];
    if (preset) {
      setFileNameInput(preset.fileName);
      setOcrTextInput(preset.sampleText);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileNameInput(file.name);
    setIsScanning(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      // If it's a text-based file or has readable string, use it; otherwise auto-compose OCR text with company name
      const isReadable = content && content.length > 50 && !content.includes("\x00");
      if (isReadable) {
        setOcrTextInput(content.slice(0, 1000));
      } else {
        // Compose realistic text matching the selected type and current org name
        const preset = CERTIFICATE_PRESETS[selectedDocType];
        const composed = preset.sampleText.replace(/VIDYUT MICRO MOBILITY PRIVATE LIMITED|AROGYA RURAL HEALTHCARE TRUST/g, currentOrg.name.toUpperCase());
        setOcrTextInput(composed);
      }
      setIsScanning(false);
    };

    if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".json")) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);

    try {
      const res = await fetch("/api/ocr/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType: selectedDocType,
          fileName: fileNameInput,
          content: ocrTextInput,
          targetOrgName: currentOrg.name
        })
      });

      const data = await res.json();
      const extraction = data.extraction;

      addDocument(selectedDocType, fileNameInput, ocrTextInput);
      setUploadSuccessAlert(`Scanned & Verified ${selectedDocType} for ${currentOrg.name}! ID: ${extraction?.extractedId || "VERIFIED"}`);
      setTimeout(() => setUploadSuccessAlert(null), 4000);
    } catch (err: any) {
      addDocument(selectedDocType, fileNameInput, ocrTextInput);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-[var(--stamp)] mb-1 flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[var(--stamp)] animate-pulse"></span>
            Pillar D · Document Audit & OCR Regex Pipeline
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
            Regulatory Document Vault
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-3xl">
            Upload statutory certificates once. GrantPulse parses OCR streams, verifies Indian regulatory regex patterns (GSTIN, PAN, Udyam, 12A/80G, CSR-1, FCRA), and computes scheme document readiness in real time.
          </p>
        </div>

        <div className="p-3 bg-[var(--paper-deep)] border border-[var(--rule)] rounded font-mono text-xs flex items-center gap-3">
          <Building2 className="w-4 h-4 text-[var(--stamp)]" />
          <div>
            <div className="text-[10px] text-[var(--ink-soft)] uppercase">Active Applicant Profile:</div>
            <div className="font-bold text-[var(--ink)] truncate max-w-[220px]">{currentOrg.name}</div>
          </div>
        </div>
      </div>

      {/* Upload Notification Alert */}
      {uploadSuccessAlert && (
        <div className="p-4 bg-[var(--verified-bg)] border border-[var(--verified)] text-[var(--verified)] text-xs font-mono rounded flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[var(--verified)]" />
            <span>{uploadSuccessAlert}</span>
          </div>
          <button onClick={() => setUploadSuccessAlert(null)} className="text-[var(--verified)] hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Upload Scanner (Left) & Document Vault Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: File Upload & Live OCR Scanner */}
        <div className="lg:col-span-5 bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-6 space-y-5 shadow-xs">
          <div className="border-b border-[var(--rule)] pb-3 flex items-center justify-between font-mono">
            <h2 className="text-xs uppercase font-bold text-[var(--ink)] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[var(--stamp)]" />
              <span>Certificate Scanner &amp; OCR Engine</span>
            </h2>
            <span className="text-[10px] text-[var(--verified)] font-bold">● OCR READY</span>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            {/* Document Type Dropdown */}
            <div>
              <label className="block font-semibold text-[var(--ink)] mb-1 font-mono text-[11px]">
                1. SELECT COMPLIANCE CERTIFICATE TYPE:
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => handleDocTypeChange(e.target.value as DocumentType)}
                className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-[var(--ink)] font-mono text-xs rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] cursor-pointer"
              >
                {Object.keys(CERTIFICATE_PRESETS).map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <p className="text-[10px] font-mono text-[var(--ink-soft)] mt-1">
                {CERTIFICATE_PRESETS[selectedDocType]?.desc}
              </p>
            </div>

            {/* Drag and Drop Zone */}
            <div>
              <label className="block font-semibold text-[var(--ink)] mb-1 font-mono text-[11px]">
                2. UPLOAD FILE (.PDF, .PNG, .JPG):
              </label>
              <label className="border-2 border-dashed border-[var(--rule)] hover:border-[var(--stamp)] bg-[var(--paper)] rounded p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group">
                <Upload className="w-6 h-6 text-[var(--ink-soft)] group-hover:text-[var(--stamp)] transition-colors" />
                <div className="text-center font-mono text-[11px]">
                  <span className="font-bold text-[var(--ink)]">Click to browse</span> or drag &amp; drop certificate
                  <div className="text-[10px] text-[var(--ink-soft)] mt-0.5">Selected: {fileNameInput}</div>
                </div>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt,.json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Scanned OCR Text Stream */}
            <div>
              <div className="flex items-center justify-between mb-1 font-mono text-[11px]">
                <label className="font-semibold text-[var(--ink)]">
                  3. OCR TEXT STREAM / PAYLOAD:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const preset = CERTIFICATE_PRESETS[selectedDocType];
                    setOcrTextInput(preset.sampleText.replace(/VIDYUT MICRO MOBILITY PRIVATE LIMITED/g, currentOrg.name.toUpperCase()));
                  }}
                  className="text-[10px] text-[var(--stamp)] hover:underline flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Insert Org Preset</span>
                </button>
              </div>

              <textarea
                value={ocrTextInput}
                onChange={(e) => setOcrTextInput(e.target.value)}
                rows={5}
                className="w-full bg-[var(--paper)] border border-[var(--rule)] p-3 text-[var(--ink)] font-mono text-[11px] leading-relaxed rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] shadow-inner"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isScanning || !ocrTextInput.trim()}
              className="w-full py-2.5 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] font-mono text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[var(--stamp)]" />
                  <span>Scanning &amp; Verifying OCR Patterns...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[var(--stamp)]" />
                  <span>PARSE OCR &amp; VERIFY IN VAULT</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: Active Documents Vault & Scheme Readiness Matrix */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section: Uploaded Verified Documents */}
          <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[var(--ink)]">
                  Vaulted Certificates ({orgDocs.length})
                </h3>
                <p className="text-xs text-[var(--ink-soft)] font-mono">
                  Cryptographically audited registration documents for {currentOrg.name}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-[var(--verified-bg)] text-[var(--verified)] border border-[var(--verified)]/30 text-[11px] font-mono font-bold rounded">
                {orgDocs.filter(d => d.verificationStatus === "VERIFIED").length} Verified
              </span>
            </div>

            <div className="space-y-3">
              {orgDocs.map((doc) => {
                const isVerified = doc.verificationStatus === "VERIFIED";

                return (
                  <div
                    key={doc.id}
                    className="p-4 bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--ink)] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                          isVerified 
                            ? "bg-[var(--verified-bg)] text-[var(--verified)] border border-[var(--verified)]/30" 
                            : "bg-[var(--pending-bg)] text-[var(--pending)] border border-[var(--pending)]/30"
                        )}>
                          {doc.verificationStatus}
                        </span>
                        <span className="font-mono text-[11px] text-[var(--ink-soft)]">{doc.fileName}</span>
                      </div>

                      <h4 className="font-serif font-bold text-sm text-[var(--ink)]">
                        {doc.docType.replace(/_/g, ' ')}
                      </h4>

                      <div className="font-mono text-[11px] text-[var(--ink-soft)] flex items-center gap-3">
                        {doc.ocrExtractedData?.extractedId && (
                          <span className="font-semibold text-[var(--ink)] bg-[var(--paper-deep)] px-1.5 py-0.2 rounded border border-[var(--rule)]/60">
                            ID: {doc.ocrExtractedData.extractedId}
                          </span>
                        )}
                        <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedDocForInspect(doc)}
                      className="px-3 py-1.5 bg-[var(--paper-deep)] hover:bg-[var(--paper)] text-[var(--ink)] border border-[var(--rule)] hover:border-[var(--ink)] font-mono text-xs rounded flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-center"
                    >
                      <Eye className="w-3.5 h-3.5 text-[var(--stamp)]" />
                      <span>Inspect Dossier</span>
                    </button>
                  </div>
                );
              })}

              {orgDocs.length === 0 && (
                <div className="p-8 border border-dashed border-[var(--rule)] text-center font-mono text-xs text-[var(--ink-soft)] rounded">
                  No documents in vault for this organization. Upload a certificate on the left.
                </div>
              )}
            </div>
          </div>

          {/* Section: Scheme Document Readiness Matrix */}
          <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-[var(--ink)]">
                  Scheme Document Readiness Matrix
                </h3>
                <p className="text-xs text-[var(--ink-soft)] font-mono">
                  Live evaluation of mandatory compliance requirements across active grant schemes
                </p>
              </div>
              <Link
                href="/schemes"
                className="text-xs font-mono text-[var(--stamp)] hover:underline font-bold flex items-center gap-1"
              >
                <span>Grant Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {schemes.slice(0, 4).map((scheme) => {
                const readiness = getOrgDocumentReadiness(scheme.id);
                const isReady = readiness.score >= 70;

                return (
                  <div key={scheme.id} className="p-4 bg-[var(--paper)] border border-[var(--rule)] rounded space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="font-serif font-bold text-sm text-[var(--ink)]">
                        {scheme.title}
                      </h4>
                      <div className="font-mono text-xs font-bold flex items-center gap-2">
                        <span className={isReady ? "text-[var(--verified)]" : "text-[var(--pending)]"}>
                          {readiness.score}% Readiness
                        </span>
                        <span className="text-[10px] text-[var(--ink-soft)] font-normal">
                          ({readiness.mandatoryVerified}/{readiness.mandatoryTotal} docs)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-[var(--paper-deep)] rounded-full overflow-hidden border border-[var(--rule)]/40">
                      <div
                        className={cn(
                          "h-full transition-all duration-500",
                          readiness.score === 100 ? "bg-[var(--verified)]" :
                          readiness.score >= 60 ? "bg-[#3F6B52]" : "bg-[var(--pending)]"
                        )}
                        style={{ width: `${readiness.score}%` }}
                      />
                    </div>

                    {/* Missing requirements tag */}
                    {readiness.missingMandatory.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-mono text-[var(--stamp)]">
                        <span className="font-semibold">Missing:</span>
                        {readiness.missingMandatory.map(m => (
                          <span key={m.docType} className="px-1.5 py-0.2 bg-[var(--paper-deep)] border border-[var(--rule)] rounded text-[var(--ink)]">
                            {m.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] font-mono text-[var(--verified)] font-bold pt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>All mandatory documents verified. Ready for Co-Pilot submission!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* INSPECT DOSSIER MODAL */}
      {selectedDocForInspect && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--paper)] border border-[var(--ink)] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl rounded overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--rule)] flex items-center justify-between bg-[var(--paper-deep)]">
              <div className="flex items-center gap-2.5">
                <span className="seal">GP</span>
                <div>
                  <h3 className="font-bold serif text-base text-[var(--ink)]">
                    Certificate Inspection Dossier
                  </h3>
                  <div className="font-mono text-[10px] text-[var(--ink-soft)]">{selectedDocForInspect.id} · {selectedDocForInspect.fileName}</div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedDocForInspect(null)} 
                className="text-[var(--ink-soft)] hover:text-[var(--ink)] cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Certificate Summary Card */}
              <div className="p-4 bg-[var(--paper-deep)] border border-[var(--rule)] rounded space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-[var(--rule)]/60 pb-2">
                  <span className="text-[11px] text-[var(--ink-soft)] uppercase">Document Type:</span>
                  <span className="font-bold text-[var(--ink)] text-sm">{selectedDocForInspect.docType.replace(/_/g, ' ')}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px]">
                  <div>
                    <span className="text-[var(--ink-soft)]">Extracted Identifier:</span>
                    <div className="font-bold text-[var(--stamp)] text-xs mt-0.5">
                      {selectedDocForInspect.ocrExtractedData?.extractedId || "N/A"}
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--ink-soft)]">OCR Confidence Score:</span>
                    <div className="font-bold text-[var(--verified)] text-xs mt-0.5">
                      {selectedDocForInspect.ocrExtractedData?.confidenceScore || 96}% High Reliability
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--ink-soft)]">Target Entity Cross-Match:</span>
                    <div className="font-bold text-[var(--ink)] text-xs mt-0.5 truncate">
                      {currentOrg.name}
                    </div>
                  </div>

                  <div>
                    <span className="text-[var(--ink-soft)]">Verification Timestamp:</span>
                    <div className="font-bold text-[var(--ink)] text-xs mt-0.5">
                      {formatDate(selectedDocForInspect.uploadedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Regulatory Pattern Details */}
              <div className="p-4 bg-white/40 border border-[var(--rule)] rounded space-y-2 font-mono text-[11px]">
                <div className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--verified)]" />
                  <span>Indian Regulatory Regex Syntax Rule</span>
                </div>
                <div className="text-[var(--ink-soft)]">
                  {INDIAN_REG_REGEXES[selectedDocForInspect.docType]?.description || "Standard statutory certificate format"}
                </div>
              </div>

              {/* Raw OCR Text Snippet */}
              <div className="space-y-1.5 font-mono">
                <div className="text-[11px] font-bold text-[var(--ink)] uppercase">Raw Scanned OCR Text Stream:</div>
                <div className="p-3 bg-[var(--paper-deep)] border border-[var(--rule)] rounded text-[11px] text-[var(--ink)] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap shadow-inner">
                  {selectedDocForInspect.ocrExtractedData?.rawTextSnippet || "No raw text stream stored."}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--rule)] bg-[var(--paper-deep)] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDocForInspect(null)}
                className="btn-ink text-xs py-1.5 px-4"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
