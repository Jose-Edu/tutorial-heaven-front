import { requestJson } from "@/lib/http";

export type TagOption = {
  id: string;
  name: string;
  groupIds: string[];
};

export type TagStep = {
  id: string;
  label: string;
  aliases: string[];
};

export type UserTag = {
  id: number | string;
  name?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapList(payload: unknown, resource: string): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) throw new Error(`A resposta de ${resource} é inválida.`);
  if (Array.isArray(payload.data)) return payload.data;
  if (isRecord(payload.data) && Array.isArray(payload.data.data)) return payload.data.data;
  throw new Error(`A resposta de ${resource} não contém uma lista.`);
}

function readStepPayload(payload: unknown): Record<string, Record<string, unknown>> {
  const root = isRecord(payload) ? payload : null;
  const data = root && isRecord(root.data) ? root.data : root;
  if (!isRecord(data)) throw new Error("A resposta de etapas de tags é inválida.");

  const entries: Record<string, Record<string, unknown>> = {};
  for (const key of ["step_1", "step_2", "step_3"]) {
    const value = data[key];
    if (isRecord(value)) entries[key] = value;
  }

  return entries;
}

function readId(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (isRecord(value)) {
    for (const key of ["id", "slug", "key", "value"]) {
      const candidate = value[key];
      if (typeof candidate === "string" || typeof candidate === "number") return String(candidate);
    }
  }
  return null;
}

function readLabel(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!isRecord(value)) return null;

  for (const key of ["title", "label", "name"]) {
    if (typeof value[key] === "string") return value[key];
  }

  return null;
}

function readGroupIds(value: Record<string, unknown>): string[] {
  const values: string[] = [];
  for (const key of ["step_id", "category_id", "group_id", "step", "category", "group"]) {
    const groupId = readId(value[key]);
    if (groupId) values.push(groupId);
  }
  for (const key of ["step_name", "category_name", "group_name", "category"]) {
    const groupName = value[key];
    if (typeof groupName === "string") values.push(groupName);
  }
  return values;
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export async function getTagSteps(signal?: AbortSignal): Promise<TagStep[]> {
  const payload = await requestJson<unknown>("/tags/steps", { signal });
  const steps = readStepPayload(payload);

  return Object.entries(steps).map(([id, value]) => {
    const label = typeof value.title === "string" ? value.title : null;
    const category = typeof value.category === "string" ? value.category : null;
    if (!label) throw new Error("A resposta de uma etapa de tags está incompleta.");

    return {
      id,
      label,
      aliases: [id, label, category]
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .map(normalized),
    };
  });
}

export async function getTags(signal?: AbortSignal): Promise<TagOption[]> {
  const payload = await requestJson<unknown>("/tags", { signal });
  const items = unwrapList(payload, "tags");

  return items.map((value) => {
    if (!isRecord(value)) throw new Error("A resposta contém uma tag inválida.");

    const id = readId(value);
    const name = readLabel(value);
    if (!id || !name) throw new Error("A resposta de uma tag está incompleta.");

    return { id, name, groupIds: Array.from(new Set(readGroupIds(value).map(normalized))) };
  });
}

/**
 * Lê as tags de um payload de usuário (`{ tags: [...] }`, `{ data: { user: { tags } } }`
 * ou `{ data: { tags } }`) e devolve sempre uma lista.
 */
export function readUserTags(payload: unknown): UserTag[] {
  if (!isRecord(payload)) return [];

  const data = isRecord(payload.data) ? payload.data : payload;
  const user = isRecord(data) && isRecord(data.user) ? data.user : data;
  const tags = isRecord(user) && Array.isArray(user.tags) ? user.tags : [];

  return tags
    .filter(isRecord)
    .filter((tag) => typeof tag.id === "number" || typeof tag.id === "string")
    .map((tag) => ({
      id: tag.id as number | string,
      ...(typeof tag.name === "string" ? { name: tag.name } : {}),
    }));
}

/**
 * Envia as tags selecionadas no onboarding para o backend, que fica responsável
 * por vinculá-las ao usuário autenticado, e devolve as tags já atribuídas.
 */
export async function syncUserTags(tagIds: string[]): Promise<UserTag[]> {
  const numericTagIds = tagIds
    .map((tagId) => Number(tagId))
    .filter((tagId) => Number.isInteger(tagId) && tagId > 0);

  if (numericTagIds.length === 0) {
    throw new Error("Seleciona pelo menos uma tag antes de guardar.");
  }

  const payload = await requestJson<unknown>("/onboarding/tags", {
    method: "POST",
    body: JSON.stringify({ tag_ids: numericTagIds }),
  });

  return readUserTags(payload);
}
