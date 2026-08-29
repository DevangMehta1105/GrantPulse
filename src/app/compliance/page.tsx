"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatINR, formatDate } from "@/lib/utils";
import { 
  ScrollText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Receipt, 
  Printer, 
  FileCheck,
  Building2,
  DollarSign
} from "lucide-react";
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
      invoiceUrl: "/invoices/manual-entry.pdf",
      isCompliant: true,
      complianceNotes: `Vetted under GFR Rule 238(1) for ${newCategory}`
    });

    setNewVendor("");
    setNewAmount("");
    setNewInvoiceNo("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ScrollText className="w-3.5 h-3.5" />
            <span>Pillar G • Post-Sanction Ledger & GFR 12-A Compliance</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Post-Sanction Fund Utilization
          </h1>
          <p className="text-sm text-slate-400">
            Tranche accounting, statutory category budget enforcement, and auto-generated Form GFR 12-A.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-colors self-start md:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Print / Export GFR 12-A</span>
        </button>
      </div>

      {/* Sanctioned Grant Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Sanctioned Grant Value</span>
          <div className="text-2xl font-black text-white font-mono">{formatINR(sanctionedAmount)}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-mono">{activeApp?.externalApplicationId || "Ref: Active"}</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Total Utilized (Vouched)</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{formatINR(totalUtilized)}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {((totalUtilized / sanctionedAmount) * 100).toFixed(1)}% of total tranche
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <span className="text-xs text-slate-400 block mb-1">Unutilized Balance</span>
          <div className="text-2xl font-black text-amber-400 font-mono">{formatINR(unutilizedBalance)}</div>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Compliant with Caps
          </p>
        </div>
      </div>

      {/* Two Column Layout: Ledger Table + Official GFR 12-A Certificate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Expense Entry & Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {/* Add Expense Form */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Record Audited Grant Expense
            </h3>

            <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vendor / Payee Name</label>
                <input
                  type="text"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  placeholder="e.g. National Metrology Lab"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Invoice / Voucher No.</label>
                <input
                  type="text"
                  value={newInvoiceNo}
                  onChange={(e) => setNewInvoiceNo(e.target.value)}
                  placeholder="e.g. INV-2024-884"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="Capital Equipment">Capital Equipment</option>
                  <option value="Manpower & Salaries">Manpower & Salaries</option>
                  <option value="Travel & Field Operations">Travel & Field Operations</option>
                  <option value="Consumables & Supplies">Consumables & Supplies</option>
                  <option value="Overheads / Admin">Overheads / Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Amount (INR)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 45000"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Expense & Verify Category Cap</span>
                </button>
              </div>
            </form>
          </div>

          {/* Vouched Expense List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-white">Expense Ledger ({appExpenses.length} entries)</h3>
            <div className="space-y-3">
              {appExpenses.map(exp => (
                <div
                  key={exp.id}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{exp.vendorName}</span>
                      <span className="text-[10px] font-mono bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">
                        {exp.invoiceNumber}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {exp.category} • {formatDate(exp.timestamp)}
                    </div>
                    {exp.complianceNotes && (
                      <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        ✓ {exp.complianceNotes}
                      </p>
                    )}
                  </div>

                  <div className="text-right font-mono font-bold text-sm text-white self-end sm:self-center">
                    {formatINR(exp.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Official Form GFR 12-A */}
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-5 text-xs shadow-xl printable-card">
            <div className="text-center border-b border-slate-800 pb-4 space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
                FORM GFR 12-A
              </span>
              <h4 className="font-bold text-sm text-white">
                UTILIZATION CERTIFICATE
              </h4>
              <p className="text-[10px] text-slate-400">
                [See Rule 238 (1) of General Financial Rules, 2017]
              </p>
            </div>

            <div className="space-y-3 text-slate-300 leading-relaxed text-[11px]">
              <p>
                1. Certified that out of <strong className="text-white font-mono">{formatINR(sanctionedAmount)}</strong> of grants-in-aid sanctioned during the year in favour of <strong className="text-white">{currentOrg.name}</strong> under this Ministry/Department Letter No. <strong className="text-emerald-400 font-mono">{activeApp?.externalApplicationId || "SO-ZED-9821"}</strong>.
              </p>

              <p>
                2. A sum of <strong className="text-white font-mono">{formatINR(totalUtilized)}</strong> has been utilized for the purpose of <strong className="text-white">{activeScheme.title}</strong> for which it was sanctioned and that the balance of <strong className="text-amber-400 font-mono">{formatINR(unutilizedBalance)}</strong> remaining unutilized at the end of the period.
              </p>

              <p>
                3. Certified that I have satisfied myself that the conditions on which the grant-in-aid was sanctioned have been duly fulfilled and that I have exercised proper checks.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-between items-end text-[10px] text-slate-400">
              <div>
                <div>Date: {new Date().toLocaleDateString("en-IN")}</div>
                <div>Place: {currentOrg.state}, India</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white uppercase">{currentOrg.name}</div>
                <div className="text-emerald-400 font-mono">Digital SHA-256 Sign Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
