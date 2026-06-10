"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { generatePlayerPool, type FantasyPlayer } from "@/lib/player-pool";
import type { Team } from "@/lib/types";
import { Search, X, Copy, Shuffle, Save, Check, AlertTriangle } from "lucide-react";

const TOTAL_BUDGET = 100;

type Formation = "4-3-3" | "4-4-2" | "3-5-2" | "5-3-2" | "4-2-3-1";

const FORMATION_SLOTS: Record<Formation, string[]> = {
  "4-3-3":    ["GK","DEF","DEF","DEF","DEF","MID","MID","MID","FWD","FWD","FWD"],
  "4-4-2":    ["GK","DEF","DEF","DEF","DEF","MID","MID","MID","MID","FWD","FWD"],
  "3-5-2":    ["GK","DEF","DEF","DEF","MID","MID","MID","MID","MID","FWD","FWD"],
  "5-3-2":    ["GK","DEF","DEF","DEF","DEF","DEF","MID","MID","MID","FWD","FWD"],
  "4-2-3-1":  ["GK","DEF","DEF","DEF","DEF","MID","MID","FWD","FWD","FWD","FWD"],
};

const POSITION_COLORS: Record<string, string> = {
  GK: "text-yellow-400",
  DEF: "text-blue-400",
  MID: "text-[#4ade80]",
  FWD: "text-red-400",
};

const POSITION_BG: Record<string, string> = {
  GK: "bg-yellow-400/10 border-yellow-400/30",
  DEF: "bg-blue-400/10 border-blue-400/30",
  MID: "bg-[#4ade80]/10 border-[#4ade80]/30",
  FWD: "bg-red-400/10 border-red-400/30",
};

function getXPositions(total: number): number[] {
  if (total === 1) return [50];
  if (total === 2) return [30, 70];
  if (total === 3) return [18, 50, 82];
  if (total === 4) return [12, 35, 65, 88];
  if (total === 5) return [8, 26, 50, 74, 92];
  return [50];
}

const Y_POSITIONS: Record<string, number> = { GK: 84, DEF: 65, MID: 42, FWD: 18 };

function getSlotPosition(
  slotIndex: number,
  slots: string[]
): { x: number; y: number } {
  const pos = slots[slotIndex];
  const total = slots.filter((p) => p === pos).length;
  const idxInGroup = slots.filter((p, i) => p === pos && i < slotIndex).length;
  const xs = getXPositions(total);
  return { x: xs[idxInGroup] ?? 50, y: Y_POSITIONS[pos] };
}

function formatCost(cost: number): string {
  return `$${cost}M`;
}

