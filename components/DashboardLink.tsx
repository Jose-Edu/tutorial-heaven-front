"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export function DashboardLink() {
  const { user, status } = useAuth();

  if (status !== "authenticated" || !user) {
    return null;
  }

  return (
    <Link
      href="/dashboard"
      className="hidden rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex"
    >
      Painel
    </Link>
  );
}
