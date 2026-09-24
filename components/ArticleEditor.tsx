"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { PageContainer } from "@/components/PageContainer";
import { SectionWrapper } from "@/components/SectionWrapper";
import { createArticle, getArticle, getArticleErrorFields, toArticleInput, updateArticle, type ArticleFieldErrors, type CreateArticleInput } from "@/lib/articles";
import "@uiw/react-md-editor/markdown-editor.css";

const MarkdownEditor = dynamic(() => import("@uiw/react-md-editor").then((module) => module.default), { ssr: false });

type ArticleForm = CreateArticleInput;
type Feedback = { type: "success" | "error"; message: string } | null;

const emptyForm: ArticleForm = { title: "", description: "", content: "" };

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
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  useEffect(() => {
    if (isNewArticle) return;
    const controller = new AbortController();

    async function loadArticle() {
      try {
        const article = await getArticle(id, controller.signal);
        setForm({ title: article.title, description: article.description ?? "", content: article.content });
      } catch (error) {
        if (!controller.signal.aborted) setFeedback({ type: "error", message: error instanceof Error ? error.message : "Não foi possível carregar o artigo." });
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
      const input = toArticleInput(form);
      if (isNewArticle) await createArticle(input);
      else await updateArticle(id, input);
      setFeedback({ type: "success", message: "Artigo salvo com sucesso." });
    } catch (error) {
      setFieldErrors(getArticleErrorFields(error));
      setFeedback({ type: "error", message: error instanceof Error ? error.message : "Não foi possível conectar ao backend agora." });
    } finally {
      setIsSaving(false);
    }
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

          {feedback ? <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3 }}>{feedback.message}</Alert> : null}
          {isLoading ? <div className="flex min-h-64 items-center justify-center"><CircularProgress color="primary" /></div> : (
            <form onSubmit={saveArticle}>
              <Stack spacing={3}>
                <TextField label="Título" value={form.title} onChange={(event) => updateField("title", event.target.value)} error={Boolean(fieldErrors.title)} helperText={fieldErrors.title?.[0]} required fullWidth />
                <TextField label="Descrição" value={form.description} onChange={(event) => updateField("description", event.target.value)} error={Boolean(fieldErrors.description)} helperText={fieldErrors.description?.[0]} fullWidth multiline minRows={2} />
                <div data-color-mode={isDark ? "dark" : "light"} className="article-editor overflow-hidden rounded-md border border-border bg-card">
                  <MarkdownEditor value={form.content} onChange={(value) => updateField("content", value ?? "")} height={520} preview="edit" textareaProps={{ placeholder: "Escreva o conteúdo do artigo em Markdown..." }} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" variant="contained" disabled={isSaving || !form.content.trim()} sx={{ minWidth: 140, borderRadius: "6px", backgroundColor: "var(--primary)", boxShadow: "none", textTransform: "none", fontWeight: 700, "&:hover": { backgroundColor: "var(--accent-foreground)", boxShadow: "none" } }}>
                    {isSaving ? <CircularProgress size={20} color="inherit" /> : "Salvar artigo"}
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