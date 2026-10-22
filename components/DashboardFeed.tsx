"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { FeedbackState } from "@/components/FeedbackState";
import { SearchResultCard } from "@/components/SearchResultCard";
import { getArticlesByMyTags, type ArticleMetadata } from "@/lib/articles";
import { HttpError } from "@/lib/http";

export function DashboardFeed() {
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setArticles(await getArticlesByMyTags());
    } catch (reason) {
      setError(reason);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getArticlesByMyTags(controller.signal).then(
      (result) => {
        if (controller.signal.aborted) return;
        setArticles(result);
        setIsLoading(false);
      },
      (reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason);
        setIsLoading(false);
      },
    );

    return () => controller.abort();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Carregando artigos">
        {[1, 2, 3].map((item) => (
          <Skeleton key={item} variant="rounded" height={210} />
        ))}
      </div>
    );
  }

  if (error) {
    const httpError = error instanceof HttpError ? error : null;

    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" onClick={() => void reloadArticles()}>
            Tentar novamente
          </Button>
        }
      >
        {httpError?.status === 401
          ? "Entre na sua conta para ver os artigos recomendados."
          : httpError?.status === 403
            ? "Você não tem permissão para consultar os artigos."
            : error instanceof Error
              ? error.message
              : "Não foi possível carregar os artigos."}
      </Alert>
    );
  }

  if (articles.length === 0) {
    return (
      <FeedbackState
        title="Nenhum artigo por aqui ainda"
        description="Não encontramos artigos com as tags que você escolheu. Volte em breve — novos tutoriais entram por aqui."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <SearchResultCard key={article.id} {...article} />
      ))}
    </div>
  );
}
