// Types for GrantPulse CSR Form Auto-Fill Engine

export type FormFieldCategory = 
  | 'organization_identity'
  | 'statutory_compliance'
  | 'financials_track_record'
  | 'project_proposal'
  | 'budget_milestones'
  | 'contact_signatory'
  | 'document_attachment';

export type InputElementType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file'
  | 'date';

export type TargetPortalPlatform = 
  | 'google_forms'
  | 'typeform'
  | 'custom_web_portal'
  | 'csr_portal_eoi';

export interface FormFieldDefinition {
  fieldId: string;
  label: string;
  name?: string;
  placeholder?: string;
  elementType: InputElementType;
  options?: string[]; // For select, radio, checkbox
  category?: FormFieldCategory;
  isRequired?: boolean;
  domSelector?: string;
  googleEntryId?: string; // For Google Forms (e.g. 'entry.184920194')
}

export interface MappedFieldResult {
  field: FormFieldDefinition;
  sourceKey: string;
  sourceCategory: 'org_profile' | 'copilot_proposal' | 'vault_document' | 'computed';
  fillValue: string | number | boolean;
  displayValue: string;
  confidenceScore: number; // 0 to 1
  adaptationNote?: string;
}

export interface UnmappedFieldResult {
  field: FormFieldDefinition;
  reason: 'requires_manual_input' | 'unrecognized_label' | 'file_upload_token_required' | 'captcha';
  suggestion?: string;
}

export interface FormAutofillResult {
  portalPlatform: TargetPortalPlatform;
  formTitle: string;
  totalFields: number;
  mappedCount: number;
  unmappedCount: number;
  fillRatePercent: number; // e.g. 92.8%
  mappedFields: MappedFieldResult[];
  unmappedFields: UnmappedFieldResult[];
  clientScriptSnippet?: string; // Executable JavaScript for browser extension / console
  prefilledUrl?: string; // If applicable (e.g. Google Form)
  executionLatencyMs: number;
}

export interface ExternalCsrFormFixture {
  id: string;
  portalPlatform: TargetPortalPlatform;
  foundationName: string;
  formTitle: string;
  formUrl: string;
  fields: FormFieldDefinition[];
}
