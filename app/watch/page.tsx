import { Suspense } from "react";
import type { Metadata } from "next";
import WatchContent from "./watch-content";

export const metadata: Metadata = {
  title: "Watch Live TV — WC 2026",
  description: "Watch live sports channels from around the world",
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <p className="text-sm">Loading...</p>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WatchContent />
    </Suspense>
  );
}
