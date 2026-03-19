import { prisma } from "@/lib/prisma";
import { requireTenantSession } from "@/lib/tenant";
import { notFound } from "next/navigation";
import PflegerForm from "@/components/dashboard/pfleger/PflegerForm";
import { updatePfleger } from "../../actions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Pflegekraft bearbeiten · pflegematch" };

export default async function BearbeitenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireTenantSession();

  const profile = await prisma.caregiverProfile.findFirst({
    where: { id, tenantId: session.tenantId },
    include: { user: true },
  });
  if (!profile) notFound();

  const defaultValues = {
    name: profile.user.name ?? "",
    email: profile.user.email,
    bio: profile.bio ?? "",
    skills: profile.skills,
    qualifications: profile.qualifications,
    languages: profile.languages,
    availability: profile.availability,
    locationCity: profile.locationCity ?? "",
    locationState: profile.locationState ?? "",
    isActive: profile.isActive,
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/vermittler/pfleger"
          className="p-1.5 text-[#2D2D2D]/40 hover:text-[#2D2D2D] hover:bg-white rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">Pflegekraft bearbeiten</h1>
          <p className="text-sm text-[#2D2D2D]/50">{profile.user.name}</p>
        </div>
      </div>
      <PflegerForm
        onSubmit={updatePfleger.bind(null, id)}
        defaultValues={defaultValues}
        isEdit
        disableEmail
      />
    </div>
  );
}
