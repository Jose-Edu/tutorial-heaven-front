import type { ReactNode } from "react";

type FooterProps = {
    children?: ReactNode;
    className?: string;
};

export default function Footer({ children, className = "" }: FooterProps) {
    return (
        <footer id="community" className={`border-t border-border bg-surface ${className}`}>
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
                <div>
                    <p className="text-sm font-semibold text-foreground">Tutorial Heaven</p>
                    <p className="mt-3 max-w-xs text-sm leading-6 text-muted">Construído para quem continua curioso.</p>
                </div>
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Explore</h2>
                    <nav className="mt-4 flex flex-col gap-3 text-sm text-muted" aria-label="Links do rodapé">
                        <a className="transition-colors hover:text-primary" href="#tutorials">Tutoriais</a>
                        <a className="transition-colors hover:text-primary" href="#paths">Trilhas</a>
                    </nav>
                </div>
                <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">Contato</h2>
                    <address className="mt-4 not-italic text-sm text-muted">
                        <a className="transition-colors hover:text-primary" href="mailto:hello@tutorialheaven.dev">hello@tutorialheaven.dev</a>
                    </address>
                </div>
                <span className="self-end">© 2026 Tutorial Heaven</span>
                <div className="flex justify-center p-2">
                </div>
            </div>
        </footer>
    );
}