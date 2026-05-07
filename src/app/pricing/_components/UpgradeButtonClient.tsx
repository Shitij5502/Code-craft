"use client";

import { Zap } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import toast from "react-hot-toast";

export default function UpgradeButtonClient() {
  const { user } = useUser();
  const upgradeToPro = useMutation(api.users.upgradeToPro);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("You need to be signed in to upgrade.");
      return;
    }

    try {
      setIsLoading(true);
      await upgradeToPro({
        email: user.primaryEmailAddress?.emailAddress || "",
        isCheater: true,
      });
      toast.success("Upgraded to Pro successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upgrade to Pro.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white 
        bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg 
        hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <Zap className="w-5 h-5" />
      {isLoading ? "Upgrading..." : "Upgrade to Pro"}
    </button>
  );
}


