"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { SearchResultCard } from "@/components/SearchResultCard";
import { getArticles, getRecommendedArticles, type ArticleMetadata } from "@/lib/articles";
import { HttpError } from "@/lib/http";
import { FeedbackState } from "@/components/FeedbackState";

export type ArticleResultsSource = "search" | "recommended";

type ArticleSearchResultsProps = {
  term: string;
  source?: ArticleResultsSource;
};

export function ArticleSearchResults({ term, source = "search" }: ArticleSearchResultsProps) {
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchArticles = source === "recommended" ? getRecommendedArticles : getArticles;

  const loadArticles = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      setArticles(await fetchArticles(signal));
    } catch (reason) {
      if (!signal?.aborted) setError(reason);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [fetchArticles]);

  useEffect(() => {
    const controller = new AbortController();
    fetchArticles(controller.signal).then(
      (result) => {
        if (!controller.signal.aborted) setArticles(result);
      },
      (reason: unknown) => {
        if (!controller.signal.aborted) setError(reason);
      },
    ).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => controller.abort();
  }, [fetchArticles]);

  const results = useMemo(() => {
    if (source === "recommended") return articles;

    const normalizedTerm = term.toLocaleLowerCase("pt-BR");
    return normalizedTerm
      ? articles.filter(({ title, description }) =>
          `${title} ${description ?? ""}`.toLocaleLowerCase("pt-BR").includes(normalizedTerm),
        )
      : [];
  }, [articles, source, term]);

  if (isLoading) {
    return <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={210} />)}</div>;
  }

  if (error) {
    const status = error instanceof HttpError ? error.status : 0;
    return (
      <Alert
        severity="error"
        action={status === 401
          ? <Button color="inherit" component={Link} href="/">Entrar</Button>
          : <Button color="inherit" onClick={() => void loadArticles()}>Tentar novamente</Button>}
      >
        {status === 401
          ? source === "recommended"
            ? "Entre na sua conta para ver artigos recomendados."
            : "Entre na sua conta para pesquisar artigos."
          : status === 403
            ? source === "recommended"
              ? "Você não tem permissão para ver artigos recomendados."
              : "Você não tem permissão para pesquisar artigos."
            : error instanceof Error
              ? error.message
              : source === "recommended"
                ? "Não foi possível carregar os artigos recomendados."
                : "Não foi possível carregar os artigos."}
      </Alert>
    );
  }

  return results.length > 0 ? (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {results.map((result) => <SearchResultCard key={result.id} {...result} />)}
    </div>
  ) : (
    <FeedbackState
      title={source === "recommended" ? "Nenhuma recomendação encontrada" : "Nenhum resultado encontrado"}
      description={source === "recommended"
        ? "Ainda não há artigos recomendados para o seu perfil."
        : term
          ? `Não encontramos tutoriais para "${term}". Tente buscar por outro termo.`
          : "Digite um termo na busca para encontrar tutoriais."}
    />
  );
}