export default function FantasyContent() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [allPlayers, setAllPlayers] = useState<FantasyPlayer[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<(FantasyPlayer | null)[]>([]);
  const [formation, setFormation] = useState<Formation>("4-3-3");
  const [remainingBudget, setRemainingBudget] = useState(TOTAL_BUDGET);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("All");
  const [teamFilter, setTeamFilter] = useState<string>("All");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedConfirm, setSavedConfirm] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initialized = useRef(false);

  const slots = useMemo(() => FORMATION_SLOTS[formation], [formation]);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  useEffect(() => {
    fetch("/api/teams")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load teams");
        return r.json();
      })
      .then((data) => {
        const list: Team[] = data.teams || [];
        if (!list.length) throw new Error("No teams found");
        setTeams(list);
        const pool = generatePlayerPool(list);
        setAllPlayers(pool);

        try {
          const saved = localStorage.getItem("wc2026_fantasy");
          if (saved) {
            const d = JSON.parse(saved);
            if (d.formation && FORMATION_SLOTS[d.formation as Formation]) {
              setFormation(d.formation as Formation);
              if (d.slots?.length === 11) {
                const restored = d.slots.map(
                  (s: FantasyPlayer | null) =>
                    s ? pool.find((p) => p.id === s.id) || null : null
                );
                setSelectedSlots(restored);
                const spent = restored.reduce(
                  (sum: number, p: FantasyPlayer | null) =>
                    sum + (p ? p.cost : 0),
                  0
                );
                setRemainingBudget(TOTAL_BUDGET - spent);
              } else {
                setSelectedSlots(Array(11).fill(null));
              }
            } else {
              setSelectedSlots(Array(11).fill(null));
            }
          } else {
            setSelectedSlots(Array(11).fill(null));
          }
        } catch {
          setSelectedSlots(Array(11).fill(null));
        }

        initialized.current = true;
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const selectedCount = useMemo(
    () => selectedSlots.filter(Boolean).length,
    [selectedSlots]
  );

  const spentBudget = useMemo(
    () =>
      selectedSlots.reduce(
        (sum, p) => sum + (p ? p.cost : 0),
        0
      ),
    [selectedSlots]
  );

  const selectedIds = useMemo(
    () => new Set(selectedSlots.filter(Boolean).map((p) => p!.id)),
    [selectedSlots]
  );

  const affordablePlayers = useMemo(
    () => allPlayers.filter((p) => p.cost <= remainingBudget),
    [allPlayers, remainingBudget]
  );

  const availablePlayers = useMemo(() => {
    return affordablePlayers.filter((p) => {
      if (selectedIds.has(p.id)) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (positionFilter !== "All" && p.position !== positionFilter)
        return false;
      if (teamFilter !== "All" && p.teamName !== teamFilter) return false;
      return true;
    });
  }, [affordablePlayers, selectedIds, search, positionFilter, teamFilter]);

  function addPlayer(player: FantasyPlayer) {
    if (selectedIds.has(player.id)) {
      showToast("Already selected");
      return;
    }
    if (player.cost > remainingBudget) {
      showToast("Budget exceeded");
      return;
    }
    const idx = selectedSlots.findIndex(
      (s, i) => s === null && slots[i] === player.position
    );
    if (idx === -1) {
      showToast("Position full");
      return;
    }
    const next = [...selectedSlots];
    next[idx] = player;
    setSelectedSlots(next);
    setRemainingBudget((b) => b - player.cost);
  }

  function removePlayer(idx: number) {
    const player = selectedSlots[idx];
    if (!player) return;
    const next = [...selectedSlots];
    next[idx] = null;
    setSelectedSlots(next);
    setRemainingBudget((b) => b + player.cost);
  }

  function handleFormationChange(f: Formation) {
    if (f === formation) return;
    const newSlots = FORMATION_SLOTS[f];
    const result: (FantasyPlayer | null)[] = Array(11).fill(null);
    let refund = 0;

    for (const player of selectedSlots) {
      if (!player) continue;
      const target = result.findIndex(
        (s, i) => s === null && newSlots[i] === player.position
      );
      if (target !== -1) {
        result[target] = player;
      } else {
        refund += player.cost;
      }
    }

    setSelectedSlots(result);
    setFormation(f);
    setRemainingBudget((b) => b + refund);
  }

  function autoPick() {
    const result = [...selectedSlots];
    let budget = remainingBudget;

    const empty = result
      .map((s, i) => (s === null ? i : -1))
      .filter((i) => i !== -1);

    empty.sort((a, b) => {
      const posA = slots[a];
      const posB = slots[b];
      const countA = allPlayers.filter(
        (p) =>
          p.position === posA &&
          !result.some((s) => s?.id === p.id) &&
          p.cost <= budget
      ).length;
      const countB = allPlayers.filter(
        (p) =>
          p.position === posB &&
          !result.some((s) => s?.id === p.id) &&
          p.cost <= budget
      ).length;
      return countA - countB;
    });

    for (const idx of empty) {
      const pos = slots[idx];
      const candidates = allPlayers
        .filter(
          (p) =>
            p.position === pos &&
            !result.some((s) => s?.id === p.id) &&
            p.cost <= budget
        )
        .sort((a, b) => b.rating - a.rating);
      if (candidates.length > 0) {
        result[idx] = candidates[0];
        budget -= candidates[0].cost;
      }
    }

    setSelectedSlots(result);
    setRemainingBudget(budget);
  }

  function saveLineup() {
    const data = {
      formation,
      slots: selectedSlots,
      remainingBudget,
    };
    localStorage.setItem("wc2026_fantasy", JSON.stringify(data));
    setSavedConfirm(true);
    showToast("Saved");
  }

  function shareLineup() {
    const names = selectedSlots
      .filter(Boolean)
      .map((p) => p!.name)
      .join(" | ");
    const text = `My WC2026 XI: ${names} | Built on https://2026worldcuplive.vercel.app/fantasy`;
    navigator.clipboard.writeText(text).then(() => showToast("Copied!"));
  }

  function clearLineup() {
    const refund = selectedSlots.reduce(
      (sum, p) => sum + (p ? p.cost : 0),
      0
    );
    setSelectedSlots(Array(11).fill(null));
    setRemainingBudget((b) => b + refund);
    localStorage.removeItem("wc2026_fantasy");
    showToast("Cleared");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-[#4ade80] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400">
        <AlertTriangle className="w-10 h-10 mb-3 text-red-400" />
        <p className="text-lg font-semibold mb-1">Failed to load</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#111811] border border-[#1a2e1a] rounded-lg px-4 py-2 shadow-lg text-sm text-gray-200 animate-pulse">
          {toast}
        </div>
      )}

      {/* Formation selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(Object.keys(FORMATION_SLOTS) as Formation[]).map((f) => (
          <button
            key={f}
            onClick={() => handleFormationChange(f)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap ${
              formation === f
                ? "bg-[#4ade80] text-[#0a0f0a]"
                : "bg-[#111811] border border-[#1a2e1a] text-gray-300 hover:border-[#4ade80]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Pitch */}
        <div className="w-full md:w-1/2">
          <div className="relative w-full aspect-[2/3] bg-gradient-to-b from-[#1a4a1a] to-[#0d2b0d] border border-white/20 rounded-lg overflow-hidden select-none">
            {/* Pitch markings */}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28%] aspect-square rounded-full border border-white/20" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/30 rounded-full" />

            <div className="absolute left-[10%] right-[10%] top-0 h-[22%] border-l border-r border-b border-white/20 rounded-b-sm" />
            <div className="absolute left-[10%] right-[10%] bottom-0 h-[22%] border-l border-r border-t border-white/20 rounded-t-sm" />

            <div className="absolute left-[30%] right-[30%] top-0 h-[8%] border-l border-r border-b border-white/20" />
            <div className="absolute left-[30%] right-[30%] bottom-0 h-[8%] border-l border-r border-t border-white/20" />

            {/* Slot labels */}
            {slots.map((pos, i) => {
              const { x, y } = getSlotPosition(i, slots);
              const player = selectedSlots[i];
              const totalOfPos = slots.filter((p) => p === pos).length;
              const isSmall = totalOfPos >= 4;

              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {player ? (
                    <div
                      className={`flex flex-col items-center bg-[#111811]/90 border border-[#1a2e1a] rounded px-1.5 py-0.5 text-center leading-tight cursor-pointer hover:border-red-400/50 transition-colors group ${
                        isSmall ? "min-w-[50px]" : "min-w-[65px]"
                      }`}
                      onClick={() => removePlayer(i)}
                      title={`Remove ${player.name}`}
                    >
                      <span
                        className={`${
                          isSmall ? "text-[9px]" : "text-[10px]"
                        } text-gray-200 truncate max-w-[55px]`}
                      >
                        {player.name}
                      </span>
                      <span
                        className={`${
                          isSmall ? "text-[9px]" : "text-[10px]"
                        } font-bold ${POSITION_COLORS[player.position]}`}
                      >
                        {player.rating}
                      </span>
                      <span className="text-[8px] text-gray-500">
                        {formatCost(player.cost)}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`flex flex-col items-center border border-dashed border-white/20 rounded px-1.5 py-1 text-center ${
                        isSmall ? "min-w-[44px]" : "min-w-[56px]"
                      }`}
                    >
                      <span
                        className={`${
                          isSmall ? "text-[9px]" : "text-[10px]"
                        } text-white/30 font-medium`}
                      >
                        {pos}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Player browser */}
        <div className="w-full md:w-1/2 flex flex-col gap-3">
          {/* Search and filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search players..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#111811] border border-[#1a2e1a] rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#4ade80] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {["All", "GK", "DEF", "MID", "FWD"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPositionFilter(p)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    positionFilter === p
                      ? "bg-[#4ade80] text-[#0a0f0a]"
                      : "bg-[#111811] border border-[#1a2e1a] text-gray-400 hover:border-[#4ade80]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full bg-[#111811] border border-[#1a2e1a] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#4ade80] transition-colors"
            >
              <option value="All">All Teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.shortName || t.name}>
                  {t.shortName || t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Player list */}
          <div className="flex-1 overflow-y-auto max-h-[420px] space-y-1.5 pr-1">
            {availablePlayers.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                {search || positionFilter !== "All" || teamFilter !== "All"
                  ? "No players match your filters"
                  : "No affordable players available"}
              </div>
            )}
            {availablePlayers.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2 bg-[#111811] border border-[#1a2e1a] rounded-lg px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-200 truncate">
                      {player.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${POSITION_BG[player.position]} ${POSITION_COLORS[player.position]}`}
                    >
                      {player.position}
                    </span>
                    <span
                      className={`text-xs font-bold ${POSITION_COLORS[player.position]}`}
                    >
                      {player.rating}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {player.teamName} &middot; {formatCost(player.cost)}
                  </div>
                </div>
                <button
                  onClick={() => addPlayer(player)}
                  disabled={
                    selectedIds.has(player.id) || player.cost > remainingBudget
                  }
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors shrink-0 ${
                    selectedIds.has(player.id)
                      ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                      : player.cost > remainingBudget
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                        : "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/30 hover:bg-[#4ade80]/20"
                  }`}
                >
                  {selectedIds.has(player.id)
                    ? "Added"
                    : player.cost > remainingBudget
                      ? "Expensive"
                      : "Add"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="sticky bottom-0 bg-[#0a0f0a]/95 backdrop-blur border border-[#1a2e1a] rounded-lg p-3 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-gray-400">
            Selected{" "}
            <span className="text-white font-medium">{selectedCount}</span>/11
          </span>
          <span className="text-gray-400">
            Spent{" "}
            <span className="text-white font-medium">
              {formatCost(spentBudget)}
            </span>
          </span>
          <span className="text-gray-400">
            Remaining{" "}
            <span
              className={`font-medium ${
                remainingBudget < 0 ? "text-red-400" : "text-[#4ade80]"
              }`}
            >
              {formatCost(remainingBudget)}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <button
            onClick={autoPick}
            disabled={selectedCount >= 11}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#111811] border border-[#1a2e1a] text-gray-300 hover:border-[#4ade80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Auto-pick
          </button>
          <button
            onClick={saveLineup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#111811] border border-[#1a2e1a] text-gray-300 hover:border-[#4ade80] transition-colors"
          >
            {savedConfirm ? (
              <Check className="w-3.5 h-3.5 text-[#4ade80]" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save
          </button>
          <button
            onClick={shareLineup}
            disabled={selectedCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#111811] border border-[#1a2e1a] text-gray-300 hover:border-[#4ade80] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Copy className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={clearLineup}
            className="px-3 py-1.5 rounded text-xs font-medium bg-[#111811] border border-red-400/20 text-red-400/70 hover:border-red-400/50 hover:text-red-400 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
