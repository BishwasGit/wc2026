import type { Metadata } from "next";
import LeaderboardContent from "./leaderboard-content";

export const metadata: Metadata = {
  title: "Leaderboard - WC 2026",
  description: "Track your FIFA World Cup 2026 prediction accuracy, points, and match history.",
};

export default function LeaderboardPage() {
  return <LeaderboardContent />;
}
