import type { Metadata } from "next";
import PredictContent from "./predict-content";

export const metadata: Metadata = {
  title: "Predictions - WC 2026",
  description:
    "Predict match scores for upcoming FIFA World Cup 2026 matches. Save your predictions locally and compare with friends.",
};

export default function PredictPage() {
  return <PredictContent />;
}
