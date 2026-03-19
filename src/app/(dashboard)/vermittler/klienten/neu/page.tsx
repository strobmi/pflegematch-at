import KlientForm from "@/components/dashboard/klienten/KlientForm";
import { createKlient } from "../actions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Klient hinzufügen · pflegematch" };

export default function NeuerKlientPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vermittler/klienten" className="p-1.5 text-[#2D2D2D]/40 hover:text-[#2D2D2D] hover:bg-white rounded-lg transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Klient hinzufügen</h1>
      </div>
      <KlientForm onSubmit={createKlient} />
    </div>
  );
}
