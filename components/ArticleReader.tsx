"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { ArticleViewer } from "@/components/ArticleViewer";
import { PageContainer } from "@/components/PageContainer";
import { SectionWrapper } from "@/components/SectionWrapper";
import { getArticle } from "@/lib/articles";

export function ArticleReader({ id }: { id: string }) {
  const [article, setArticle] = useState<Awaited<ReturnType<typeof getArticle>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    getArticle(id, controller.signal)
      .then(setArticle)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Não foi possível carregar o artigo.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  return (
    <PageContainer>
      <SectionWrapper>
        {isLoading ? <div className="flex min-h-64 items-center justify-center"><CircularProgress color="primary" /></div> : null}
        {!isLoading && error ? <Alert severity="error">{error}</Alert> : null}
        {!isLoading && !error && article ? <ArticleViewer article={article} /> : null}
      </SectionWrapper>
    </PageContainer>
  );
}