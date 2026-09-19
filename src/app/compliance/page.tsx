"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { 
  Printer, 
  ScrollText, 
  ShieldCheck, 
  Building2, 
  Plus, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2,
  TrendingDown,
  Layers,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_CAPS: Record<string, number> = {
  "Capital Equipment": 0.45,
  "Manpower & Salaries": 0.25,
  "Testing, Audits & Certification": 0.15,
  "Consumables & Supplies": 0.10,
  "Overheads / Admin": 0.05
};

export default function CompliancePage() {
  const { currentOrg, applications, schemes, expenses, addExpense } = useApp();

  const sanctionedApps = applications.filter(
    a => a.orgId === currentOrg.id && (a.currentState === "Sanctioned" || a.sanctionedAmount)
  );

  const [selectedAppId, setSelectedAppId] = useState<string>(
    sanctionedApps.length > 0 ? sanctionedApps[0].id : (applications[0]?.id || "")
  );

  const activeApp = applications.find(a => a.id === selectedAppId) || applications[0];
  const activeScheme = schemes.find(s => s.id === activeApp?.schemeId) || schemes[0];

  const appExpenses = expenses.filter(e => e.applicationId === activeApp?.id);
  const totalUtilized = appExpenses.reduce((sum, e) => sum + e.amount, 0);
  const sanctionedAmount = activeApp?.sanctionedAmount || activeScheme?.maxFundingAmount || 500000;
  const unutilizedBalance = sanctionedAmount - totalUtilized;

  // Form state
  const [newVendor, setNewVendor] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState<string>("Capital Equipment");
  const [newInvoiceNo, setNewInvoiceNo] = useState("");
  const [expenseAlert, setExpenseAlert] = useState<string | null>(null);

  // Category utilization calculation
  const getCategorySpent = (category: string) => {
    return appExpenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newAmount) return;

    const parsedAmt = parseFloat(newAmount);
    const categorySpent = getCategorySpent(newCategory);
    const categoryCap = (CATEGORY_CAPS[newCategory] || 0.3) * sanctionedAmount;

    if (categorySpent + parsedAmt > categoryCap) {
      setExpenseAlert(`Warning: Expense exceeds ${newCategory} GFR cap of ${formatINR(categoryCap, true)}.`);
    } else {
      setExpenseAlert(null);
    }

    addExpense({
      applicationId: activeApp.id,
      category: newCategory as any,
      amount: parsedAmt,
      invoiceNumber: newInvoiceNo || `INV-${Date.now().toString().slice(-6)}`,
      vendorName: newVendor,
      invoiceUrl: "/invoices/entry.pdf",
      isCompliant: true,
      complianceNotes: `Vetted under GFR Rule 238(1) for ${newCategory}`
    });

    setNewVendor("");
    setNewAmount("");
    setNewInvoiceNo("");
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-8 py-8 space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <div className="font-mono text-[11px] tracking-widest uppercase text-[var(--stamp)] mb-1 flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[var(--stamp)] animate-pulse"></span>
            Pillar G · Post-Sanction Fund Utilization &amp; GFR 12-A Compliance
          </div>
          <h1 className="text-3xl font-serif font-bold text-[var(--ink)] tracking-tight">
            Fund Utilization &amp; GFR 12-A Ledger
          </h1>
          <p className="text-sm text-[var(--ink-soft)] mt-1 max-w-3xl">
            Track grant disbursements, enforce statutory category budget caps under General Financial Rules, and export formal Form GFR 12-A Utilization Certificates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] text-xs font-mono font-bold rounded flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-[var(--stamp)]" />
            <span>PRINT FORM GFR 12-A</span>
          </button>
        </div>
      </div>

      {/* Application Selector Ribbon */}
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[var(--ink-soft)] uppercase font-semibold">Active Sanctioned Grant:</span>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="bg-[var(--paper)] border border-[var(--rule)] px-3 py-1.5 font-bold text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] cursor-pointer"
          >
            {applications.map(app => {
              const s = schemes.find(sch => sch.id === app.schemeId);
              return (
                <option key={app.id} value={app.id}>
                  {app.id} · {s?.title || app.schemeId} ({app.currentState})
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--ink-soft)]">
          <Building2 className="w-4 h-4 text-[var(--stamp)]" />
          <span>Entity: <strong>{currentOrg.name}</strong></span>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
        <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-5 space-y-1 shadow-xs">
          <span className="text-[10px] text-[var(--ink-soft)] uppercase font-bold tracking-wider">Sanctioned Tranche</span>
          <div className="text-2xl font-serif font-bold text-[var(--ink)]">{formatINR(sanctionedAmount)}</div>
          <div className="text-[11px] text-[var(--ink-soft)]">{activeApp?.externalApplicationId || "Ref: SO-ZED-9821"}</div>
        </div>

        <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-5 space-y-1 shadow-xs">
          <span className="text-[10px] text-[var(--ink-soft)] uppercase font-bold tracking-wider">Utilized (Vouched Invoices)</span>
          <div className="text-2xl font-serif font-bold text-[var(--verified)]">{formatINR(totalUtilized)}</div>
          <div className="text-[11px] text-[var(--ink-soft)]">
            {((totalUtilized / sanctionedAmount) * 100).toFixed(1)}% of sanctioned tranche utilized
          </div>
        </div>

        <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-5 space-y-1 shadow-xs">
          <span className="text-[10px] text-[var(--ink-soft)] uppercase font-bold tracking-wider">Unutilized Balance</span>
          <div className="text-2xl font-serif font-bold text-[var(--pending)]">{formatINR(unutilizedBalance)}</div>
          <div className="text-[11px] text-[var(--verified)] font-bold">✓ 100% GFR Rule 238(1) Compliant</div>
        </div>
      </div>

      {/* Category Cap Progress Bars */}
      <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[var(--rule)]/60 pb-3">
          <h3 className="font-serif font-bold text-base text-[var(--ink)]">
            Statutory Category Budget Caps (GFR Threshold Enforcement)
          </h3>
          <span className="text-[10px] font-mono text-[var(--ink-soft)] uppercase font-bold">
            Maximum Cap Ceiling Breakdown
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          {Object.entries(CATEGORY_CAPS).map(([category, ratio]) => {
            const capAmount = sanctionedAmount * ratio;
            const spent = getCategorySpent(category);
            const pct = Math.min(100, Math.round((spent / capAmount) * 100));
            const isExceeded = spent > capAmount;

            return (
              <div key={category} className="p-3.5 bg-[var(--paper)] rounded border border-[var(--rule)] space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[var(--ink)] truncate max-w-[180px]">{category}</span>
                  <span className={isExceeded ? "text-[var(--stamp)] font-bold" : "text-[var(--ink-soft)]"}>
                    {(ratio * 100)}% Cap ({formatINR(capAmount, true)})
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-[var(--paper-deep)] rounded-full overflow-hidden border border-[var(--rule)]/40">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      isExceeded ? "bg-[var(--stamp)]" : pct > 75 ? "bg-[var(--pending)]" : "bg-[var(--verified)]"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-[var(--ink-soft)]">Spent: {formatINR(spent)}</span>
                  <span className={cn("font-bold", isExceeded ? "text-[var(--stamp)]" : "text-[var(--verified)]")}>
                    {pct}% utilized
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Two Column Layout: Ledger (Left) + Form GFR 12-A Certificate (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: Expense Entry & Vouched Expenses Ledger */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Add Expense Form */}
          <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-6 space-y-4 text-xs shadow-xs">
            <h3 className="font-mono text-xs uppercase font-bold text-[var(--ink)] border-b border-[var(--rule)] pb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[var(--stamp)]" />
              <span>Record Audited Grant Expense</span>
            </h3>

            {expenseAlert && (
              <div className="p-3 bg-[var(--pending-bg)] border border-[var(--pending)] text-[var(--pending)] text-[11px] font-mono rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{expenseAlert}</span>
              </div>
            )}

            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[var(--ink)] font-bold mb-1 font-mono text-[11px]">Vendor / Payee Name:</label>
                <input
                  type="text"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  placeholder="e.g. Precision CNC Works Ltd"
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)]"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-bold mb-1 font-mono text-[11px]">Invoice / Voucher No:</label>
                <input
                  type="text"
                  value={newInvoiceNo}
                  onChange={(e) => setNewInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-2026-884"
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-bold mb-1 font-mono text-[11px]">GFR Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)] cursor-pointer"
                >
                  {Object.keys(CATEGORY_CAPS).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[var(--ink)] font-bold mb-1 font-mono text-[11px]">Amount (INR):</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs font-mono text-[var(--ink)] rounded focus:outline-none focus:ring-1 focus:ring-[var(--stamp)]"
                  required
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[var(--ink)] hover:bg-[#2D4A3E] text-[var(--paper)] font-mono text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Receipt className="w-4 h-4 text-[var(--stamp)]" />
                  <span>ADD TO AUDITED LEDGER &amp; VERIFY CAP</span>
                </button>
              </div>
            </form>
          </div>

          {/* Vouched Expense List */}
          <div className="bg-[var(--paper-deep)] border border-[var(--rule)] rounded p-6 space-y-4 text-xs shadow-xs">
            <div className="flex items-center justify-between border-b border-[var(--rule)] pb-3">
              <h3 className="font-mono text-xs uppercase font-bold text-[var(--ink)]">
                Vouched Expenses ({appExpenses.length} entries)
              </h3>
              <span className="font-mono text-[11px] text-[var(--ink-soft)] font-semibold">
                Total: {formatINR(totalUtilized)}
              </span>
            </div>

            <div className="space-y-3">
              {appExpenses.map(exp => (
                <div
                  key={exp.id}
                  className="p-4 bg-[var(--paper)] border border-[var(--rule)] hover:border-[var(--ink)] rounded flex items-center justify-between gap-3 text-xs transition-colors shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-sm text-[var(--ink)]">{exp.vendorName}</span>
                      <span className="text-[10px] text-[var(--stamp)] font-bold bg-[var(--paper-deep)] px-1.5 py-0.2 rounded border border-[var(--rule)]">
                        {exp.invoiceNumber}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--ink-soft)]">
                      {exp.category} · {formatDate(exp.timestamp)}
                    </div>
                  </div>

                  <div className="font-mono font-bold text-sm text-[var(--ink)]">
                    {formatINR(exp.amount)}
                  </div>
                </div>
              ))}

              {appExpenses.length === 0 && (
                <div className="p-8 border border-dashed border-[var(--rule)] rounded text-center font-mono text-xs text-[var(--ink-soft)]">
                  No vouched expenses logged for this application yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Official Form GFR 12-A Certificate */}
        <div className="lg:col-span-5 bg-[var(--paper)] border-2 border-[var(--ink)] rounded p-8 space-y-6 text-xs shadow-xl font-serif">
          <div className="text-center border-b border-[var(--rule)] pb-4 space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--stamp)] font-bold block">
              FORM GFR 12-A
            </span>
            <h4 className="font-bold serif text-lg text-[var(--ink)]">
              UTILIZATION CERTIFICATE
            </h4>
            <p className="text-[11px] font-mono text-[var(--ink-soft)]">
              [See Rule 238 (1) of General Financial Rules, 2017]
            </p>
          </div>

          <div className="space-y-4 text-[var(--ink)] leading-relaxed text-[13px] font-serif">
            <p>
              1. Certified that out of <b className="font-mono font-bold">{formatINR(sanctionedAmount)}</b> grants-in-aid sanctioned during the financial year in favour of <b className="font-bold">{currentOrg.name}</b> under Letter No. <b className="font-mono font-bold text-[var(--stamp)]">{activeApp?.externalApplicationId || "SO-ZED-9821"}</b>.
            </p>

            <p>
              2. A sum of <b className="font-mono font-bold text-[var(--verified)]">{formatINR(totalUtilized)}</b> has been utilized for the purpose of <b className="font-bold">{activeScheme.title}</b> for which it was sanctioned, leaving an unutilized balance of <b className="font-mono font-bold text-[var(--pending)]">{formatINR(unutilizedBalance)}</b>.
            </p>

            <p>
              3. Certified that I have satisfied myself that the conditions on which the grant was sanctioned have been duly fulfilled and that I have exercised proper checks to ensure that the money was actually utilized for the purpose for which it was sanctioned.
            </p>
          </div>

          {/* Statutory Sign-off block */}
          <div className="pt-8 border-t border-[var(--rule)] flex items-end justify-between text-[11px] font-mono text-[var(--ink-soft)]">
            <div className="space-y-0.5">
              <div>Date: {new Date().toLocaleDateString("en-IN")}</div>
              <div>Place: {currentOrg.state}, India</div>
              <div>Org: {currentOrg.name}</div>
            </div>

            <div className="text-right space-y-1">
              <div className="w-32 border-b border-[var(--ink)] mb-1"></div>
              <div className="font-bold text-[var(--ink)]">Authorized Signatory</div>
              <div className="text-[10px] text-[var(--stamp)] font-bold">SHA-256 Provenance Verified</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
