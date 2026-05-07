"use client";

import { Sparkles } from "lucide-react";
import { useProAccess } from "@/hooks/useProAccess";

function ProBadge() {
  const { hasProAccess } = useProAccess();

  if (hasProAccess) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/30 text-amber-300">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">Pro Student</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e1e2e] border border-gray-700 text-gray-300">
      <Sparkles className="w-4 h-4" />
      <span className="text-sm font-medium">Free Plan</span>
    </div>
  );
}

export default ProBadge;