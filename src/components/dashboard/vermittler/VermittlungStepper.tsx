import Link from "next/link";
import { Fragment } from "react";

const steps = [
  { step: 1, label: "Anfragen", href: "/vermittler/anfragen" },
  { step: 2, label: "Matches",  href: "/vermittler/matches" },
  { step: 3, label: "Verträge", href: "/vermittler/vertraege" },
] as const;

export default function VermittlungStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="flex items-start mt-3 mb-0.5">
      {steps.map(({ step, label, href }, i) => {
        const active = step === currentStep;
        const done   = step < currentStep;
        return (
          <Fragment key={href}>
            <Link href={href} className="flex flex-col items-center gap-1 group">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-colors ${
                  active
                    ? "bg-[#C06B4A] text-white"
                    : done
                    ? "bg-[#C06B4A]/25 text-[#C06B4A]"
                    : "bg-[#2D2D2D]/10 text-[#2D2D2D]/30"
                }`}
              >
                {step}
              </div>
              <span
                className={`text-xs font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "text-[#C06B4A]"
                    : done
                    ? "text-[#C06B4A]/50"
                    : "text-[#2D2D2D]/30"
                }`}
              >
                {label}
              </span>
            </Link>
            {i < steps.length - 1 && (
              <div
                className={`w-6 h-px mt-2.5 mx-1 flex-shrink-0 ${
                  done ? "bg-[#C06B4A]/35" : "bg-[#2D2D2D]/12"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
