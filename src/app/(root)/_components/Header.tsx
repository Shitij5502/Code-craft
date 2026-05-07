"use client";

import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import AIChatButton from "./AIChatButton";
import HeaderProfileBtn from "./HeaderProfileBtn";
import ProBadge from "./ProBadge";
import UpgradeProButton from "./UpgradeProButton";
import { Share2 } from "lucide-react";
import { useState } from "react";
import ShareSnippetDialog from "./ShareSnippetDialog";
import toast from "react-hot-toast";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";

function Header() {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { activeFileId } = useCodeEditorStore();

  const handleShareClick = () => {
    if (!activeFileId) {
      toast.error("Create or open a file before sharing.");
      return;
    }
    setIsShareDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-4xl font-bold text-white">CodeCraft</h1>
          <p className="text-gray-300">Interactive Code Editor</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <ThemeSelector />
          <LanguageSelector />
          <ProBadge />
          <UpgradeProButton />
          <AIChatButton />

          <button
            onClick={handleShareClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-100 transition-opacity"
            type="button"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </button>

          <HeaderProfileBtn />
        </div>
      </div>

      {isShareDialogOpen && (
        <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />
      )}
    </>
  );
}

export default Header;