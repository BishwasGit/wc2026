import type { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "Scores - WC 2026",
  description: "FIFA World Cup 2026 live scores, match results, and upcoming fixtures. Follow every match from USA, Canada, and Mexico.",
  openGraph: {
    title: "WC 2026 - Live Scores and Predictions",
    description: "FIFA World Cup 2026 live scores, group standings, and match predictions",
    siteName: "WC 2026",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
