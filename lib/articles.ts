import { HttpError, requestJson } from "@/lib/http";

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
  content: string;
  title?: string;
  description?: string;
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

function stripMarkdownFormatting(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitleFromMarkdown(markdown: string) {
  const firstHeading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (firstHeading) return firstHeading;

  const firstTextLine = markdown
    .split(/\r?\n/)
    .map((line) => stripMarkdownFormatting(line))
    .find((line) => line.length > 0);

  return firstTextLine ?? "Artigo";
}

function extractDescriptionFromMarkdown(markdown: string) {
  const paragraphs = markdown
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => stripMarkdownFormatting(paragraph))
    .filter((paragraph) => paragraph.length > 0)
    .filter((paragraph) => !paragraph.startsWith("#"));

  if (paragraphs.length === 0) return null;

  const paragraph = paragraphs[0];
  return paragraph.length > 180 ? `${paragraph.slice(0, 177).trimEnd()}...` : paragraph;
}

function deriveTitle(value: Record<string, unknown>, markdown: string) {
  const explicit = readString(value.title).trim();
  if (explicit) return explicit;
  return extractTitleFromMarkdown(markdown).trim() || "Artigo";
}

function deriveDescription(value: Record<string, unknown>, markdown: string) {
  const explicit = readNullableString(value.description);
  if (explicit) return explicit;

  const title = extractTitleFromMarkdown(markdown).trim();
  const paragraphs = markdown
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => stripMarkdownFormatting(paragraph))
    .filter((paragraph) => paragraph.length > 0 && paragraph !== title)
    .filter((paragraph) => !paragraph.startsWith("#"));

  if (paragraphs.length === 0) return null;

  const choice = paragraphs[0];
  return choice.length > 180 ? `${choice.slice(0, 177).trimEnd()}...` : choice;
}

function unwrapPayload(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;
  const candidate = payload as ArticlePayload;
  return isRecord(candidate.data) ? candidate.data : payload;
}

export function encodeMarkdownBase64(markdown: string) {
  const bytes = new TextEncoder().encode(markdown);
  let binary = "";
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }

  return btoa(binary);
}

export function decodeMarkdownBase64(encoded: string) {
  if (
    !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded) ||
    encoded.length % 4 === 1 ||
    (encoded.includes("=") && encoded.length % 4 !== 0)
  ) {
    throw new Error("O conteúdo Markdown recebido não está em Base64 válido.");
  }

  try {
    const binary = atob(encoded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("Não foi possível decodificar o conteúdo Markdown em UTF-8.");
  }
}

export function normalizeArticle(payload: unknown): Article | null {
  const value = unwrapPayload(payload);
  if (!value || (typeof value.id !== "string" && typeof value.id !== "number")) return null;

  const contentValue = readString(value.content);
  if (!contentValue) return null;

  const content = decodeMarkdownBase64(contentValue);

  return {
    id: String(value.id),
    title: deriveTitle(value, content),
    description: deriveDescription(value, content),
    content,
    createdAt: readNullableString(value.createdAt ?? value.created_at),
    updatedAt: readNullableString(value.updatedAt ?? value.updated_at),
  };
}

export function normalizeArticleMetadata(payload: unknown): ArticleMetadata | null {
  const value = unwrapPayload(payload);
  if (!value || (typeof value.id !== "string" && typeof value.id !== "number")) return null;

  const contentValue = readString(value.content);
  if (!contentValue) return null;

  const content = decodeMarkdownBase64(contentValue);
  return {
    id: String(value.id),
    title: deriveTitle(value, content),
    description: deriveDescription(value, content),
    createdAt: readNullableString(value.createdAt ?? value.created_at),
    updatedAt: readNullableString(value.updatedAt ?? value.updated_at),
  };
}

async function requestArticle(path: string, init: RequestInit = {}) {
  return requestJson<unknown>(path, init);
}

function toArticlePayload(input: CreateArticleInput) {
  const normalized = toArticleInput(input);
  return { content: encodeMarkdownBase64(normalized.content) };
}

function payloadRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) throw new Error("A resposta da listagem de artigos é inválida.");
  if (Array.isArray(payload.data)) return payload.data;
  if (isRecord(payload.data) && Array.isArray(payload.data.data)) return payload.data.data;
  throw new Error("A resposta da listagem de artigos não contém uma lista de artigos.");
}

export async function getArticles(signal?: AbortSignal) {
  const payload = await requestArticle("/api/articles", { signal });
  return payloadRows(payload).map((row) => {
    const article = normalizeArticle(row);
    if (!article) throw new Error("A resposta de um artigo da listagem está incompleta.");
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  });
}

export async function getArticle(id: string, signal?: AbortSignal) {
  const payload = await requestArticle(`/api/articles/${encodeURIComponent(id)}`, { signal });
  const article = normalizeArticle(payload);
  if (!article) throw new Error("A resposta do artigo está incompleta.");
  return article;
}

export async function createArticle(input: CreateArticleInput) {
  await requestArticle("/api/articles", {
    method: "POST",
    body: JSON.stringify(toArticlePayload(input)),
  });
}

export async function updateArticle(id: string, input: UpdateArticleInput) {
  await requestArticle(`/api/articles/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(toArticlePayload(input)),
  });
}

export async function deleteArticle(id: string) {
  await requestArticle(`/api/articles/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getArticleErrorFields(error: unknown): ArticleFieldErrors {
  return error instanceof HttpError ? error.fieldErrors : {};
}

export function toArticleInput(input: CreateArticleInput): CreateArticleInput {
  return {
    content: readString(input.content),
    ...(typeof input.title === "string" ? { title: input.title.trim() } : {}),
    ...(typeof input.description === "string" ? { description: input.description.trim() } : {}),
  };
}
