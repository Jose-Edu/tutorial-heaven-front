import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import '@/app/globals.css';
import { MainLayout } from "@/components/MainLayout";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <title>Tutorial Heaven</title>
        <meta name="description" content="Tutoriais claros para construir coisas extraordinárias." />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `(() => { const key = "tutorial-heaven-theme"; const saved = localStorage.getItem(key); const dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; document.documentElement.classList.toggle("dark", dark); })();` }} />
        <AppRouterCacheProvider>
          <MainLayout>{children}</MainLayout>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
