"use client";
import { AIMessage } from "@/lib/ai/types";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: AIMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg ${
        message.role === "user"
          ? "bg-[#1e1e2e]/50 ml-8"
          : "bg-[#2a2a3a]/30 mr-8"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          message.role === "user"
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            : "bg-gradient-to-br from-purple-500 to-pink-600 text-white"
        }`}
      >
        {message.role === "user" ? "U" : "AI"}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const codeString = String(children).replace(/\n$/, "");

                if (!inline && match) {
                  return (
                    <div className="relative group">
                      <button
                        onClick={() => handleCopy(codeString)}
                        className="absolute right-2 top-2 p-1.5 rounded bg-[#1e1e2e] hover:bg-[#2a2a3a] transition-colors opacity-0 group-hover:opacity-100 z-10"
                        aria-label="Copy code"
                      >
                        {copied ? (
                          <CheckIcon className="w-4 h-4 text-green-400" />
                        ) : (
                          <CopyIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                        {...props}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }

                return (
                  <code
                    className="px-1.5 py-0.5 rounded bg-[#1e1e2e] text-blue-400 text-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="text-gray-300 leading-relaxed mb-2">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside text-gray-300 space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside text-gray-300 space-y-1">{children}</ol>;
              },
              h3({ children }) {
                return <h3 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h3>;
              },
              h4({ children }) {
                return <h4 className="text-base font-semibold text-white mt-3 mb-1">{children}</h4>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
