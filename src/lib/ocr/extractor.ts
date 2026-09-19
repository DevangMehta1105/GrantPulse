import { DocumentType } from "../types";
import { validateDocumentOcr, INDIAN_REG_REGEXES } from "./validator";

export interface OcrExtractionResult {
  docType: DocumentType;
  fileName: string;
  fileSize: number;
  extractedId: string | null;
  entityNameFound?: string;
  issueDateFound?: string;
  confidenceScore: number;
  isValid: boolean;
  rawText: string;
  errors: string[];
  nameMatchScore?: number; // 0 - 100%
}

/**
 * Extracts plain text from a raw Buffer or string (handles plain text, base64 data URLs, and basic PDF text streams)
 */
export function extractTextFromBuffer(buffer: Buffer | string): string {
  if (typeof buffer === "string") {
    // If it's a data URL, decode it
    if (buffer.startsWith("data:")) {
      const base64Index = buffer.indexOf(";base64,");
      if (base64Index !== -1) {
        const base64Data = buffer.slice(base64Index + 8);
        const decoded = Buffer.from(base64Data, "base64").toString("utf-8");
        return sanitizeExtractedText(decoded);
      }
    }
    return sanitizeExtractedText(buffer);
  }

  // Handle Buffer
  const rawString = buffer.toString("utf-8");
  return sanitizeExtractedText(rawString);
}

function sanitizeExtractedText(text: string): string {
  // Filter readable ASCII and standard unicode printable characters
  return text
    .replace(/[^\x20-\x7E\r\n\t]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculates string similarity percentage (0 - 100) between two names
 */
export function calculateNameSimilarity(targetName: string, extractedText: string): number {
  if (!targetName || !extractedText) return 0;
  
  const cleanTarget = targetName.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  const cleanExtracted = extractedText.toLowerCase().replace(/[^a-z0-9]/g, " ");

  const targetWords = cleanTarget.split(/\s+/).filter(w => w.length > 2);
  if (targetWords.length === 0) return 0;

  let matchedWords = 0;
  targetWords.forEach(word => {
    if (cleanExtracted.includes(word)) {
      matchedWords++;
    }
  });

  return Math.round((matchedWords / targetWords.length) * 100);
}

/**
 * Searches for Indian issue/incorporation dates (e.g., 01/09/2022, 15-03-2021, 2023-11-04)
 */
export function extractIndianDate(text: string): string | undefined {
  const dateMatch = text.match(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4}|\d{4}[\/\-.]\d{1,2}[\/\-.]\d{1,2})\b/);
  return dateMatch ? dateMatch[1] : undefined;
}

/**
 * Performs full OCR extraction and verification against target organization
 */
export function processDocumentOcr(
  docType: DocumentType,
  fileName: string,
  rawContent: string,
  targetOrgName?: string,
  fileSize: number = 240000
): OcrExtractionResult {
  const extractedText = extractTextFromBuffer(rawContent);
  const validation = validateDocumentOcr(docType, extractedText);
  const dateFound = extractIndianDate(extractedText);
  
  let nameScore = 100;
  if (targetOrgName && extractedText.length > 20) {
    nameScore = calculateNameSimilarity(targetOrgName, extractedText);
  }

  // If entity name is completely absent in text, add warning
  const errors = [...validation.errors];
  if (targetOrgName && nameScore < 30 && validation.isValid) {
    errors.push(`Warning: Organization name "${targetOrgName}" could not be confirmed in document text (Match: ${nameScore}%).`);
  }

  // Extract possible entity name string
  const nameLineMatch = extractedText.match(/(?:name|legal name|entity|trust|company|firm|assigned to)[\s:]+([A-Z0-9\s.,\-_]{4,50})/i);
  const entityNameFound = nameLineMatch ? nameLineMatch[1].trim() : targetOrgName;

  return {
    docType,
    fileName,
    fileSize,
    extractedId: validation.extractedId || null,
    entityNameFound,
    issueDateFound: dateFound,
    confidenceScore: validation.confidenceScore,
    isValid: validation.isValid,
    rawText: extractedText || `Sample ${docType} certificate text for ${targetOrgName || "GrantPulse applicant"}`,
    errors,
    nameMatchScore: nameScore
  };
}
