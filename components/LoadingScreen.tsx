import type { ReactNode } from "react";

type LoadingScreenProps = {
  children?: ReactNode;
  className?: string;
};

export function LoadingScreen({ children, className = "" }: LoadingScreenProps) {
  return (
    <div role="status" aria-live="polite" className={`fixed inset-0 z-50 grid min-h-screen place-items-center bg-background text-foreground ${className}`}>
      <div className="flex flex-col items-center gap-4 px-6 text-center">
        <span className="size-9 animate-spin rounded-full border-2 border-border border-t-primary" aria-hidden="true" />
        <span className="text-sm text-muted">{children ?? "Carregando..."}</span>
      </div>
    </div>
  );
}