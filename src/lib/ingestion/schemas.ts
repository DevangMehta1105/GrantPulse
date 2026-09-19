import { z } from "zod";

// AST Node Schemas for strict validation
export const AstConditionNodeSchema: z.ZodType<any> = z.lazy(() => 
  z.object({
    field: z.string().min(1, "Field path is required (e.g. turnoverInr, complianceFlags.has80G)"),
    operator: z.enum(["GTE", "LTE", "EQUALS", "IN", "CONTAINS"]),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string()), z.array(z.number())]),
    description: z.string().min(1, "Rule description is required")
  })
);

export const AstGroupNodeSchema: z.ZodType<any> = z.lazy(() => 
  z.object({
    operator: z.enum(["AND", "OR", "NOT"]),
    children: z.array(z.union([AstConditionNodeSchema, AstGroupNodeSchema])).min(1, "Group node must contain at least 1 child"),
    description: z.string().optional()
  })
);

export const AstNodeSchema = z.union([AstConditionNodeSchema, AstGroupNodeSchema]);

export const RequiredDocumentDefSchema = z.object({
  docType: z.string().min(1),
  name: z.string().min(1),
  isMandatory: z.boolean(),
  validationRegex: z.string().optional(),
  description: z.string().default("")
});

export const NormalizedSchemeSchema = z.object({
  id: z.string().min(1),
  sourceType: z.enum(["scraped", "manual", "csv"]),
  sourcePortal: z.string().min(1),
  title: z.string().min(3, "Title must be at least 3 characters"),
  ministryOrFunder: z.string().min(2, "Ministry or funder name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  grantType: z.enum(["Subsidy", "Reimbursement", "Equity-free Grant", "Concessional Loan", "CSR Grant"]),
  maxFundingAmount: z.number().nonnegative(),
  subsidyPercentage: z.number().min(0).max(100).optional(),
  deadline: z.string().min(1),
  sector: z.array(z.string()).default([]),
  officialPortalUrl: z.string().optional(),
  eligibilityAst: AstGroupNodeSchema,
  requiredDocuments: z.array(RequiredDocumentDefSchema).min(1, "Must require at least 1 document"),
  tags: z.array(z.string()).default([]),
  created_at: z.string().default(() => new Date().toISOString())
});

export type ValidatedScheme = z.infer<typeof NormalizedSchemeSchema>;

// Raw crawled item schema before normalization
export const RawCrawledItemSchema = z.object({
  rawId: z.string().optional(),
  title: z.string().min(1, "Raw title is required"),
  ministryOrFunder: z.string().default("Government of India"),
  description: z.string().default(""),
  grantTypeStr: z.string().default("Equity-free Grant"),
  maxFundingRaw: z.union([z.string(), z.number()]).default(0),
  deadlineRaw: z.string().optional(),
  eligibilityText: z.string().optional(),
  documentsRequiredRaw: z.union([z.string(), z.array(z.string())]).optional(),
  officialLink: z.string().optional(),
  sectorTag: z.string().optional(),
  criteriaObj: z.record(z.string(), z.any()).optional()
});

export type RawCrawledItem = z.infer<typeof RawCrawledItemSchema>;
