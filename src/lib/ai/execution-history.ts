export type ExecutionHistoryItem = {
  id: string;
  language: string;
  code: string;
  output: string;
  error: string | null;
  createdAt: string;
  plan: "free" | "pro_student";
};

const EXECUTION_HISTORY_KEY = "codecraft-execution-history-v1";

export const getExecutionHistory = (): ExecutionHistoryItem[] => {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(EXECUTION_HISTORY_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as ExecutionHistoryItem[];
  } catch {
    return [];
  }
};

export const saveExecutionHistory = (item: ExecutionHistoryItem) => {
  if (typeof window === "undefined") return;

  const existing = getExecutionHistory();
  const next = [item, ...existing].slice(0, 100);

  localStorage.setItem(EXECUTION_HISTORY_KEY, JSON.stringify(next));
};

export const clearExecutionHistory = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(EXECUTION_HISTORY_KEY);
};

export const getWeeklyExecutionStats = () => {
  const history = getExecutionHistory();
  const now = new Date();

  const last7Days = history.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();
    const isWithin7Days = now.getTime() - createdAt <= 7 * 24 * 60 * 60 * 1000;

    return isWithin7Days && item.plan === "pro_student";
  });

  const activeDays = new Set(
    last7Days.map((item) => new Date(item.createdAt).toDateString())
  );

  const languageUsage: Record<string, number> = {};

  last7Days.forEach((item) => {
    languageUsage[item.language] = (languageUsage[item.language] || 0) + 1;
  });

  const favoriteLanguage =
    Object.entries(languageUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || "None";

  return {
    totalRuns: last7Days.length,
    totalErrors: last7Days.filter((item) => Boolean(item.error)).length,
    activeDays: activeDays.size,
    favoriteLanguage,
  };
};