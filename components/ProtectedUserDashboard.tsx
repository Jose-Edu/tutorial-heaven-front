"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/components/AuthProvider";
import { getNeedsOnboarding } from "@/lib/mock-user-state";

export function ProtectedUserDashboard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, status } = useAuth();
  const needsOnboarding = user ? getNeedsOnboarding(user) : false;

  useEffect(() => {
    if (status === "loading") return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (user.role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }

    if (needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [needsOnboarding, router, status, user]);

  if (status !== "authenticated" || !user || user.role === "admin" || needsOnboarding) {
    return <LoadingScreen />;
  }

  return children;
}
