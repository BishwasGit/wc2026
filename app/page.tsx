import type { Metadata } from "next";
import HomeContent from "./home-content";

export const metadata: Metadata = {
  title: "Scores - WC 2026",
  description: "FIFA World Cup 2026 Live Scores and Results. Follow every match, live scores, and fixtures from USA, Canada, and Mexico.",
  openGraph: {
    title: "FIFA World Cup 2026 Live Scores and Results",
    description: "FIFA World Cup 2026 live scores, group standings, and match predictions",
    siteName: "WC 2026",
  },
};

export default function HomePage() {
  return <HomeContent />;
}
