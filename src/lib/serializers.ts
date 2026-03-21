/**
 * Serializers for Prisma Decimal → number conversion.
 *
 * Prisma Decimal objects cannot be passed from Server Components to Client
 * Components. Always use these helpers at the Server → Client boundary.
 */

import type { Decimal } from "@prisma/client/runtime/library";

/** Convert a nullable Prisma Decimal to a plain JS number (or null). */
export function dec(value: Decimal | null | undefined): number | null {
  return value != null ? Number(value) : null;
}

/** Serialize a Match row — strips all Decimal fields. */
export function serializeMatch<
  T extends {
    score?: Decimal | null;
    provisionAmount?: Decimal | null;
    matchFeeAmount?: Decimal | null;
  },
>(m: T): Omit<T, "score" | "provisionAmount" | "matchFeeAmount"> & {
  score: number | null;
  provisionAmount: number | null;
  matchFeeAmount: number | null;
} {
  return {
    ...m,
    score:           dec(m.score),
    provisionAmount: dec(m.provisionAmount),
    matchFeeAmount:  dec(m.matchFeeAmount),
  };
}

/** Serialize a CaregiverProfile row — strips all Decimal fields. */
export function serializeCaregiverProfile<
  T extends {
    hourlyRate?: Decimal | null;
    averageRating?: Decimal | null;
  },
>(p: T): Omit<T, "hourlyRate" | "averageRating"> & {
  hourlyRate: number | null;
  averageRating: number | null;
} {
  return {
    ...p,
    hourlyRate:    dec(p.hourlyRate),
    averageRating: dec(p.averageRating),
  };
}

/** Serialize a Contract row — strips all Decimal fields. */
export function serializeContract<
  T extends {
    matchFeeAmount?: Decimal | null;
    monthlyFeeAmount?: Decimal | null;
  },
>(c: T): Omit<T, "matchFeeAmount" | "monthlyFeeAmount"> & {
  matchFeeAmount: number | null;
  monthlyFeeAmount: number | null;
} {
  return {
    ...c,
    matchFeeAmount:   dec(c.matchFeeAmount),
    monthlyFeeAmount: dec(c.monthlyFeeAmount),
  };
}

/** Serialize a Tenant row — strips all Decimal fields. */
export function serializeTenant<
  T extends {
    defaultMatchFee?: Decimal | null;
    defaultMonthlyFee?: Decimal | null;
    provisionPercent?: Decimal | null;
  },
>(t: T): Omit<T, "defaultMatchFee" | "defaultMonthlyFee" | "provisionPercent"> & {
  defaultMatchFee: number | null;
  defaultMonthlyFee: number | null;
  provisionPercent: number | null;
} {
  return {
    ...t,
    defaultMatchFee:   dec(t.defaultMatchFee),
    defaultMonthlyFee: dec(t.defaultMonthlyFee),
    provisionPercent:  dec(t.provisionPercent),
  };
}
