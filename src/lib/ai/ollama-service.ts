import { AIConfig, CompletionRequest, OllamaGenerateRequest } from "./types";

export class OllamaService {
    private config: AIConfig;

    constructor(config?: Partial<AIConfig>) {
        this.config = {
            endpoint: config?.endpoint || process.env.NEXT_PUBLIC_OLLAMA_ENDPOINT || "http://localhost:11434",
            model: config?.model || process.env.NEXT_PUBLIC_AI_MODEL || "qwen3:4b",
            temperature: config?.temperature ?? 0.5, // Reduced for faster, more focused responses
            maxTokens: config?.maxTokens ?? 800, // Balanced: fast but complete responses
            stream: config?.stream ?? true,
        };
    }

    /**
     * Check if Ollama is running and accessible
     */
    async checkConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.config.endpoint}/api/tags`, {
                method: "GET",
            });
            return response.ok;
        } catch (error) {
            console.error("Ollama connection check failed:", error);
            return false;
        }
    }

    /**
     * Get code completion suggestion
     */
    async getCompletion(request: CompletionRequest): Promise<string> {
        const prompt = this.buildCompletionPrompt(request);

        try {
            const response = await fetch(`${this.config.endpoint}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: this.config.model,
                    prompt,
                    stream: false,
                    options: {
                        temperature: 0, // Deterministic for consistent completions
                        num_predict: 48, // Short inline suggestions (24-48 tokens)
                        top_k: 10,
                        top_p: 0.95,
                    },
                } as OllamaGenerateRequest),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            const data = await response.json();
            return this.extractCompletion(data.response);
        } catch (error) {
            console.error("Completion error:", error);
            return "";
        }
    }

    /**
     * Send a chat message and get response (with streaming support)
     */
    async *chat(
        messages: Array<{ role: string; content: string }>,
        onStream?: (chunk: string) => void
    ): AsyncGenerator<string, void, unknown> {
        const prompt = this.buildChatPrompt(messages);

        try {
            const response = await fetch(`${this.config.endpoint}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: this.config.model,
                    prompt,
                    stream: this.config.stream,
                    options: {
                        temperature: this.config.temperature,
                        num_predict: this.config.maxTokens,
                    },
                } as OllamaGenerateRequest),
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.statusText}`);
            }

            if (!this.config.stream || !response.body) {
                const data = await response.json();
                yield data.response;
                return;
            }

            // Handle streaming response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const json = JSON.parse(line);
                            if (json.response) {
                                onStream?.(json.response);
                                yield json.response;
                            }
                        } catch (e) {
                            console.error("Error parsing JSON line:", e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            throw error;
        }
    }

    /**
     * Explain selected code
     */
    async explainCode(code: string, language: string): Promise<AsyncGenerator<string, void, unknown>> {
        const messages = [
            {
                role: "system",
                content: "You are a code expert. Explain code concisely.",
            },
            {
                role: "user",
                content: `Explain this ${language} code briefly:\n\`\`\`${language}\n${code}\n\`\`\``,
            },
        ];

        return this.chat(messages);
    }

    /**
     * Fix code errors
     */
    async fixCode(code: string, language: string, error?: string): Promise<AsyncGenerator<string, void, unknown>> {
        const errorContext = error ? `\n\nError message:\n${error}` : "";
        const messages = [
            {
                role: "system",
                content: "You are a code expert. Fix errors and be concise.",
            },
            {
                role: "user",
                content: `Fix this ${language} code:${errorContext}\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide corrected code and brief explanation.`,
            },
        ];

        return this.chat(messages);
    }

    /**
     * Optimize code
     */
    async optimizeCode(code: string, language: string): Promise<AsyncGenerator<string, void, unknown>> {
        const messages = [
            {
                role: "system",
                content: "You are a code expert. Optimize code and be concise.",
            },
            {
                role: "user",
                content: `Optimize this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide optimized version and key improvements.`,
            },
        ];

        return this.chat(messages);
    }

    /**
     * Build completion prompt from context
     */
    private buildCompletionPrompt(request: CompletionRequest): string {
        // Strict prompt that forces code-only output
        const system = `You are an INLINE CODE AUTOCOMPLETE ENGINE.
You will receive a "prefix" which is the code currently before the cursor.
Return ONLY the continuation text to insert at the cursor position.
DO NOT return any explanation, commentary, or markdown.
Return raw code only.`;

        return `${system}

Prefix:
${request.contextBefore}

Suffix:
${request.contextAfter || ""}

Return the single best completion (no explanations). Short is good — keep it <= 48 tokens.`;
    }

    /**
     * Build chat prompt from messages
     */
    private buildChatPrompt(messages: Array<{ role: string; content: string }>): string {
        return messages
            .map((msg) => {
                if (msg.role === "system") return `System: ${msg.content}`;
                if (msg.role === "user") return `User: ${msg.content}`;
                return `Assistant: ${msg.content}`;
            })
            .join("\n\n");
    }

    /**
     * Extract and clean completion from response
     */
    private extractCompletion(response: string): string {
        let cleaned = response;

        // Remove markdown code blocks
        cleaned = cleaned.replace(/```[\w]*\n?/g, "").replace(/```/g, "");

        // Split into lines and filter aggressively
        const lines = cleaned.split(/\r?\n/);
        const filtered = lines.filter(line => {
            const trimmed = line.trim();
            if (!trimmed) return false;

            // Drop common explanation prefixes (STRICT)
            if (/^(It seems|It looks|Here is|Here's|Note:|Explanation:|Your code|The code|This|Sure|I've|I have|Certainly|Of course)/i.test(trimmed)) {
                return false;
            }

            // Drop lines that are pure English sentences (no code characters)
            const hasCodeChars = /[\{\}\[\]();=><]/.test(trimmed);
            if (!hasCodeChars) {
                // If no code chars, check if it contains code keywords
                const hasCodeKeywords = /\b(return|function|const|let|var|if|else|for|while|class|import|export|async|await)\b/.test(trimmed);
                if (!hasCodeKeywords) return false;
            }

            return true;
        });

        if (filtered.length === 0) return "";

        // Find first line that looks most like code
        let codeLine = "";
        for (const line of filtered) {
            // Prioritize lines with actual code structure
            if (/[\{\};=()\[\]]/.test(line)) {
                codeLine = line.trim();
                break;
            }
        }

        // If no strong code line found, take first filtered line
        if (!codeLine && filtered.length > 0) {
            codeLine = filtered[0].trim();
        }

        // Strip inline comments
        codeLine = codeLine.replace(/\s*\/\/.*$/, "");

        // Strip block comments  
        codeLine = codeLine.replace(/\/\*.*?\*\//g, "");

        return codeLine.trim();
    }

    /**
     * Update configuration
     */
    updateConfig(config: Partial<AIConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Get current configuration
     */
    getConfig(): AIConfig {
        return { ...this.config };
    }
}

// Singleton instance
let ollamaServiceInstance: OllamaService | null = null;

export const getOllamaService = (): OllamaService => {
    if (!ollamaServiceInstance) {
        ollamaServiceInstance = new OllamaService();
    }
    return ollamaServiceInstance;
};
