import type { ReactNode } from "react";

type SectionWrapperProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function SectionWrapper({ children, className = "", id }: SectionWrapperProps) {
  return <section id={id} className={`py-12 md:py-16 lg:py-24 ${className}`}>{children}</section>;
}