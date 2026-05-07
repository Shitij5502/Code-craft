"use client";

import { useEffect, useState } from "react";
import {
  getSubscription,
  isProStudent,
  setFreePlan,
  setProStudentPlan,
  type SubscriptionData,
} from "@/lib/ai/pro";

const PRO_EVENT = "codecraft-pro-updated";

export function useProAccess() {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    plan: "free",
    status: "inactive",
    startedAt: null,
  });

  const refreshSubscription = () => {
    setSubscription(getSubscription());
  };

  useEffect(() => {
    refreshSubscription();

    const handleProUpdate = () => {
      refreshSubscription();
    };

    window.addEventListener(PRO_EVENT, handleProUpdate);
    window.addEventListener("storage", handleProUpdate);

    return () => {
      window.removeEventListener(PRO_EVENT, handleProUpdate);
      window.removeEventListener("storage", handleProUpdate);
    };
  }, []);

  const upgradeToPro = () => {
    setProStudentPlan();
    refreshSubscription();
    window.dispatchEvent(new Event(PRO_EVENT));
  };

  const downgradeToFree = () => {
    setFreePlan();
    refreshSubscription();
    window.dispatchEvent(new Event(PRO_EVENT));
  };

  return {
    subscription,
    hasProAccess:
      subscription.plan === "pro_student" &&
      subscription.status === "active",
    upgradeToPro,
    downgradeToFree,
    refreshSubscription,
  };
}