/**
 * Serializers for Prisma Decimal → number conversion.
 *
 * Prisma Decimal objects cannot be passed from Server Components to Client
 * Components. Always use these helpers at the Server → Client boundary.
 */

/** Prisma 7 may return Decimal fields as number or as a Decimal object. */
type DecimalLike = { toNumber(): number } | number | null | undefined;

/** Convert a nullable Prisma Decimal (or number) to a plain JS number (or null). */
export function dec(value: DecimalLike): number | null {
  if (value == null) return null;
  return typeof value === "number" ? value : value.toNumber();
}

/** Serialize a Match row — strips all Decimal fields. */
export function serializeMatch<
  T extends {
    score?: DecimalLike;
    provisionAmount?: DecimalLike;
    matchFeeAmount?: DecimalLike;
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
    hourlyRate?: DecimalLike;
    averageRating?: DecimalLike;
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
    matchFeeAmount?: DecimalLike;
    monthlyFeeAmount?: DecimalLike;
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
    defaultMatchFee?: DecimalLike;
    defaultMonthlyFee?: DecimalLike;
    provisionPercent?: DecimalLike;
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
