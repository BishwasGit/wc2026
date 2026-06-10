import type { Metadata } from "next";
import StandingsContent from "./standings-content";

export const metadata: Metadata = {
  title: "Group Standings - WC 2026",
  description:
    "FIFA World Cup 2026 group standings, points, goal difference, and qualification status for all groups.",
};

export default function StandingsPage() {
  return <StandingsContent />;
}
