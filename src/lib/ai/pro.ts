export type PlanType = "free" | "pro_student";

export type SubscriptionData = {
  plan: PlanType;
  status: "active" | "inactive";
  startedAt: string | null;
};

const SUBSCRIPTION_KEY = "codecraft-subscription-v1";

export const getSubscription = (): SubscriptionData => {
  if (typeof window === "undefined") {
    return {
      plan: "free",
      status: "inactive",
      startedAt: null,
    };
  }

  const raw = localStorage.getItem(SUBSCRIPTION_KEY);

  if (!raw) {
    return {
      plan: "free",
      status: "inactive",
      startedAt: null,
    };
  }

  try {
    return JSON.parse(raw) as SubscriptionData;
  } catch {
    return {
      plan: "free",
      status: "inactive",
      startedAt: null,
    };
  }
};

export const setProStudentPlan = () => {
  if (typeof window === "undefined") return;

  const data: SubscriptionData = {
    plan: "pro_student",
    status: "active",
    startedAt: new Date().toISOString(),
  };

  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
};

export const setFreePlan = () => {
  if (typeof window === "undefined") return;

  const data: SubscriptionData = {
    plan: "free",
    status: "inactive",
    startedAt: null,
  };

  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(data));
};

export const isProStudent = (): boolean => {
  const subscription = getSubscription();
  return subscription.plan === "pro_student" && subscription.status === "active";
};