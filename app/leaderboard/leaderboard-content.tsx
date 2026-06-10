"use client";
import { useEffect, useState, useCallback } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getUsername, setUsername } from "@/lib/predictions";

interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  correctScores: number;
  correctWinners: number;
  totalPredictions: number;
  accuracy: number;
}

export default function LeaderboardContent() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    setName(getUsername());
    setNameInput(getUsername());
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();
      if (!data.error) setEntries(data.leaderboard || []);
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  function handleSaveName() {
    const trimmed = nameInput.trim() || "Anonymous";
    setUsername(trimmed);
    setName(trimmed);
  }

  if (loading) return <LoadingSpinner text="Loading leaderboard..." />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Leaderboard</h1>
        <p className="text-sm text-gray-500">Compare your prediction scores with other fans.</p>
      </div>

      <div className="card p-4 mb-6 flex items-center gap-3 flex-wrap">
        <label className="text-xs text-gray-500">Your display name:</label>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          maxLength={24}
          placeholder="Enter your name"
          className="bg-[#0a0f0a] border border-[#1f2f1f] rounded px-3 py-1.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors w-40"
        />
        <button
          onClick={handleSaveName}
          disabled={nameInput === name || !nameInput.trim()}
          className="text-xs px-3 py-1.5 rounded font-medium bg-[#1a2e1a] text-[#4ade80] hover:bg-[#243824] transition-colors disabled:opacity-50"
        >
          Save
        </button>
      </div>

      {entries.length > 0 ? (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a2e1a] grid grid-cols-[1fr_60px_60px_60px] md:grid-cols-[1fr_80px_80px_80px_80px] gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
            <span>User</span>
            <span className="text-right">Pts</span>
            <span className="text-right hidden md:block">Wins</span>
            <span className="text-right hidden md:block">Exact</span>
            <span className="text-right">{entries.length > 0 && entries[0].totalPredictions > 0 ? "Acc" : ""}</span>
          </div>
          <div className="divide-y divide-[#1a2e1a]">
            {entries.map((e, i) => (
              <div
                key={e.userId}
                className={`px-4 py-3 grid grid-cols-[1fr_60px_60px_60px] md:grid-cols-[1fr_80px_80px_80px_80px] gap-2 text-sm items-center ${e.username === name ? "bg-[#0f1a0f]" : ""}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-gray-600 font-mono w-5 shrink-0">{i + 1}.</span>
                  <span className={`truncate ${e.username === name ? "text-[#4ade80] font-semibold" : "text-white"}`}>
                    {e.username}
                  </span>
                  {e.username === name && <span className="text-[10px] text-[#4ade80] shrink-0">(you)</span>}
                </div>
                <span className="text-right font-bold font-mono text-[#4ade80]">{e.totalPoints}</span>
                <span className="text-right text-gray-400 font-mono text-xs hidden md:block">{e.correctWinners}</span>
                <span className="text-right text-gray-400 font-mono text-xs hidden md:block">{e.correctScores}</span>
                <span className="text-right text-gray-400 font-mono text-xs">{e.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card p-8 text-center">
          <p className="text-gray-500 text-sm mb-2">No predictions on the leaderboard yet.</p>
          <p className="text-xs text-gray-600">Save predictions on the Predict page to appear here.</p>
        </div>
      )}
    </div>
  );
}
