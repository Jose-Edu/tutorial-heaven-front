import type { ReactNode } from "react";
import Footer from "@/components/Footer";
import { Header } from "@/components/Header";

type MainLayoutProps = {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
};

export function MainLayout({ children, className = "", footer }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className={`flex-1 ${className}`}>{children}</main>
      {footer ?? <Footer />}
    </div>
  );
}