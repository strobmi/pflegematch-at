import { requireSession } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Mail, Calendar, Shield } from "lucide-react";
import EmailChangeForm from "@/components/dashboard/EmailChangeForm";
import PasswordChangeForm from "@/components/dashboard/PasswordChangeForm";

export const metadata = { title: "Mein Profil · pflegematch Admin" };

export default async function AdminProfilPage() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { email: true, name: true, createdAt: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-2">
      <div>
        <h1 className="text-2xl font-bold text-white">Mein Profil</h1>
        <p className="text-sm text-white/50 mt-0.5">Account-Einstellungen</p>
      </div>

      {/* Konto-Übersicht */}
      <div className="bg-white/10 rounded-2xl border border-white/10 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wide">Mein Konto</h2>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
          <span className="text-white/50 w-24 flex-shrink-0">Rolle</span>
          <span className="text-white font-medium">Superadmin</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
          <span className="text-white/50 w-24 flex-shrink-0">E-Mail</span>
          <span className="text-white font-medium">{user.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
          <span className="text-white/50 w-24 flex-shrink-0">Dabei seit</span>
          <span className="text-white font-medium">
            {format(new Date(user.createdAt), "dd. MMMM yyyy", { locale: de })}
          </span>
        </div>
      </div>

      {/* E-Mail ändern */}
      <EmailChangeForm currentEmail={user.email} />

      {/* Passwort ändern */}
      <PasswordChangeForm />
    </div>
  );
}
