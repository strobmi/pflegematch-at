import { z } from "zod";

// Base schema without .refine() — safe to import in Client Components
// (.refine() produces a ZodPipe in Zod v4 which doesn't implement Standard Schema)
export const RegistrationBaseSchema = z.object({
  name: z.string().min(2, "Min. 2 Zeichen"),
  email: z.string().email("Ungültige E-Mail"),
  password: z.string().min(8, "Mindestens 8 Zeichen"),
  passwordConfirm: z.string().min(1, "Bitte Passwort bestätigen"),
  bio: z.string().optional(),
  qualifications: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  // Bevorzugte Einsatzregion
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  travelRadius: z.coerce.number().optional(),
  hourlyRate: z.coerce.number().optional(),
  availability: z.enum(["FULL_TIME", "PART_TIME", "HOURLY", "LIVE_IN"]).default("PART_TIME"),
  // Wohnadresse
  addressStreet: z.string().optional(),
  addressPostal: z.string().optional(),
  addressCity: z.string().optional(),
  addressCountry: z.string().optional(),
  // Empfehlung
  referredBy: z.string().optional(),
});

export type RegistrationFormData = z.infer<typeof RegistrationBaseSchema>;

export const ProfileUpdateSchema = z.object({
  name: z.string().min(2),
  bio: z.string().optional(),
  qualifications: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  availability: z.enum(["FULL_TIME", "PART_TIME", "HOURLY", "LIVE_IN"]),
  // Bevorzugte Einsatzregion
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
  travelRadius: z.coerce.number().optional(),
  hourlyRate: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
  isPlatformVisible: z.boolean().default(false),
  // Wohnadresse
  addressStreet: z.string().optional(),
  addressPostal: z.string().optional(),
  addressCity: z.string().optional(),
  addressCountry: z.string().optional(),
  // Bankverbindung
  iban: z.string().optional(),
  bic: z.string().optional(),
  bankAccountHolder: z.string().optional(),
  // Empfehlung
  referredBy: z.string().optional(),
});

export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;

export const AvailabilitySchema = z.object({
  status: z.enum(["AVAILABLE", "VACATION", "BLOCKED"]),
  startDate: z.string().min(1, "Datum erforderlich"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
});

export type AvailabilityFormData = z.infer<typeof AvailabilitySchema>;

export const DirectRequestSchema = z.object({
  caregiverProfileId: z.string(),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  careNeedsRaw: z.string().min(10, "Bitte beschreiben Sie den Pflegebedarf"),
  preferredStart: z.string().optional(),
});

export type DirectRequestFormData = z.infer<typeof DirectRequestSchema>;
