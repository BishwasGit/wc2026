import type { Metadata } from "next";
import FantasyContent from "./fantasy-content";

export const metadata: Metadata = {
  title: "Fantasy - WC 2026",
  description: "Build your FIFA World Cup 2026 Fantasy XI",
};

export default function FantasyPage() {
  return <FantasyContent />;
}
