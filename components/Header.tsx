import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchBar } from "@/components/SearchBar";
import { DashboardLink } from "@/components/DashboardLink";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background">
      <nav className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8" aria-label="Navegação principal">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight text-foreground">
          <span className="whitespace-nowrap text-xl font-bold">Tutorial Heaven</span>
        </Link>
        <div className="flex min-w-0 flex-1 justify-end gap-2 md:justify-center">
          <SearchBar />
        </div>
        <div className="flex items-center gap-2">
          <DashboardLink />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}