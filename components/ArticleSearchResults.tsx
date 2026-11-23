"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Skeleton from "@mui/material/Skeleton";
import { SearchResultCard } from "@/components/SearchResultCard";
import { useAuth } from "@/components/AuthProvider";
import { deleteArticle, getArticles, getRecommendedArticles, type ArticleMetadata } from "@/lib/articles";
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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<ArticleMetadata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const canManageArticles = user?.role === "admin";
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

  async function confirmDelete() {
    if (!articleToDelete) return;
    setIsDeleting(true);
    setError(null);

    try {
      await deleteArticle(articleToDelete.id);
      setArticles((current) => current.filter((article) => article.id !== articleToDelete.id));
      setFeedback({ type: "success", message: "Artigo excluído com sucesso." });
      setArticleToDelete(null);
    } catch (reason) {
      setFeedback({
        type: "error",
        message: reason instanceof Error ? reason.message : "Não foi possível excluir o artigo.",
      });
      setArticleToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  }

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
    <>
      {feedback ? (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3 }}>
          {feedback.message}
        </Alert>
      ) : null}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.map((result) => (
          <div key={result.id} className="flex flex-col gap-2">
            <SearchResultCard {...result} />
            {canManageArticles ? (
              <div className="flex flex-wrap gap-2">
                <Button component={Link} href={`/edit/${encodeURIComponent(result.id)}`} variant="outlined" size="small" aria-label={`Editar ${result.title}`}>
                  Editar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => setArticleToDelete(result)}
                  aria-label={`Excluir ${result.title}`}
                >
                  Excluir
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <Dialog open={Boolean(articleToDelete)} onClose={() => (isDeleting ? undefined : setArticleToDelete(null))}>
        <DialogTitle>Excluir artigo?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`O artigo "${articleToDelete?.title ?? ""}" será excluído permanentemente.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArticleToDelete(null)} disabled={isDeleting}>Cancelar</Button>
          <Button onClick={() => void confirmDelete()} color="error" disabled={isDeleting} autoFocus>
            {isDeleting ? <CircularProgress size={18} color="inherit" /> : "Excluir"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
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
