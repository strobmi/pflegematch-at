import { requireSession } from "@/lib/tenant";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import VermittlerForm from "@/components/dashboard/admin/VermittlerForm";
import { createVermittler } from "../actions";

export const metadata = { title: "Vermittler anlegen · Admin · pflegematch" };

export default async function NeuerVermittlerPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/tenants"
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Vermittler anlegen</h1>
      </div>

      <VermittlerForm onSubmit={createVermittler} />
    </div>
  );
}
