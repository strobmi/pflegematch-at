import { requireSession } from "@/lib/tenant";

export const metadata = { title: "Mein Bereich · pflegematch" };

export default async function KundeDashboard() {
  const session = await requireSession();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">Willkommen, {session.name}</h1>
      <p className="text-[#2D2D2D]/55 mb-8">Hier sehen Sie Ihre Pflegematches und Anfragen.</p>
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-[#2D2D2D]/40">
        Sobald Ihr Vermittler einen Match für Sie erstellt hat, erscheint er hier.
      </div>
    </div>
  );
}
