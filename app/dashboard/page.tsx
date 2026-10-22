"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import { PageContainer } from "@/components/PageContainer";
import { SectionWrapper } from "@/components/SectionWrapper";
import { DashboardFeed } from "@/components/DashboardFeed";
import { useAuth } from "@/components/AuthProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, status } = useAuth();

  const hasTags = (user?.tags?.length ?? 0) > 0;

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!user) {
      router.replace("/");
      return;
    }

    if (!hasTags) {
      router.replace("/onboarding");
    }
  }, [hasTags, router, status, user]);

  if (status === "loading" || !user) {
    return null;
  }

  return (
    <PageContainer>
      <SectionWrapper>
        <section className="mb-10 border-b border-border pb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">O seu painel</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {user.name ? `Olá, ${user.name}` : "O seu painel"}
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Artigos relacionados com as tags que você escolheu. Fica de olho que a lista cresce toda semana.
          </p>

          {user.tags && user.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Suas tags">
              {user.tags.map((tag) => (
                <li
                  key={String(tag.id)}
                  className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-foreground"
                >
                  {tag.name ?? `#${tag.id}`}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        {!hasTags ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            Escolha algumas tags para receber recomendações de artigos.
          </Alert>
        ) : null}

        <h2 className="mb-6 text-xl font-semibold text-foreground">Artigos para você</h2>

        <DashboardFeed />
      </SectionWrapper>
    </PageContainer>
  );
}
