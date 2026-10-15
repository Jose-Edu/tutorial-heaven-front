"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import TagSelectionForm from "@/components/TagSelectionForm";
import { PageContainer } from "@/components";
import { useAuth } from "@/components/AuthProvider";
import { getNeedsOnboarding } from "@/lib/mock-user-state";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, status } = useAuth();

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!user) {
      router.replace("/");
    }
  }, [router, status, user]);

  if (status === "loading" || !user) {
    return null;
  }

  const needsOnboarding = getNeedsOnboarding(user);
  const canManageArticles = user.role === "admin";

  if (needsOnboarding) {
    return (
      <PageContainer className="py-10 sm:py-14">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Define o teu perfil dev</h1>
          <p className="mt-2 text-muted">
            Seleciona as tuas tecnologias e competências para personalizarmos a tua experiência.
          </p>
        </div>

        <TagSelectionForm />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground">Tags dos artigos</h1>
        <p className="mt-2 text-muted">
          As tags são consultadas e selecionadas diretamente no formulário de criação ou edição de cada artigo.
        </p>
      </div>

      {!canManageArticles ? (
        <div className="mx-auto max-w-xl">
          <Alert severity="warning">
            Você precisa de permissão de administrador para criar artigos.
          </Alert>
        </div>
      ) : (
        <div className="flex justify-center">
          <Link
            href="/edit/novo"
            className="rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:bg-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Criar artigo
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
