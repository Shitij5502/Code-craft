"use client";

import { useEffect, useState } from "react";
import { getWeeklyExecutionStats } from "@/lib/ai/execution-history";
import { useProAccess } from "@/hooks/useProAccess";

function WeeklyProgressCard() {
  const { hasProAccess } = useProAccess();

  const [stats, setStats] = useState({
    totalRuns: 0,
    totalErrors: 0,
    activeDays: 0,
    favoriteLanguage: "None",
  });

  useEffect(() => {
    if (hasProAccess) {
      setStats(getWeeklyExecutionStats());
    }
  }, [hasProAccess]);

  if (!hasProAccess) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#12121a]/90 p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-[#1e1e2e] p-4">
          <p className="text-sm text-gray-400">Runs</p>
          <p className="text-2xl font-bold text-white">{stats.totalRuns}</p>
        </div>

        <div className="rounded-lg bg-[#1e1e2e] p-4">
          <p className="text-sm text-gray-400">Errors</p>
          <p className="text-2xl font-bold text-red-400">{stats.totalErrors}</p>
        </div>

        <div className="rounded-lg bg-[#1e1e2e] p-4">
          <p className="text-sm text-gray-400">Active Days</p>
          <p className="text-2xl font-bold text-blue-400">{stats.activeDays}</p>
        </div>

        <div className="rounded-lg bg-[#1e1e2e] p-4">
          <p className="text-sm text-gray-400">Favorite Language</p>
          <p className="text-lg font-bold text-amber-300">{stats.favoriteLanguage}</p>
        </div>
      </div>
    </div>
  );
}

export default WeeklyProgressCard;