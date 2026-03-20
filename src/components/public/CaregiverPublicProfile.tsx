"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Star, MapPin, Clock, ChevronLeft, Send } from "lucide-react";
import type { CaregiverProfile, User, Review } from "@prisma/client";

type ProfileData = CaregiverProfile & {
  user: Pick<User, "name" | "avatarUrl">;
  reviews: Pick<Review, "id" | "rating" | "comment" | "createdAt">[];
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-[#7B9E7B]/15 text-[#7B9E7B]",
  ON_ASSIGNMENT: "bg-[#C06B4A]/15 text-[#C06B4A]",
  VACATION: "bg-blue-100 text-blue-600",
  BLOCKED: "bg-gray-100 text-gray-500",
};

export default function CaregiverPublicProfile({
  profile,
  currentStatus,
  locale,
}: {
  profile: ProfileData;
  currentStatus: string | null;
  locale: string;
}) {
  const t = useTranslations("publicProfile");

  const initials = (profile.user.name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Back */}
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#2D2D2D]/55 hover:text-[#2D2D2D] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {t("backToSearch")}
        </Link>

        {/* Hero card */}
        <div className="bg-white rounded-3xl border border-[#EAD9C8] p-7 shadow-md">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-[#C06B4A]/10 flex items-center justify-center flex-shrink-0 text-2xl font-bold text-[#C06B4A]">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-[#2D2D2D]">{profile.user.name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    {/* Location */}
                    {(profile.locationCity || profile.locationState) && (
                      <span className="flex items-center gap-1 text-xs text-[#2D2D2D]/50">
                        <MapPin className="w-3 h-3" />
                        {[profile.locationCity, profile.locationState].filter(Boolean).join(", ")}
                      </span>
                    )}
                    {/* Availability type */}
                    <span className="flex items-center gap-1 text-xs text-[#2D2D2D]/50">
                      <Clock className="w-3 h-3" />
                      {t(`availabilityTypes.${profile.availability}`)}
                    </span>
                    {/* Current status */}
                    {currentStatus && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[currentStatus] ?? STATUS_COLORS.BLOCKED}`}>
                        {t(`availabilityStatus.${currentStatus}`)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Rating */}
                {profile.averageRating && (
                  <div className="flex items-center gap-1 text-sm font-semibold text-[#2D2D2D] flex-shrink-0">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {profile.averageRating.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Hourly rate */}
              {profile.hourlyRate && (
                <p className="text-sm font-semibold text-[#C06B4A] mt-2">
                  {Number(profile.hourlyRate).toFixed(2)} {t("hourlyRateSuffix")}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-5 text-sm text-[#2D2D2D]/70 leading-relaxed border-t border-[#EAD9C8] pt-4">
              {profile.bio}
            </p>
          )}

          {/* CTA */}
          <Link
            href={`/${locale}/pfleger/${profile.id}/anfrage`}
            className="mt-5 inline-flex items-center gap-2 bg-[#C06B4A] hover:bg-[#A05438] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            {t("requestDirect")}
          </Link>
        </div>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5">
            <h2 className="font-semibold text-[#2D2D2D] mb-3">{t("skills")}</h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((skill) => (
                <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-[#FAF6F1] border border-[#EAD9C8] text-[#2D2D2D]/70">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {profile.languages.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5">
            <h2 className="font-semibold text-[#2D2D2D] mb-3">{t("languages")}</h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.languages.map((lang) => (
                <span key={lang} className="text-xs px-2.5 py-1 rounded-full bg-[#7B9E7B]/10 border border-[#7B9E7B]/30 text-[#7B9E7B]">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Qualifications */}
        {profile.qualifications.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5">
            <h2 className="font-semibold text-[#2D2D2D] mb-3">{t("qualifications")}</h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.qualifications.map((q) => (
                <span key={q} className="text-xs px-2.5 py-1 rounded-full bg-[#EAD9C8]/50 text-[#2D2D2D]/70">
                  {q}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-[#EAD9C8] p-5">
          <h2 className="font-semibold text-[#2D2D2D] mb-3">{t("reviews")}</h2>
          {profile.reviews.length === 0 ? (
            <p className="text-sm text-[#2D2D2D]/40">{t("noReviews")}</p>
          ) : (
            <div className="space-y-3">
              {profile.reviews.map((review) => (
                <div key={review.id} className="border-b border-[#EAD9C8] last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
                      />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-[#2D2D2D]/70">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
