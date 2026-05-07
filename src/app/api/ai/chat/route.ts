import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message, code = "", language = "javascript" } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const ollamaUrl = process.env.OLLAMA_ENDPOINT || "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL || "deepseek-coder:1.3b";

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: false,
        prompt: `You are a helpful coding assistant.

Language: ${language}

Code:
${code}

Question:
${message}

Give a clear helpful answer.`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "Ollama request failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: data.response || "No response generated.",
    });
  } catch (error) {
    console.error("OLLAMA AI ERROR:", error);

    return NextResponse.json(
      { error: "AI request failed" },
      { status: 500 }
    );
  }
}