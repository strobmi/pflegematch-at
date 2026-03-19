import { prisma } from "@/lib/prisma";
import { Heart } from "lucide-react";
import { NewUserAcceptForm, ExistingUserAcceptForm } from "./InviteAcceptForm";

export const metadata = { title: "Einladung annehmen · pflegematch" };

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;

  const invite = await prisma.inviteToken.findUnique({
    where: { token },
    include: { tenant: { select: { name: true } } },
  });

  const isInvalid =
    !invite || invite.usedAt !== null || invite.expiresAt < new Date();

  if (isInvalid) {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <h2 className="text-lg font-bold text-[#2D2D2D] mb-2">
            Einladung ungültig oder abgelaufen
          </h2>
          <p className="text-sm text-[#2D2D2D]/55">
            Dieser Einladungslink ist nicht mehr gültig. Bitte wenden Sie sich an Ihr Team.
          </p>
        </div>
      </PageShell>
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email },
    include: {
      memberships: { where: { tenantId: invite.tenantId } },
    },
  });

  if (existingUser && existingUser.memberships.length > 0) {
    return (
      <PageShell>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#7B9E7B]/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-[#7B9E7B] text-xl">✓</span>
          </div>
          <h2 className="text-lg font-bold text-[#2D2D2D] mb-2">
            Sie sind bereits Mitglied
          </h2>
          <p className="text-sm text-[#2D2D2D]/55">
            Ihr Konto ist bereits mit dem Team von <strong>{invite.tenant.name}</strong> verknüpft.
          </p>
          <a
            href="/vermittler"
            className="mt-4 inline-block bg-[#C06B4A] hover:bg-[#A05438] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Zum Dashboard
          </a>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {existingUser ? (
        <ExistingUserAcceptForm
          token={token}
          email={invite.email}
          tenantName={invite.tenant.name}
        />
      ) : (
        <NewUserAcceptForm
          token={token}
          email={invite.email}
          tenantName={invite.tenant.name}
        />
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF5EE] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-[#C06B4A] flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-[#2D2D2D]">
            pflege<span className="text-[#C06B4A]">match</span>
            <span className="text-[11px] align-super text-[#7B9E7B] font-semibold ml-0.5">AT</span>
          </span>
        </div>
        <div className="bg-white rounded-3xl border border-[#EAD9C8] shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
