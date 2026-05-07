"use client";

import { useEffect } from "react";
import {
  getExecutionResult,
  useCodeEditorStore,
} from "@/store/useCodeEditorStore";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import toast from "react-hot-toast";

export default function KeyboardShortcuts() {
  const { user } = useUser();
  const { runCode, language, isRunning } = useCodeEditorStore();
  const saveExecution = useMutation(api.codeExecutions.saveExecution);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();

        if (isRunning) return;

        await runCode();
        const result = getExecutionResult();

        if (result) {
          if (result.error) {
            toast.error("Error executing code", {
              duration: 4000,
              style: {
                background: "#1e1e2e",
                color: "#fff",
                border: "1px solid #ef4444",
              },
            });
          } else {
            toast.success("Code executed successfully!", {
              duration: 3000,
              style: {
                background: "#1e1e2e",
                color: "#fff",
                border: "1px solid #10b981",
              },
            });
          }
        }

        // Save to Convex only if user is signed in
        if (!user || !result) return;

        try {
          await saveExecution({
            language,
            code: result.code,
            output: result.output || undefined,
            error: result.error || undefined,
          });
        } catch (error) {
          console.error("Failed to save execution:", error);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, runCode, language, user, saveExecution]);

  return null;
}