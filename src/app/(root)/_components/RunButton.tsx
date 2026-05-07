"use client";

import { motion } from "framer-motion";
import { Share2 } from "lucide-react";

type RunButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

function RunButton({ onClick, disabled = false }: RunButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type="button"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
      from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity text-white
      disabled:opacity-50 disabled:cursor-not-allowed"
      title="Share"
    >
      <Share2 className="w-4 h-4" />
      <span className="text-sm font-medium">Share</span>
    </motion.button>
  );
}

export default RunButton;