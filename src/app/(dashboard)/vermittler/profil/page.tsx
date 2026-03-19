import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { User, Building2, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const metadata = { title: "Mein Profil · pflegematch" };

export default async function VermittlerProfilPage() {
  const session = await requireTenantSession();

  const [user, tenant] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, createdAt: true, role: true },
    }),
    prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { name: true, slug: true, email: true, phone: true, address: true, createdAt: true },
    }),
  ]);

  if (!user || !tenant) return null;

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "??";

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <div>
        <h1 className="text-2xl font-bold text-[#2D2D2D]">Mein Profil</h1>
        <p className="text-sm text-[#2D2D2D]/50 mt-0.5">Kontoinformationen</p>
      </div>

      {/* User card */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-[#C06B4A] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-lg font-bold text-[#2D2D2D]">{user.name ?? "–"}</p>
            <p className="text-sm text-[#2D2D2D]/50">Vermittler-Admin</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
            <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">E-Mail</span>
            <span className="text-[#2D2D2D] font-medium">{user.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
            <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">Dabei seit</span>
            <span className="text-[#2D2D2D] font-medium">
              {format(new Date(user.createdAt), "dd. MMMM yyyy", { locale: de })}
            </span>
          </div>
        </div>
      </div>

      {/* Tenant card */}
      <div className="bg-white rounded-2xl border border-[#EAD9C8] p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-[#C06B4A]" />
          <h2 className="text-sm font-semibold text-[#2D2D2D]/70 uppercase tracking-wide">Organisation</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
            <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">Name</span>
            <span className="text-[#2D2D2D] font-medium">{tenant.name}</span>
          </div>
          {tenant.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
              <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">E-Mail</span>
              <span className="text-[#2D2D2D] font-medium">{tenant.email}</span>
            </div>
          )}
          {tenant.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
              <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">Telefon</span>
              <span className="text-[#2D2D2D] font-medium">{tenant.phone}</span>
            </div>
          )}
          {tenant.address && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-[#C06B4A] flex-shrink-0" />
              <span className="text-[#2D2D2D]/60 w-20 flex-shrink-0">Adresse</span>
              <span className="text-[#2D2D2D] font-medium">{tenant.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
