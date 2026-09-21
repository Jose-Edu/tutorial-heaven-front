import type { ReactNode } from "react";

type FeedbackStateProps = {
  title: string;
  description: string;
  type?: "empty" | "error";
  children?: ReactNode;
  className?: string;
};

export function FeedbackState({ title, description, type = "empty", children, className = "" }: FeedbackStateProps) {
  const icon = type === "error" ? "!" : "-";

  return (
    <section role={type === "error" ? "alert" : undefined} className={`flex min-h-64 flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-12 text-center ${className}`}>
      <span className="grid size-12 place-items-center rounded-full border border-border bg-surface-muted text-lg font-semibold text-muted" aria-hidden="true">{icon}</span>
      <h2 className="mt-5 text-lg font-semibold text-card-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}