"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useAuth } from "@/components/AuthProvider";
import { TagSelectionForm } from "@/components/TagSelectionForm";
import { PageContainer } from "@/components/PageContainer";
import { SectionWrapper } from "@/components/SectionWrapper";
import { HttpError } from "@/lib/http";
import { createArticle, getArticle, getArticleErrorFields, toArticleInput, updateArticle, type ArticleFieldErrors, type CreateArticleInput } from "@/lib/articles";
import "@uiw/react-md-editor/markdown-editor.css";

const MarkdownEditor = dynamic(() => import("@uiw/react-md-editor").then((module) => module.default), { ssr: false });

type ArticleForm = CreateArticleInput;
type Feedback = { type: "success" | "error"; message: string } | null;

const emptyForm: ArticleForm = { content: "" };

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getThemeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getServerThemeSnapshot() {
  return false;
}

export function ArticleEditor({ id }: { id: string }) {
  const isNewArticle = id === "novo";
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [fieldErrors, setFieldErrors] = useState<ArticleFieldErrors>({});
  const [isLoading, setIsLoading] = useState(!isNewArticle);
  const [isSaving, setIsSaving] = useState(false);
  const [hasCreated, setHasCreated] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<unknown>(null);
  const { status: authStatus, error: authError, user } = useAuth();
  const canManageArticles = user?.role === "admin";
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    if (isNewArticle) return;
    const controller = new AbortController();

    async function loadArticle() {
      try {
        const article = await getArticle(id, controller.signal);
        setForm({ content: article.content });
        setSelectedTagIds(article.tags.map((tag) => String(tag.id)));
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error);
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadArticle();
    return () => controller.abort();
  }, [id, isNewArticle]);

  function updateField(field: keyof ArticleForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveArticle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setFieldErrors({});
    setIsSaving(true);

    try {
      const input = toArticleInput({ ...form, tagIds: selectedTagIds.map(Number).filter(Number.isInteger) });
      if (isNewArticle) {
        await createArticle(input);
        setHasCreated(true);
      }
      else await updateArticle(id, input);
      setFeedback({ type: "success", message: "Artigo salvo com sucesso." });
    } catch (error) {
      setFieldErrors(getArticleErrorFields(error));
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Não foi possível conectar ao backend agora." });
    } finally {
      setIsSaving(false);
    }
  }

  if (authStatus === "loading") {
    return <PageContainer><SectionWrapper><div className="flex min-h-64 items-center justify-center" role="status" aria-label="Verificando sessão"><CircularProgress color="primary" /></div></SectionWrapper></PageContainer>;
  }

  if (authStatus === "unauthenticated") {
    return <PageContainer><SectionWrapper><Alert severity="warning" action={<Button component={Link} href="/">Entrar</Button>}>Entre na sua conta para criar ou editar artigos.</Alert></SectionWrapper></PageContainer>;
  }

  if (authStatus === "error") {
    return <PageContainer><SectionWrapper><Alert severity="error">{authError ?? "Não foi possível validar sua sessão."}</Alert></SectionWrapper></PageContainer>;
  }

  if (authStatus === "authenticated" && !canManageArticles) {
    return <PageContainer><SectionWrapper><Alert severity="warning">Você não tem permissão para criar ou editar artigos.</Alert></SectionWrapper></PageContainer>;
  }

  return (
    <PageContainer>
      <SectionWrapper>
        <div className="article-editor-shell mx-auto max-w-5xl">
          <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Administração</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">{isNewArticle ? "Criar artigo" : "Editar artigo"}</h1>
              <p className="mt-2 text-muted">Escreva em Markdown e publique uma versão clara e consistente.</p>
            </div>
            <Button component={Link} href={isNewArticle ? "/admin/dashboard" : `/page/${id}`} variant="outlined" sx={{ alignSelf: "flex-start", borderRadius: "6px", textTransform: "none", fontWeight: 700 }}>
              Cancelar
            </Button>
          </div>

          {feedback ? (
            <Alert
              severity={feedback.type}
              onClose={() => setFeedback(null)}
              action={feedback.type === "success" ? <Button component={Link} href="/admin/dashboard">Ver artigos</Button> : undefined}
              sx={{ mb: 3 }}
            >
              {feedback.message}
            </Alert>
          ) : null}
          {loadError ? (
            <Alert severity="error">
              {loadError instanceof HttpError && loadError.status === 404
                ? "O artigo solicitado não foi encontrado."
                : loadError instanceof HttpError && loadError.status === 403
                  ? "Você não tem permissão para editar este artigo."
                  : loadError instanceof HttpError && loadError.status === 401
                    ? "Sua sessão expirou. Entre novamente para continuar."
                    : loadError instanceof Error
                      ? loadError.message
                      : "Não foi possível carregar o artigo."}
            </Alert>
          ) : isLoading ? <div className="flex min-h-64 items-center justify-center" role="status" aria-label="Carregando artigo"><CircularProgress color="primary" /></div> : (
            <form onSubmit={saveArticle}>
              <Stack spacing={3}>
                <Alert severity="info" sx={{ mb: 0 }}>
                  Título e descrição são derivadas do conteúdo em Markdown do artigo, então o payload enviado à API usa apenas o campo <strong>content</strong>.
                </Alert>
                {fieldErrors.content?.[0] ? <Alert severity="error">{fieldErrors.content[0]}</Alert> : null}
                <div data-color-mode={isDark ? null : "light"} className={`article-editor overflow-hidden rounded-md border bg-card ${fieldErrors.content ? "border-red-600" : "border-border"}`}>
                  <MarkdownEditor value={form.content} onChange={(value) => updateField("content", value ?? "")} height={520} preview="edit" textareaProps={{ placeholder: "Escreva o conteúdo do artigo em Markdown..." }} />
                </div>
                <TagSelectionForm selectedTagIds={selectedTagIds} onChange={setSelectedTagIds} />
                <div className="flex justify-end">
                  <Button type="submit" variant="contained" disabled={isSaving || hasCreated || !form.content.trim()} sx={{ minWidth: 140, borderRadius: "6px", backgroundColor: "var(--primary)", boxShadow: "none", textTransform: "none", fontWeight: 700, "&:hover": { backgroundColor: "var(--primary-hover)", boxShadow: "none" } }}>
                    {isSaving ? <CircularProgress size={20} color="inherit" /> : hasCreated ? "Artigo criado" : "Salvar artigo"}
                  </Button>
                </div>
              </Stack>
            </form>
          )}
        </div>
      </SectionWrapper>
    </PageContainer>
  );
}