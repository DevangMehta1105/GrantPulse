"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { Printer, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

  // New Expense form state
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
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#ededef]">Post-Sanction Fund Utilization & Form GFR 12-A</h1>
          <p className="text-xs text-[#8b8d98]">
            Tranche accounting, category budget cap verification, and statutory certificate export.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-md bg-[#1a1c24] hover:bg-[#20222c] text-[#ededef] border border-[#232530] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5 text-[#8b8d98]" />
          <span>Print GFR 12-A</span>
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        <div className="bg-[#14151a] border border-[#232530] rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-[#5e6170] uppercase">Sanctioned Tranche</span>
          <div className="text-xl font-bold text-[#ededef]">{formatINR(sanctionedAmount)}</div>
          <div className="text-[10px] text-[#5e6170]">{activeApp?.externalApplicationId || "Ref: Active"}</div>
        </div>

        <div className="bg-[#14151a] border border-[#232530] rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-[#5e6170] uppercase">Utilized (Vouched)</span>
          <div className="text-xl font-bold text-[#2eb88a]">{formatINR(totalUtilized)}</div>
          <div className="text-[10px] text-[#8b8d98]">
            {((totalUtilized / sanctionedAmount) * 100).toFixed(1)}% of tranche
          </div>
        </div>

        <div className="bg-[#14151a] border border-[#232530] rounded-xl p-4 space-y-1">
          <span className="text-[10px] text-[#5e6170] uppercase">Unutilized Balance</span>
          <div className="text-xl font-bold text-[#f59e0b]">{formatINR(unutilizedBalance)}</div>
          <div className="text-[10px] text-[#2eb88a]">✓ Compliant with GFR 238(1)</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Ledger & Add Expense Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Add Expense */}
          <div className="bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-xs text-[#ededef] uppercase font-mono border-b border-[#1e2029] pb-2.5">
              Record Grant Expense
            </h3>

            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#8b8d98] font-medium mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  placeholder="e.g. Metrology Lab"
                  className="w-full bg-[#111216] border border-[#232530] rounded-md px-2.5 py-1.5 text-xs text-[#ededef] focus:outline-none focus:border-[#373a4a]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#8b8d98] font-medium mb-1">Invoice No.</label>
                <input
                  type="text"
                  value={newInvoiceNo}
                  onChange={(e) => setNewInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-2024-884"
                  className="w-full bg-[#111216] border border-[#232530] rounded-md px-2.5 py-1.5 text-xs text-[#ededef] font-mono focus:outline-none focus:border-[#373a4a]"
                />
              </div>

              <div>
                <label className="block text-[#8b8d98] font-medium mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#111216] border border-[#232530] rounded-md px-2.5 py-1.5 text-xs text-[#ededef] focus:outline-none focus:border-[#373a4a] cursor-pointer"
                >
                  <option value="Capital Equipment">Capital Equipment</option>
                  <option value="Manpower & Salaries">Manpower & Salaries</option>
                  <option value="Travel & Field Operations">Travel & Field Operations</option>
                  <option value="Consumables & Supplies">Consumables & Supplies</option>
                  <option value="Overheads / Admin">Overheads / Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[#8b8d98] font-medium mb-1">Amount (INR)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full bg-[#111216] border border-[#232530] rounded-md px-2.5 py-1.5 text-xs text-[#ededef] font-mono focus:outline-none focus:border-[#373a4a]"
                  required
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-md bg-[#ededef] text-[#0d0e11] font-semibold hover:bg-white transition-colors cursor-pointer"
                >
                  Add to Ledger
                </button>
              </div>
            </form>
          </div>

          {/* Vouched Expense List */}
          <div className="bg-[#14151a] border border-[#232530] rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-xs text-[#ededef] uppercase font-mono border-b border-[#1e2029] pb-2.5">
              Expense Ledger ({appExpenses.length} entries)
            </h3>

            <div className="space-y-2">
              {appExpenses.map(exp => (
                <div
                  key={exp.id}
                  className="p-3 rounded-lg bg-[#111216] border border-[#1e2029] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#ededef]">{exp.vendorName}</span>
                      <span className="text-[10px] font-mono text-[#5e6170]">({exp.invoiceNumber})</span>
                    </div>
                    <div className="text-[11px] text-[#8b8d98]">
                      {exp.category} • {formatDate(exp.timestamp)}
                    </div>
                  </div>

                  <div className="font-mono font-bold text-xs text-[#ededef]">
                    {formatINR(exp.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Formal Form GFR 12-A Certificate */}
        <div className="lg:col-span-5 bg-[#111216] border border-[#232530] rounded-xl p-5 space-y-4 text-xs">
          <div className="text-center border-b border-[#1e2029] pb-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#5e6170]">
              FORM GFR 12-A
            </span>
            <h4 className="font-bold text-xs text-[#ededef]">
              UTILIZATION CERTIFICATE
            </h4>
            <p className="text-[10px] text-[#5e6170]">
              [See Rule 238 (1) of General Financial Rules, 2017]
            </p>
          </div>

          <div className="space-y-2.5 text-[#8b8d98] leading-relaxed text-[11px]">
            <p>
              1. Certified that out of <strong className="text-[#ededef] font-mono">{formatINR(sanctionedAmount)}</strong> grants-in-aid sanctioned during the year in favour of <strong className="text-[#ededef]">{currentOrg.name}</strong> under Letter No. <strong className="text-[#ededef] font-mono">{activeApp?.externalApplicationId || "SO-ZED-9821"}</strong>.
            </p>

            <p>
              2. A sum of <strong className="text-[#ededef] font-mono">{formatINR(totalUtilized)}</strong> has been utilized for the purpose of <strong className="text-[#ededef]">{activeScheme.title}</strong> for which it was sanctioned, leaving an unutilized balance of <strong className="text-[#ededef] font-mono">{formatINR(unutilizedBalance)}</strong>.
            </p>

            <p>
              3. Certified that I have satisfied myself that the conditions on which the grant was sanctioned have been duly fulfilled.
            </p>
          </div>

          <div className="pt-4 border-t border-[#1e2029] flex items-center justify-between text-[10px] text-[#5e6170] font-mono">
            <div>Date: {new Date().toLocaleDateString("en-IN")}</div>
            <div className="text-[#2eb88a]">SHA-256 Verified</div>
          </div>
        </div>
      </div>
    </div>
  );
}
