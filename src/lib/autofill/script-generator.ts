// Script Generator for CSR Form Auto-Fill: Chrome Extension, Bookmarklet & Google Form Pre-fill URLs
import { FormAutofillResult, ExternalCsrFormFixture } from "./types";

/**
 * Generates an executable client-side JavaScript snippet that can be injected
 * by a browser extension, bookmarklet, or DevTools console into any external CSR portal.
 */
export function generateClientInjectionScript(
  result: FormAutofillResult,
  fixture: ExternalCsrFormFixture
): string {
  const fieldMappingPayload = result.mappedFields.map(m => ({
    selector: m.field.domSelector || `[name="${m.field.name || m.field.fieldId}"]`,
    name: m.field.name || m.field.fieldId,
    label: m.field.label,
    type: m.field.elementType,
    value: m.fillValue,
    googleEntryId: m.field.googleEntryId
  }));

  return `/**
 * GrantPulse Autonomous CSR Form Auto-Filler
 * Target Portal: ${fixture.foundationName} - ${fixture.formTitle}
 * Total Mapped Fields: ${result.mappedCount}/${result.totalFields} (${result.fillRatePercent}% Fill Rate)
 * Run this snippet via GrantPulse Chrome Extension or DevTools Console on ${fixture.formUrl}
 */
(function grantPulseAutoFill() {
  console.log("%c[GrantPulse]%c Initializing Autonomous CSR Form Auto-Fill...", "color:#B5452B;font-weight:bold", "color:inherit");
  
  const payload = ${JSON.stringify(fieldMappingPayload, null, 2)};
  let filledCount = 0;

  function triggerEvents(el) {
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  payload.forEach(item => {
    // 1. Try DOM selector
    let el = document.querySelector(item.selector);

    // 2. Try Google Forms entry ID or name fallback
    if (!el && item.googleEntryId) {
      el = document.querySelector(\`[name="\${item.googleEntryId}"]\`) || 
           document.querySelector(\`[data-params*="\${item.googleEntryId}"]\`);
    }

    // 3. Fallback: Search by label text in DOM
    if (!el) {
      const labels = Array.from(document.querySelectorAll('label, div[role="heading"], span'));
      const targetLabel = labels.find(l => l.textContent && l.textContent.toLowerCase().includes(item.label.toLowerCase().slice(0, 20)));
      if (targetLabel) {
        const container = targetLabel.closest('div[role="listitem"], .form-group, .field, div');
        if (container) {
          el = container.querySelector('input, textarea, select');
        }
      }
    }

    if (el) {
      if (item.type === 'checkbox') {
        el.checked = Boolean(item.value);
        triggerEvents(el);
        filledCount++;
      } else if (item.type === 'radio') {
        const radio = document.querySelector(\`input[type="radio"][value="\${item.value}"]\`) || el;
        if (radio) {
          radio.checked = true;
          triggerEvents(radio);
          filledCount++;
        }
      } else if (item.type === 'select') {
        el.value = item.value;
        triggerEvents(el);
        filledCount++;
      } else {
        el.value = item.value;
        triggerEvents(el);
        filledCount++;
      }
      console.log(\`[GrantPulse] ✓ Populated \${item.label}: \${String(item.value).slice(0, 30)}...\`);
    } else {
      console.warn(\`[GrantPulse] ⚠ Element not found for field: \${item.label}\`);
    }
  });

  console.log(\`%c[GrantPulse Complete]%c Successfully populated \${filledCount}/\${payload.length} fields! Please review before final submission.\`, "color:#2E7D32;font-weight:bold", "color:inherit");
})();`;
}

/**
 * Generates a pre-filled Google Form URL (using Google Forms entry parameter syntax)
 */
export function generateGoogleFormsPrefillUrl(
  formBaseUrl: string,
  result: FormAutofillResult
): string | undefined {
  const params = new URLSearchParams();
  params.append("usp", "pp_url");

  let hasEntries = false;
  for (const m of result.mappedFields) {
    if (m.field.googleEntryId) {
      params.append(m.field.googleEntryId, String(m.fillValue));
      hasEntries = true;
    }
  }

  if (!hasEntries) return undefined;

  const separator = formBaseUrl.includes("?") ? "&" : "?";
  return `${formBaseUrl}${separator}${params.toString()}`;
}
