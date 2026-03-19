import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import AnfrageCreateForm from "@/components/dashboard/vermittler/AnfrageCreateForm";

export const metadata = { title: "Neue Anfrage · pflegematch" };

export default function NeueAnfragePage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/vermittler/anfragen"
          className="p-1.5 text-[#2D2D2D]/40 hover:text-[#2D2D2D] hover:bg-white rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Neue Anfrage</h1>
      </div>
      <AnfrageCreateForm />
    </div>
  );
}
