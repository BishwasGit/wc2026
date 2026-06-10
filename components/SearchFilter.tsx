"use client";
import { useState } from "react";

export interface FilterValues {
  search: string;
  group: string;
  dateFrom: string;
  dateTo: string;
}

interface SearchFilterProps {
  onFilter: (filters: FilterValues) => void;
}

const GROUPS = [
  "",
  "GROUP_A",
  "GROUP_B",
  "GROUP_C",
  "GROUP_D",
  "GROUP_E",
  "GROUP_F",
  "GROUP_G",
  "GROUP_H",
];

export default function SearchFilter({ onFilter }: SearchFilterProps) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function handleSearch(val: string) {
    setSearch(val);
    setTimeout(() => onFilter({ search: val, group, dateFrom, dateTo }), 0);
  }

  function handleGroup(val: string) {
    setGroup(val);
    onFilter({ search, group: val, dateFrom, dateTo });
  }

  function handleDateFrom(val: string) {
    setDateFrom(val);
    onFilter({ search, group, dateFrom: val, dateTo });
  }

  function handleDateTo(val: string) {
    setDateTo(val);
    onFilter({ search, group, dateFrom, dateTo: val });
  }

  function handleClear() {
    setSearch("");
    setGroup("");
    setDateFrom("");
    setDateTo("");
    onFilter({ search: "", group: "", dateFrom: "", dateTo: "" });
  }

  const hasFilters = search || group || dateFrom || dateTo;

  return (
    <div className="card p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Search team</label>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Team name..."
            className="w-full bg-[#0a0f0a] border border-[#1f2f1f] rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Group</label>
          <select
            value={group}
            onChange={(e) => handleGroup(e.target.value)}
            className="w-full bg-[#0a0f0a] border border-[#1f2f1f] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4ade80] transition-colors"
          >
            <option value="">All groups</option>
            {GROUPS.filter(Boolean).map((g) => (
              <option key={g} value={g}>
                {g.replace("GROUP_", "Group ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateFrom(e.target.value)}
            className="w-full bg-[#0a0f0a] border border-[#1f2f1f] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4ade80] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleDateTo(e.target.value)}
            className="w-full bg-[#0a0f0a] border border-[#1f2f1f] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4ade80] transition-colors"
          />
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={handleClear}
          className="mt-3 text-xs text-gray-500 hover:text-[#4ade80] transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
