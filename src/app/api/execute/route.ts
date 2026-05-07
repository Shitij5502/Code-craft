import { NextResponse } from "next/server";

const LANGUAGE_ID_MAP: Record<string, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  go: 60,
  ruby: 72,
  rust: 73,
  swift: 83,
};
// This API route executes user code using Judge0
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const code = body.code || body.source_code;
    const language = body.language || "javascript";
    const languageId = body.language_id || LANGUAGE_ID_MAP[language];
    const stdin = body.stdin || "";

    if (!code || !languageId) {
      return NextResponse.json(
        { error: "Missing code or language_id" },
        { status: 400 }
      );
    }

    const JUDGE0_API_URL = process.env.JUDGE0_API_URL || "https://ce.judge0.com";

    const submission = await fetch(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin,
        }),
      }
    );

    const result = await submission.json();

    if (!submission.ok) {
      return NextResponse.json(
        {
          error: result.error || result.message || "Judge0 request failed",
        },
        { status: 500 }
      );
    }

    const output = result.stdout || "";
    const error = result.stderr || result.compile_output || null;

    return NextResponse.json({
      output,
      error,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      status: result.status,
    });
  } catch (error: any) {
    console.error("EXECUTE ERROR:", error);

    return NextResponse.json(
      {
        error: "Execution failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}