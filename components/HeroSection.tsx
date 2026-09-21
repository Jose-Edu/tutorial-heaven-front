import type { ReactNode } from "react";

type HeroSectionProps = {
  title: ReactNode;
  subtitle: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function HeroSection({ title, subtitle, children, className = "" }: HeroSectionProps) {
  return (
    <section className={`bg-foreground text-background ${className}`}>
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-background/75 sm:text-lg">{subtitle}</p>
        </div>
        {children ? <div className="flex w-full flex-wrap items-center gap-3">{children}</div> : null}
      </div>
    </section>
  );
}