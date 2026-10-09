"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";
import { ArticleViewer } from "@/components/ArticleViewer";
import { PageContainer } from "@/components/PageContainer";
import { SectionWrapper } from "@/components/SectionWrapper";
import { getArticle } from "@/lib/articles";
import { HttpError } from "@/lib/http";

export function ArticleReader({ id }: { id: string }) {
  const [article, setArticle] = useState<Awaited<ReturnType<typeof getArticle>> | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getArticle(id, controller.signal)
      .then(setArticle)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  return (
    <PageContainer>
      <SectionWrapper>
        {isLoading ? <div className="flex min-h-64 items-center justify-center" role="status" aria-label="Carregando artigo"><CircularProgress color="primary" /></div> : null}
        {!isLoading && error ? (
          <Alert
            severity="error"
            action={error instanceof HttpError && error.status === 401 ? <Button component={Link} href="/">Entrar</Button> : undefined}
          >
            {error instanceof HttpError && error.status === 401
              ? "Entre na sua conta para visualizar este artigo."
              : error instanceof HttpError && error.status === 403
                ? "Você não tem permissão para visualizar este artigo."
                : error instanceof HttpError && error.status === 404
                  ? "O artigo solicitado não foi encontrado."
                  : error instanceof HttpError && error.status >= 500
                    ? "O serviço está indisponível no momento. Tente novamente mais tarde."
                    : error instanceof Error
                      ? error.message
                      : "Não foi possível carregar o artigo."}
          </Alert>
        ) : null}
        {!isLoading && !error && article ? <ArticleViewer article={article} /> : null}
      </SectionWrapper>
    </PageContainer>
  );
}