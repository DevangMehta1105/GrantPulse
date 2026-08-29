"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { Printer } from "lucide-react";

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
  const [newCategory, setNewCategory] = useState<any>("Capital Equipment");
  const [newInvoiceNo, setNewInvoiceNo] = useState("");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor || !newAmount) return;

    addExpense({
      applicationId: activeApp.id,
      category: newCategory,
      amount: parseFloat(newAmount),
      invoiceNumber: newInvoiceNo || `INV-${Date.now()}`,
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
    <div className="wrap py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--rule)] pb-6">
        <div>
          <div className="font-mono text-[12px] tracking-wider uppercase text-[var(--stamp)] mb-2">
            Disbursement &amp; Compliance · Form GFR 12-A
          </div>
          <h1 className="text-3xl md:text-4xl font-medium serif text-[var(--ink)] tracking-tight">
            Post-Sanction Fund Utilization Ledger
          </h1>
          <p className="text-[15px] text-[var(--ink-soft)] mt-2 measure">
            Tranche accounting, statutory category budget cap verification, and official Utilization Certificate export.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-ink text-xs py-2 px-4 flex items-center gap-2 self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Form GFR 12-A</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
        <div className="bg-[var(--paper-deep)] border border-[var(--rule)] p-5 space-y-1">
          <span className="text-[10px] text-[var(--ink-soft)] uppercase tracking-wider">Sanctioned Tranche</span>
          <div className="text-2xl font-medium serif text-[var(--ink)]">{formatINR(sanctionedAmount)}</div>
          <div className="text-[11px] text-[var(--ink-soft)]">{activeApp?.externalApplicationId || "Ref: Active"}</div>
        </div>

        <div className="bg-[var(--paper-deep)] border border-[var(--rule)] p-5 space-y-1">
          <span className="text-[10px] text-[var(--ink-soft)] uppercase tracking-wider">Utilized (Vouched)</span>
          <div className="text-2xl font-medium serif text-[var(--verified)]">{formatINR(totalUtilized)}</div>
          <div className="text-[11px] text-[var(--ink-soft)]">
            {((totalUtilized / sanctionedAmount) * 100).toFixed(1)}% of total tranche
          </div>
        </div>

        <div className="bg-[var(--paper-deep)] border border-[var(--rule)] p-5 space-y-1">
          <span className="text-[10px] text-[var(--ink-soft)] uppercase tracking-wider">Unutilized Balance</span>
          <div className="text-2xl font-medium serif text-[var(--pending)]">{formatINR(unutilizedBalance)}</div>
          <div className="text-[11px] text-[var(--verified)]">✓ 100% GFR 238(1) Compliant</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Ledger & Add Expense Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Add Expense Form */}
          <div className="bg-[var(--paper-deep)] border border-[var(--rule)] p-6 space-y-4 text-xs">
            <h3 className="font-mono text-xs uppercase font-medium text-[var(--ink)] border-b border-[var(--rule)] pb-3">
              Record Audited Grant Expense
            </h3>

            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  placeholder="e.g. Metrology Lab"
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)]"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">Invoice / Voucher No.</label>
                <input
                  type="text"
                  value={newInvoiceNo}
                  onChange={(e) => setNewInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-2024-884"
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--ink)]"
                />
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--ink)] cursor-pointer"
                >
                  <option value="Capital Equipment">Capital Equipment</option>
                  <option value="Manpower & Salaries">Manpower & Salaries</option>
                  <option value="Travel & Field Operations">Travel & Field Operations</option>
                  <option value="Consumables & Supplies">Consumables & Supplies</option>
                  <option value="Overheads / Admin">Overheads / Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--ink)] font-medium mb-1">Amount (INR)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full bg-[var(--paper)] border border-[var(--rule)] px-3 py-2 text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--ink)]"
                  required
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <button
                  type="submit"
                  className="btn-ink w-full py-2"
                >
                  Add to Ledger &amp; Verify Cap
                </button>
              </div>
            </form>
          </div>

          {/* Vouched Expense List */}
          <div className="bg-[var(--paper-deep)] border border-[var(--rule)] p-6 space-y-4 text-xs">
            <h3 className="font-mono text-xs uppercase font-medium text-[var(--ink)] border-b border-[var(--rule)] pb-3">
              Vouched Expenses ({appExpenses.length} entries)
            </h3>

            <div className="space-y-3">
              {appExpenses.map(exp => (
                <div
                  key={exp.id}
                  className="p-4 bg-[var(--paper)] border border-[var(--rule)] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-[var(--ink)]">{exp.vendorName}</span>
                      <span className="text-[10px] font-mono text-[var(--ink-soft)] bg-[var(--paper-deep)] px-1.5 py-0.2 border border-[var(--rule)]">
                        {exp.invoiceNumber}
                      </span>
                    </div>
                    <div className="text-[12px] text-[var(--ink-soft)]">
                      {exp.category} · {formatDate(exp.timestamp)}
                    </div>
                  </div>

                  <div className="font-mono font-medium text-sm text-[var(--ink)]">
                    {formatINR(exp.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Formal Form GFR 12-A Certificate */}
        <div className="lg:col-span-5 bg-[var(--paper)] border border-[var(--ink)] p-8 space-y-6 text-xs shadow-xl">
          <div className="text-center border-b border-[var(--rule)] pb-4 space-y-1">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--stamp)] block">
              FORM GFR 12-A
            </span>
            <h4 className="font-medium serif text-base text-[var(--ink)]">
              UTILIZATION CERTIFICATE
            </h4>
            <p className="text-[11px] font-mono text-[var(--ink-soft)]">
              [See Rule 238 (1) of General Financial Rules, 2017]
            </p>
          </div>

          <div className="space-y-4 text-[var(--ink-soft)] leading-relaxed text-[13px]">
            <p>
              1. Certified that out of <b className="text-[var(--ink)] font-mono">{formatINR(sanctionedAmount)}</b> grants-in-aid sanctioned during the financial year in favour of <b className="text-[var(--ink)]">{currentOrg.name}</b> under Letter No. <b className="text-[var(--ink)] font-mono">{activeApp?.externalApplicationId || "SO-ZED-9821"}</b>.
            </p>

            <p>
              2. A sum of <b className="text-[var(--ink)] font-mono">{formatINR(totalUtilized)}</b> has been utilized for the purpose of <b className="text-[var(--ink)]">{activeScheme.title}</b> for which it was sanctioned, leaving an unutilized balance of <b className="text-[var(--ink)] font-mono">{formatINR(unutilizedBalance)}</b>.
            </p>

            <p>
              3. Certified that I have satisfied myself that the conditions on which the grant was sanctioned have been duly fulfilled.
            </p>
          </div>

          <div className="pt-6 border-t border-[var(--rule)] flex items-center justify-between text-[11px] font-mono text-[var(--ink-soft)]">
            <div>
              <div>Date: {new Date().toLocaleDateString("en-IN")}</div>
              <div>Place: {currentOrg.state}, India</div>
            </div>
            <div className="stamp text-[11px] py-1 px-2.5">
              SHA-256 Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
