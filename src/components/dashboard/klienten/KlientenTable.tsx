"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deleteKlient } from "@/app/(dashboard)/vermittler/klienten/actions";
import type { ClientProfile, User } from "@prisma/client";

type KlientWithUser = ClientProfile & { user: Pick<User, "id" | "name" | "email"> };

const STUFE_LABELS: Record<string, string> = {
  STUFE_1: "Stufe 1", STUFE_2: "Stufe 2", STUFE_3: "Stufe 3",
  STUFE_4: "Stufe 4", STUFE_5: "Stufe 5",
};

export default function KlientenTable({ data }: { data: KlientWithUser[] }) {
  async function handleDelete(id: string) {
    if (!confirm("Klient wirklich löschen?")) return;
    await deleteKlient(id);
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAD9C8] bg-[#FAF6F1]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Stadt</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Pflegegeld</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Benötigte Skills</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAD9C8]">
            {data.map((k) => (
              <tr key={k.id} className="hover:bg-[#FAF6F1] transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#2D2D2D]">{k.user.name}</div>
                  <div className="text-xs text-[#2D2D2D]/45">{k.user.email}</div>
                </td>
                <td className="px-4 py-3 text-[#2D2D2D]/70 hidden md:table-cell">
                  {k.locationCity ?? "–"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {k.pflegegeldStufe ? (
                    <span className="bg-[#F5EDE3] text-[#C06B4A] text-xs font-medium px-2 py-0.5 rounded-full">
                      {STUFE_LABELS[k.pflegegeldStufe]}
                    </span>
                  ) : "–"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {k.requiredSkills.slice(0, 2).map((s) => (
                      <span key={s} className="bg-[#F0F7F0] text-[#5A7A5A] text-xs px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                    {k.requiredSkills.length > 2 && (
                      <span className="text-xs text-[#2D2D2D]/40">+{k.requiredSkills.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${k.isActive ? "text-[#5A7A5A]" : "text-[#2D2D2D]/40"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${k.isActive ? "bg-[#7B9E7B]" : "bg-[#D4B896]"}`} />
                    {k.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Link
                      href={`/vermittler/klienten/${k.id}/bearbeiten`}
                      className="p-1.5 text-[#2D2D2D]/40 hover:text-[#C06B4A] hover:bg-[#F5EDE3] rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(k.id)}
                      className="p-1.5 text-[#2D2D2D]/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
