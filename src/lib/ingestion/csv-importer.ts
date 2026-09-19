import { Scheme, GrantType } from "../types";
import { NormalizedSchemeSchema } from "./schemas";
import { parseIndianAmount, mapGrantType, synthesizeAstFromCriteria, inferRequiredDocuments } from "./normalizer";

export interface BulkImportResult {
  success: boolean;
  totalRowsProcessed: number;
  validSchemes: Scheme[];
  rejectedCount: number;
  errors: Array<{
    rowNumber: number;
    title?: string;
    field: string;
    message: string;
  }>;
}

/**
 * Parses CSV raw string into an array of key-value records
 */
export function parseCsvStringToObjects(csvString: string): Record<string, string>[] {
  const lines = csvString
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length < 2) return [];

  // Parse header line respecting quoted fields
  const parseRow = (text: string): string[] => {
    const result: string[] = [];
    let cur = "";
    let insideQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(cur.trim().replace(/^"|"$/g, ""));
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ""));
    return result;
  };

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, "_"));
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || "";
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parses and validates a JSON or CSV payload for bulk Scheme import
 */
export function processBulkSchemeImport(rawContent: string, format: "csv" | "json"): BulkImportResult {
  const errors: BulkImportResult["errors"] = [];
  const validSchemes: Scheme[] = [];

  let rawObjects: any[] = [];

  if (format === "json") {
    try {
      const parsed = JSON.parse(rawContent);
      rawObjects = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e: any) {
      return {
        success: false,
        totalRowsProcessed: 0,
        validSchemes: [],
        rejectedCount: 0,
        errors: [{ rowNumber: 0, field: "json_syntax", message: `Invalid JSON syntax: ${e.message}` }]
      };
    }
  } else {
    rawObjects = parseCsvStringToObjects(rawContent);
    if (rawObjects.length === 0) {
      return {
        success: false,
        totalRowsProcessed: 0,
        validSchemes: [],
        rejectedCount: 0,
        errors: [{ rowNumber: 0, field: "csv_header", message: "No valid rows or headers found in CSV." }]
      };
    }
  }

  rawObjects.forEach((row, idx) => {
    const rowNum = idx + 1;
    const title = row.title || row.scheme_name || row.name || `Custom Grant ${rowNum}`;
    const funder = row.ministry || row.ministryorfunder || row.funder || "Department of Public Enterprises";
    const description = row.description || row.desc || `${title} grant scheme for eligible applicants.`;
    const grantType = mapGrantType(row.granttype || row.grant_type || row.type || "Equity-free Grant");
    const fundingAmount = parseIndianAmount(row.maxfundingamount || row.max_funding || row.budget || row.amount || 2500000);
    const deadline = row.deadline || "Rolling (Open All Year)";
    const sector = row.sector || "MSME & Technology";
    const portalUrl = row.officialportalurl || row.url || row.link || "https://grantpulse.internal";

    // Build AST
    let ast = row.eligibilityast || row.eligibility_ast;
    if (!ast || typeof ast !== "object" || !ast.operator) {
      const criteriaText = (row.eligibility || row.criteria || row.eligibility_text || "") + " " + description;
      ast = synthesizeAstFromCriteria(undefined, criteriaText);
    }

    // Required Docs
    let docs = row.requireddocuments || row.required_documents;
    if (!Array.isArray(docs) || docs.length === 0) {
      docs = inferRequiredDocuments(row.documents || row.required_docs, description);
    }

    const schemeObj = {
      id: row.id || `scheme-import-${Date.now().toString().slice(-4)}-${idx + 1}`,
      sourceType: "csv" as const,
      sourcePortal: "Manual Admin Import",
      title,
      ministryOrFunder: funder,
      description,
      grantType,
      maxFundingAmount: fundingAmount,
      deadline,
      sector: [sector],
      officialPortalUrl: portalUrl,
      eligibilityAst: ast,
      requiredDocuments: docs,
      tags: ["Imported", grantType, sector],
      created_at: new Date().toISOString()
    };

    // Run Zod validation
    const result = NormalizedSchemeSchema.safeParse(schemeObj);
    if (result.success) {
      validSchemes.push(result.data as unknown as Scheme);
    } else {
      result.error.issues.forEach(issue => {
        errors.push({
          rowNumber: rowNum,
          title,
          field: issue.path.join("."),
          message: issue.message
        });
      });
    }
  });

  return {
    success: validSchemes.length > 0,
    totalRowsProcessed: rawObjects.length,
    validSchemes,
    rejectedCount: rawObjects.length - validSchemes.length,
    errors
  };
}
