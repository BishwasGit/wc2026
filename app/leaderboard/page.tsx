import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard - WC 2026",
  description: "FIFA World Cup 2026 prediction leaderboard — coming soon.",
};

export default function LeaderboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
        <p className="text-sm text-gray-500">
          Prediction leaderboard is coming soon. Compete with friends and track your prediction accuracy.
        </p>
      </div>

      <div className="card p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1a2e1a] mb-4">
          <span className="text-2xl text-[#4ade80] font-bold">?</span>
        </div>
        <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The leaderboard feature is under development. You will soon be able to compare your predictions
          with other fans and see who knows the game best.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
          {["Predict matches", "Earn points", "Climb the ranks"].map((step, i) => (
            <div key={step} className="card p-4 border-[#1f2f1f]">
              <div className="text-xs font-bold text-[#4ade80] mb-1">0{i + 1}</div>
              <div className="text-sm text-gray-400">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
