import { Heart } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF6F1] flex flex-col items-center justify-center px-4">
      <a href="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-[#C06B4A] flex items-center justify-center">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="text-xl font-bold text-[#2D2D2D]">
          pflege<span className="text-[#C06B4A]">match</span>
          <span className="text-xs align-super text-[#7B9E7B] font-semibold ml-0.5">AT</span>
        </span>
      </a>
      {children}
    </div>
  );
}
