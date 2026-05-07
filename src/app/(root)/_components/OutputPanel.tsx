"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { AlertCircle, CheckCircle2, Copy, Terminal } from "lucide-react";
import toast from "react-hot-toast";

function OutputPanel() {
  const { output, error, isRunning } = useCodeEditorStore();

  const content = error || output || "";
  const hasError = Boolean(error);

  const handleCopy = async () => {
    if (!content) return;

    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };

  return (
    <div
      id="output-panel"
      className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-4 lg:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
            <Terminal className="size-4 text-gray-300" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-white">Output</h2>
            <p className="text-xs text-gray-500">
              {isRunning
                ? "Running your code..."
                : hasError
                ? "Execution error"
                : "Execution result"}
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3a] text-white ring-1 ring-white/5 transition-colors"
        >
          <Copy className="size-4" />
          <span className="text-sm">Copy</span>
        </button>
      </div>

      <div
        className={`rounded-xl border p-4 min-h-[140px] overflow-auto whitespace-pre-wrap break-words ${
          hasError
            ? "bg-red-500/5 border-red-500/20"
            : "bg-[#0f0f17] border-white/[0.05]"
        }`}
      >
        {isRunning ? (
          <p className="text-sm text-gray-400">Running...</p>
        ) : content ? (
          <div className="flex items-start gap-3">
            {hasError ? (
              <AlertCircle className="size-5 text-red-400 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 className="size-5 text-emerald-400 mt-0.5 shrink-0" />
            )}
            <pre
              className={`text-sm leading-6 ${
                hasError ? "text-red-300" : "text-gray-200"
              }`}
            >
              {content}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Run your code to see output here.</p>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;