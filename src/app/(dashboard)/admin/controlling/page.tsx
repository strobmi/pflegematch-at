import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import ContractsTable from "@/components/dashboard/admin/ContractsTable";
import type { ContractRow } from "@/components/dashboard/admin/ContractsTable";

export const metadata = { title: "Controlling · pflegematch" };

export default async function ControllingPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const [contractsRaw, tenants] = await Promise.all([
    prisma.contract.findMany({
      include: {
        tenant:          { select: { name: true } },
        caregiverProfile: { select: { user: { select: { name: true, email: true } } } },
        clientProfile:   { select: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tenant.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const contracts: ContractRow[] = contractsRaw.map((c) => ({
    id:               c.id,
    status:           c.status as ContractRow["status"],
    startDate:        c.startDate.toISOString(),
    matchFeeAmount:   c.matchFeeAmount   != null ? Number(c.matchFeeAmount)   : null,
    monthlyFeeAmount: c.monthlyFeeAmount != null ? Number(c.monthlyFeeAmount) : null,
    tenant:           c.tenant,
    caregiverProfile: c.caregiverProfile,
    clientProfile:    c.clientProfile,
  }));

  const activeContracts    = contracts.filter((c) => c.status === "ACTIVE");
  const terminatedContracts = contracts.filter((c) => c.status === "TERMINATED");

  const totalMonthlyRevenue = activeContracts.reduce(
    (sum, c) => sum + (c.monthlyFeeAmount ?? 0), 0
  );

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear  = new Date(now.getFullYear(), 0, 1);

  const matchFeesMTD = contractsRaw
    .filter((c) => c.matchFeeAmount && new Date(c.createdAt) >= startOfMonth)
    .reduce((sum, c) => sum + Number(c.matchFeeAmount), 0);

  const matchFeesYTD = contractsRaw
    .filter((c) => c.matchFeeAmount && new Date(c.createdAt) >= startOfYear)
    .reduce((sum, c) => sum + Number(c.matchFeeAmount), 0);

  // Group by tenant
  const tenantStats = tenants.map((t) => {
    const tc  = contracts.filter((c) => c.tenant.name === t.name);
    const tac = tc.filter((c) => c.status === "ACTIVE");
    const monthlyTotal = tac.reduce((s, c) => s + (c.monthlyFeeAmount ?? 0), 0);
    const matchTotal   = tc.reduce((s, c)  => s + (c.matchFeeAmount   ?? 0), 0);
    return { name: t.name, activeCount: tac.length, monthlyTotal, matchTotal };
  }).filter((t) => t.activeCount > 0 || t.matchTotal > 0);

  const kpis = [
    { label: "Verträge gesamt",           value: contracts.length,                      suffix: "",    color: "text-white" },
    { label: "Aktive Verträge",           value: activeContracts.length,                suffix: "",    color: "text-[#A8C5A8]" },
    { label: "Gekündigte Verträge",       value: terminatedContracts.length,            suffix: "",    color: "text-red-400" },
    { label: "Laufende Monatspauschalen", value: `€${totalMonthlyRevenue.toFixed(2)}`,  suffix: "/Mo", color: "text-[#C06B4A]" },
    { label: "Matchgebühren MTD",         value: `€${matchFeesMTD.toFixed(2)}`,         suffix: "",    color: "text-white" },
    { label: "Matchgebühren YTD",         value: `€${matchFeesYTD.toFixed(2)}`,         suffix: "",    color: "text-white" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-5 h-5 text-[#C06B4A]" />
        <div>
          <h1 className="text-2xl font-bold text-white">Controlling</h1>
          <p className="text-sm text-white/50 mt-0.5">Umsatz & Vertragsübersicht</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {kpis.map(({ label, value, suffix, color }) => (
          <div key={label} className="bg-white/5 rounded-2xl border border-white/10 px-5 py-4">
            <p className="text-xs font-medium text-white/40 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>
              {value}{suffix}
            </p>
          </div>
        ))}
      </div>

      {/* Per-Tenant Breakdown */}
      {tenantStats.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">Nach Tenant</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Tenant</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Akt. Verträge</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Monatspauschalen</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/40 uppercase tracking-wide">Matchgebühren (ges.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {tenantStats.map((t) => (
                  <tr key={t.name} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{t.name}</td>
                    <td className="px-4 py-3 text-right text-[#A8C5A8] font-semibold">{t.activeCount}</td>
                    <td className="px-4 py-3 text-right text-[#C06B4A] font-semibold">€{t.monthlyTotal.toFixed(2)}/Mo</td>
                    <td className="px-4 py-3 text-right text-white/60">€{t.matchTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Contracts Table */}
      <ContractsTable contracts={contracts} />
    </div>
  );
}
