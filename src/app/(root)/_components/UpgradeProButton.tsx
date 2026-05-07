"use client";

import { useProAccess } from "@/hooks/useProAccess";

function UpgradeProButton() {
  const { hasProAccess, upgradeToPro, downgradeToFree } = useProAccess();

  return hasProAccess ? (
    <button
      onClick={downgradeToFree}
      className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-400/30 text-red-300 hover:bg-red-500/20 transition"
      type="button"
    >
      Back to Free
    </button>
  ) : (
    <button
      onClick={upgradeToPro}
      className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:opacity-90 transition"
      type="button"
    >
      Upgrade to Pro Student
    </button>
  );
}

export default UpgradeProButton;