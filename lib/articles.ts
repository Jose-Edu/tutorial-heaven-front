export type ArticleMetadata = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Article = ArticleMetadata & {
  content: string;
};

export type CreateArticleInput = {
  title: string;
  description: string;
  content: string;
};

export type UpdateArticleInput = CreateArticleInput;
export type ArticleFieldErrors = Record<string, string[]>;

type ArticlePayload = Partial<Article> & { data?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function unwrapPayload(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  const candidate = payload as ArticlePayload;
  return isRecord(candidate.data) ? candidate.data : payload;
}

export function normalizeArticle(payload: unknown): Article | null {
  const value = unwrapPayload(payload);
  if (!value || (typeof value.id !== "string" && typeof value.id !== "number") || typeof value.title !== "string" || typeof value.content !== "string") return null;

  return {
    id: String(value.id),
    title: value.title,
    description: readNullableString(value.description),
    content: value.content,
    createdAt: readNullableString(value.createdAt ?? value.created_at),
    updatedAt: readNullableString(value.updatedAt ?? value.updated_at),
  };
}

export function normalizeArticleMetadata(payload: unknown): ArticleMetadata | null {
  const value = unwrapPayload(payload);
  if (!value || (typeof value.id !== "string" && typeof value.id !== "number") || typeof value.title !== "string") return null;

  return {
    id: String(value.id),
    title: value.title,
    description: readNullableString(value.description),
    createdAt: readNullableString(value.createdAt ?? value.created_at),
    updatedAt: readNullableString(value.updatedAt ?? value.updated_at),
  };
}

export function getArticleErrorMessage(payload: unknown, fallback: string) {
  if (!isRecord(payload)) return fallback;
  const message = typeof payload.message === "string" ? payload.message : undefined;
  const error = typeof payload.error === "string" ? payload.error : undefined;
  const fieldErrors = isRecord(payload.errors) ? payload.errors : null;
  const firstFieldError = fieldErrors
    ? Object.values(fieldErrors).find((value): value is string[] => Array.isArray(value) && typeof value[0] === "string")?.[0]
    : undefined;
  return message ?? error ?? firstFieldError ?? fallback;
}

export function getArticleFieldErrors(payload: unknown): ArticleFieldErrors {
  if (!isRecord(payload) || !isRecord(payload.errors)) return {};
  return Object.fromEntries(
    Object.entries(payload.errors).filter(([, value]) => Array.isArray(value) && value.every((item) => typeof item === "string")),
  ) as ArticleFieldErrors;
}

function getRequestHeaders() {
  const headers: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const storedAuth = window.localStorage.getItem("tutorial-heaven-auth");
    if (storedAuth) {
      try {
        const token = JSON.parse(storedAuth) as { token?: unknown };
        if (typeof token.token === "string" && token.token) headers.Authorization = `Bearer ${token.token}`;
      } catch {
        window.localStorage.removeItem("tutorial-heaven-auth");
      }
    }
  }
  return headers;
}

async function readResponse(response: Response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(getArticleErrorMessage(payload, response.statusText || "Não foi possível concluir a operação."));
    Object.assign(error, { fieldErrors: getArticleFieldErrors(payload) });
    throw error;
  }
  return payload;
}

async function requestArticle(path: string, init: RequestInit = {}) {
  const response = await fetch(path, { ...init, headers: { ...getRequestHeaders(), ...init.headers }, cache: "no-store" });
  return readResponse(response);
}

export async function getArticle(id: string, signal?: AbortSignal) {
  const payload = await requestArticle(`/api/articles/${encodeURIComponent(id)}`, { signal });
  const article = normalizeArticle(payload);
  if (!article) throw new Error("A resposta do artigo está incompleta.");
  return article;
}

export async function createArticle(input: CreateArticleInput) {
  const payload = await requestArticle("/api/articles", { method: "POST", body: JSON.stringify(input) });
  return normalizeArticle(payload);
}

export async function updateArticle(id: string, input: UpdateArticleInput) {
  const payload = await requestArticle(`/api/articles/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
  return normalizeArticle(payload);
}

export function getArticleErrorFields(error: unknown): ArticleFieldErrors {
  if (!isRecord(error) || !isRecord(error.fieldErrors)) return {};
  return error.fieldErrors as ArticleFieldErrors;
}

export function toArticleInput(input: CreateArticleInput): CreateArticleInput {
  return { title: readString(input.title).trim(), description: readString(input.description).trim(), content: readString(input.content).trim() };
}