"use client";

import { MessageSquare, Lock } from "lucide-react";
import { useProAccess } from "@/hooks/useProAccess";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import toast from "react-hot-toast";

function AIChatButton() {
  const { hasProAccess } = useProAccess();
  const { isChatPanelOpen, toggleChatPanel } = useCodeEditorStore();

  const handleClick = () => {
    if (!hasProAccess) {
      toast.error("Upgrade to Pro Student to use AI features");
      return;
    }

    toggleChatPanel();
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
        hasProAccess
          ? "bg-purple-500/10 border-purple-400/30 text-purple-200 hover:bg-purple-500/20"
          : "bg-gray-800/70 border-gray-700 text-gray-300 hover:bg-gray-700/70"
      }`}
    >
      {hasProAccess ? (
        <MessageSquare className="w-4 h-4" />
      ) : (
        <Lock className="w-4 h-4" />
      )}

      <span className="text-sm font-medium">
        {hasProAccess
          ? isChatPanelOpen
            ? "Close AI Chat"
            : "AI Chat"
          : "Upgrade to Pro"}
      </span>
    </button>
  );
}

export default AIChatButton;