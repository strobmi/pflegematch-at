"use client";

import { useEffect } from "react";
import { Video } from "lucide-react";

interface VideoRoomProps {
  url: string;
  displayName?: string;
}

export default function VideoRoom({ url, displayName }: VideoRoomProps) {
  useEffect(() => {
    import("@whereby.com/browser-sdk/embed");
  }, []);

  const src = displayName
    ? `${url}?displayName=${encodeURIComponent(displayName)}`
    : url;

  return (
    <div className="w-full h-[calc(100vh-72px)] rounded-2xl overflow-hidden border border-[#EAD9C8] bg-[#F7F3EE]">
      <whereby-embed
        room={src}
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
}

export function VideoRoomSkeleton() {
  return (
    <div className="w-full h-[calc(100vh-72px)] rounded-2xl flex items-center justify-center bg-[#F7F3EE] border border-[#EAD9C8]">
      <div className="text-center">
        <Video className="w-10 h-10 text-[#C06B4A] mx-auto mb-3 animate-pulse" />
        <p className="text-[#2D2D2D]/60 text-sm">Videoraum wird geladen…</p>
      </div>
    </div>
  );
}
