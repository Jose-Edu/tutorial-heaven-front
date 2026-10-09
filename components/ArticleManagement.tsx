"use client";

import { useCallback, useEffect, useState } from "react";
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
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { SearchResultCard } from "@/components/SearchResultCard";
import { useAuth } from "@/components/AuthProvider";
import { deleteArticle, getArticles, type ArticleMetadata } from "@/lib/articles";
import { HttpError } from "@/lib/http";

export function ArticleManagement() {
  const [articles, setArticles] = useState<ArticleMetadata[]>([]);
  const [error, setError] = useState<unknown>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [articleToDelete, setArticleToDelete] = useState<ArticleMetadata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { status: authStatus } = useAuth();

  const loadArticles = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getArticles(signal);
      if (!signal?.aborted) setArticles(result);
    } catch (reason) {
      if (!signal?.aborted) setError(reason);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getArticles(controller.signal).then(
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
  }, []);

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

  if (authStatus === "loading") {
    return <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Verificando sessão">{[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={210} />)}</div>;
  }

  const httpError = error instanceof HttpError ? error : null;

  return (
    <>
      {feedback ? (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3 }}>
          {feedback.message}
        </Alert>
      ) : null}
      {error ? (
        <Alert
          severity="error"
          action={
            httpError?.status === 401 ? (
              <Button color="inherit" component={Link} href="/">Entrar</Button>
            ) : (
              <Button color="inherit" onClick={() => void loadArticles()}>Tentar novamente</Button>
            )
          }
          sx={{ mb: 3 }}
        >
          {httpError?.status === 401
            ? "Entre na sua conta para consultar os artigos."
            : httpError?.status === 403
              ? "Você não tem permissão para consultar os artigos."
              : error instanceof Error
                ? error.message
                : "Não foi possível carregar os artigos."}
        </Alert>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Carregando artigos">{[1, 2, 3].map((item) => <Skeleton key={item} variant="rounded" height={210} />)}</div>
      ) : !error && articles.length === 0 ? (
        <Alert severity="info">Ainda não há artigos publicados.</Alert>
      ) : !error ? (
        <Stack spacing={2}>
          <Typography variant="body2" sx={{ color: "var(--muted)" }}>
            {articles.length} {articles.length === 1 ? "artigo" : "artigos"}
          </Typography>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <div key={article.id} className="flex flex-col gap-2">
                <SearchResultCard {...article} />
                <div className="flex flex-wrap gap-2">
                  <Button component={Link} href={`/edit/${encodeURIComponent(article.id)}`} variant="outlined" size="small" aria-label={`Editar ${article.title}`}>
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => setArticleToDelete(article)}
                    aria-label={`Excluir ${article.title}`}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Stack>
      ) : null}

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
  );
}
