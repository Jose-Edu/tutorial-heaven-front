import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import '@/app/globals.css';
import { MainLayout } from "@/components/MainLayout";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <title>Tutorial Heaven</title>
        <meta name="description" content="Tutoriais claros para construir coisas extraordinárias." />
      </head>
      <body>
        <AppRouterCacheProvider>
          <MainLayout>{children}</MainLayout>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
