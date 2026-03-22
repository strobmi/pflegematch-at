import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/tenant";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const plans = await prisma.pricingPlan.findMany({
    where:   { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, monthlyFee: true, matchFee: true, sortOrder: true },
  });

  return NextResponse.json(
    plans.map((p) => ({
      ...p,
      monthlyFee: Number(p.monthlyFee),
      matchFee:   Number(p.matchFee),
    }))
  );
}
