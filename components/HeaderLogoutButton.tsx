"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function HeaderLogoutButton() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleLogout() {
    setIsSubmitting(true);
    setError(null);

    try {
      await logout();
      router.replace("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível encerrar a sessão agora.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isSubmitting}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saindo..." : "Sair"}
      </button>
      {error ? (
        <span
          role="alert"
          className="absolute right-4 top-full z-30 mt-2 max-w-[calc(100vw-2rem)] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground shadow-md"
        >
          {error}
        </span>
      ) : null}
    </>
  );
}
