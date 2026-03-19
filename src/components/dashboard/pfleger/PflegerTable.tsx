"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { deletePfleger } from "@/app/(dashboard)/vermittler/pfleger/actions";
import type { CaregiverProfile, User } from "@prisma/client";

type PflegerWithUser = CaregiverProfile & { user: Pick<User, "id" | "name" | "email"> };

const AVAILABILITY_LABELS: Record<string, string> = {
  FULL_TIME: "Vollzeit",
  PART_TIME: "Teilzeit",
  HOURLY:    "Stundenweise",
  LIVE_IN:   "24h",
};

export default function PflegerTable({ data }: { data: PflegerWithUser[] }) {
  async function handleDelete(id: string) {
    if (!confirm("Pflegekraft wirklich löschen?")) return;
    await deletePfleger(id);
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EAD9C8] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EAD9C8] bg-[#FAF6F1]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden md:table-cell">Stadt</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Verfügbarkeit</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide hidden lg:table-cell">Skills</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#2D2D2D]/50 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAD9C8]">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-[#FAF6F1] transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#2D2D2D]">{p.user.name}</div>
                  <div className="text-xs text-[#2D2D2D]/45">{p.user.email}</div>
                </td>
                <td className="px-4 py-3 text-[#2D2D2D]/70 hidden md:table-cell">
                  {p.locationCity ?? "–"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="bg-[#F5EDE3] text-[#C06B4A] text-xs font-medium px-2 py-0.5 rounded-full">
                    {AVAILABILITY_LABELS[p.availability] ?? p.availability}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {p.skills.slice(0, 2).map((s) => (
                      <span key={s} className="bg-[#F0F7F0] text-[#5A7A5A] text-xs px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                    {p.skills.length > 2 && (
                      <span className="text-xs text-[#2D2D2D]/40">+{p.skills.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    p.isActive ? "text-[#5A7A5A]" : "text-[#2D2D2D]/40"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-[#7B9E7B]" : "bg-[#D4B896]"}`} />
                    {p.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <Link
                      href={`/vermittler/pfleger/${p.id}/bearbeiten`}
                      className="p-1.5 text-[#2D2D2D]/40 hover:text-[#C06B4A] hover:bg-[#F5EDE3] rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id)}
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
