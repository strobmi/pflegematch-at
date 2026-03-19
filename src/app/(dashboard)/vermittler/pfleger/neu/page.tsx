import PflegerForm from "@/components/dashboard/pfleger/PflegerForm";
import { createPfleger } from "../actions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Pflegekraft hinzufügen · pflegematch" };

export default function NeuePflegekraftPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/vermittler/pfleger"
          className="p-1.5 text-[#2D2D2D]/40 hover:text-[#2D2D2D] hover:bg-white rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Pflegekraft hinzufügen</h1>
      </div>
      <PflegerForm onSubmit={createPfleger} />
    </div>
  );
}
