"use client";

import { useState } from "react";
import { Sparkles, X, SendHorizonal } from "lucide-react";
import { useProAccess } from "@/hooks/useProAccess";
import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import toast from "react-hot-toast";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function AIChatPanel() {
  const { hasProAccess } = useProAccess();
  const { isChatPanelOpen, toggleChatPanel, getCode, language } =
    useCodeEditorStore();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  if (!isChatPanelOpen) return null;
  if (!hasProAccess) return null;
// Sends user question and current code to AI assistant
  const handleSendMessage = async () => {
    const text = message.trim();

    if (!text) {
      toast.error("Please type a message");
      return;
    }

    if (isSending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessage("");
    setIsSending(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          code: getCode(),
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "No response received.",
        },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI request failed");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed right-6 top-24 z-50">
      <div className="w-[560px] h-[680px] rounded-2xl border border-white/10 bg-[#0f0f17]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>

            <div>
              <h3 className="text-white font-semibold">AI Assistant</h3>
              <p className="text-xs text-green-400">Connected</p>
            </div>
          </div>

          <button
            onClick={toggleChatPanel}
            type="button"
            className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Sparkles className="w-10 h-10 text-purple-300 mx-auto mb-4" />
                <h4 className="text-2xl font-semibold text-white mb-2">
                  AI Assistant Ready
                </h4>
                <p className="text-sm text-gray-400">
                  Ask doubts, explain code, fix errors, and optimize logic.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600/20 border border-blue-400/20 text-white ml-10"
                    : "bg-[#161625] border border-white/10 text-gray-200 mr-10"
                }`}
              >
                {msg.content}
              </div>
            ))
          )}

          {isSending && (
            <div className="rounded-xl px-4 py-3 text-sm bg-[#161625] border border-white/10 text-gray-400 mr-10">
              Thinking...
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              placeholder="Ask anything about your code..."
              className="flex-1 px-4 py-3 rounded-xl bg-[#161625] border border-white/10 text-white outline-none"
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={isSending}
              className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition inline-flex items-center gap-2 disabled:opacity-50"
            >
              <SendHorizonal className="w-4 h-4" />
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChatPanel;