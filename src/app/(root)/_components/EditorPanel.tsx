"use client";

import { getExecutionResult, useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useState } from "react";
import { defineMonacoThemes, LANGUAGE_CONFIG } from "../_constants";
import { Editor } from "@monaco-editor/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { PlayIcon, RotateCcwIcon, TypeIcon } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { EditorPanelSkeleton } from "./EditorPanelSkeleton";
import useMounted from "@/hooks/useMounted";
import ShareSnippetDialog from "./ShareSnippetDialog";
import FileExplorer from "./FileExplorer";
import TabsBar from "./TabsBar";
import toast from "react-hot-toast";
import type * as monaco from "monaco-editor";
import { useAIAutocomplete } from "./useAIAutocomplete";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function EditorPanel() {
  const clerk = useClerk();
  const { user } = useUser();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const {
    language,
    theme,
    fontSize,
    editor,
    setFontSize,
    setEditor,
    initializeFileSystem,
    activeFileId,
    files,
    updateActiveFileContent,
    runCode,
    isRunning,
  } = useCodeEditorStore();

  const saveExecution = useMutation(api.codeExecutions.saveExecution);
  const mounted = useMounted();

  const handleRunCode = async () => {
    if (isRunning) return;

    await runCode();
    const result = getExecutionResult();

    if (result) {
      if (result.error) {
        toast.error(result.error, {
          duration: 6000,
          style: {
            background: "#1e1e2e",
            color: "#ffffff",
            border: "1px solid #ef4444",
            maxWidth: "700px",
          },
        });

        document.getElementById("output-panel")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      } else {
        toast.success("Code executed successfully!", {
          duration: 3000,
          style: {
            background: "#1e1e2e",
            color: "#ffffff",
            border: "1px solid #10b981",
          },
        });
      }
    }

    if (user && result) {
      await saveExecution({
        language,
        code: result.code,
        output: result.output || undefined,
        error: result.error || undefined,
      });
    }
  };

  const handleShareClick = () => {
    if (!activeFileId) {
      toast.error("Create or open a file before sharing.");
      return;
    }
    setIsShareDialogOpen(true);
  };

  useEffect(() => {
    if (!mounted) return;
    initializeFileSystem();
  }, [mounted, initializeFileSystem]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor-font-size");
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
  }, [setFontSize]);

  useAIAutocomplete(editor);

  const handleRefresh = () => {
    if (!activeFileId) {
      toast.error("Create or open a file before resetting.");
      return;
    }

    const fileLanguage =
      activeFileId && files[activeFileId]?.type === "file"
        ? files[activeFileId].language || language
        : language;

    const defaultCode = LANGUAGE_CONFIG[fileLanguage].defaultCode;

    if (editor) editor.setValue(defaultCode);
    updateActiveFileContent(defaultCode);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      updateActiveFileContent(value);
    }
  };

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
    localStorage.setItem("editor-font-size", size.toString());
  };

  if (!mounted) return null;

  const activeFile = activeFileId ? files[activeFileId] : null;
  const editorLanguage =
    activeFile && activeFile.type === "file"
      ? activeFile.language || language
      : language;

  return (
    <div className="relative">
      <div className="relative bg-[#12121a]/90 backdrop-blur rounded-xl border border-white/[0.05] p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
              <Image
                src={"/" + editorLanguage + ".png"}
                alt="Logo"
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">Write and execute your code</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
              type="button"
            >
              <RotateCcwIcon className="size-4 text-gray-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRunCode}
              title="Ctrl + Enter"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 opacity-90 hover:opacity-100 transition-opacity"
              type="button"
            >
              <PlayIcon className="size-4 text-white" />
              <span className="text-sm font-medium text-white">Run</span>
            </motion.button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[260px,minmax(0,1fr)] gap-4">
          <div className="block h-56 sm:h-64 lg:h-[600px]">
            <FileExplorer />
          </div>

          <div className="relative group rounded-xl overflow-hidden ring-1 ring-white/[0.05] flex flex-col">
            <TabsBar />

            {clerk.loaded && (
              <Editor
                height="560px"
                language={LANGUAGE_CONFIG[editorLanguage].monacoLanguage}
                value={(activeFile && activeFile.content) || ""}
                onChange={handleEditorChange}
                theme={theme}
                beforeMount={defineMonacoThemes}
                onMount={(editorInstance, monacoInstance) => {
                  setEditor(editorInstance);
                  registerEditorActions(editorInstance, monacoInstance, handleRunCode);

                  if (activeFile?.content) {
                    editorInstance.setValue(activeFile.content);
                  }
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  renderWhitespace: "selection",
                  fontFamily: '"Fira Code", "Cascadia Code", Consolas, monospace',
                  fontLigatures: true,
                  cursorBlinking: "smooth",
                  smoothScrolling: true,
                  contextmenu: true,
                  renderLineHighlight: "all",
                  lineHeight: 1.6,
                  letterSpacing: 0.5,
                  roundedSelection: true,
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                  inlineSuggest: {
                    enabled: true,
                    showToolbar: "always",
                    mode: "subwordSmart",
                    suppressSuggestions: false,
                  },
                  quickSuggestions: {
                    other: "inline",
                    comments: false,
                    strings: false,
                  },
                  suggest: {
                    preview: true,
                    showInlineDetails: true,
                  },
                }}
              />
            )}

            {!clerk.loaded && <EditorPanelSkeleton />}
          </div>
        </div>
      </div>

      {isShareDialogOpen && (
        <ShareSnippetDialog onClose={() => setIsShareDialogOpen(false)} />
      )}
    </div>
  );
}

export default EditorPanel;

const registerEditorActions = (
  editorInstance: monaco.editor.IStandaloneCodeEditor,
  monacoInstance: typeof monaco,
  handleRunCode: () => Promise<void>
) => {
  editorInstance.addAction({
    id: "codecraft.runCode",
    label: "Run Code",
    keybindings: [monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter],
    contextMenuGroupId: "navigation",
    contextMenuOrder: 1.5,
    run: handleRunCode,
  });
};