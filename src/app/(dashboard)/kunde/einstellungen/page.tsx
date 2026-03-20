import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Mail, Calendar } from "lucide-react";
import EmailChangeForm from "@/components/dashboard/EmailChangeForm";
import KundeProfilForm from "@/components/dashboard/kunde/KundeProfilForm";

export const metadata = { title: "Einstellungen · pflegematch" };

export default async function KundeEinstellungenPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, name: true, createdAt: true },
  });

  if (!user) redirect("/login");

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });

  const profileDefaults = profile ? {
    name: user.name ?? "",
    careNeedsDescription: profile.careNeedsDescription ?? "",
    pflegegeldStufe: profile.pflegegeldStufe ?? undefined,
    requiredSkills: profile.requiredSkills,
    preferredLanguages: profile.preferredLanguages,
    locationPostal: profile.locationPostal ?? "",
    locationCity: profile.locationCity ?? "",
    locationState: profile.locationState ?? "",
    addressStreet: profile.addressStreet ?? "",
    addressCountry: profile.addressCountry ?? "",
    iban: profile.iban ?? "",
    bic: profile.bic ?? "",
    bankAccountHolder: profile.bankAccountHolder ?? "",
    emergencyContactName: profile.emergencyContactName ?? "",
    emergencyContactPhone: profile.emergencyContactPhone ?? "",
  } : { name: user.name ?? "" };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-2">
      <div>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Einstellungen</h1>
        <p className="text-sm text-[#2D2D2D]/50 mt-0.5">Mein Profil &amp; Kontoinformationen</p>
      </div>

      {/* Konto-Übersicht */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[#2D2D2D]/70 uppercase tracking-wide">Mein Konto</h2>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
          <span className="text-[#2D2D2D]/60 w-24 flex-shrink-0">E-Mail</span>
          <span className="text-[#2D2D2D] font-medium">{user.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
          <span className="text-[#2D2D2D]/60 w-24 flex-shrink-0">Dabei seit</span>
          <span className="text-[#2D2D2D] font-medium">
            {format(new Date(user.createdAt), "dd. MMMM yyyy", { locale: de })}
          </span>
        </div>
      </div>

      {/* E-Mail ändern */}
      <EmailChangeForm currentEmail={user.email} />

      {/* Profil vervollständigen */}
      {profile && <KundeProfilForm defaultValues={profileDefaults} />}
    </div>
  );
}
