import { requireSession } from "@/lib/tenant";

export const metadata = { title: "Meine Matches · pflegematch" };

export default async function PflegerDashboard() {
  const session = await requireSession();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">Willkommen, {session.name}</h1>
      <p className="text-[#2D2D2D]/55 mb-8">Hier sehen Sie Ihre aktuellen Einsätze und Matches.</p>
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-8 text-center text-[#2D2D2D]/40">
        Ihre Matches werden hier angezeigt sobald ein Vermittler Sie einem Klienten zugeordnet hat.
      </div>
    </div>
  );
}
