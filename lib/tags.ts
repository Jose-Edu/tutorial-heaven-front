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
  for (const key of ["step_name", "category_name", "group_name"]) {
    const groupName = value[key];
    if (typeof groupName === "string") values.push(groupName);
  }
  return values;
}

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("pt-BR");
}

export async function getTagSteps(signal?: AbortSignal): Promise<TagStep[]> {
  const payload = await requestJson<unknown>("/api/tags/steps", { signal });
  return unwrapList(payload, "etapas de tags").map((value) => {
    const id = readId(value);
    const label = readLabel(value);
    if (!id || !label) throw new Error("A resposta de uma etapa de tags está incompleta.");
    const aliases = isRecord(value)
      ? ["slug", "key", "value"].flatMap((key) =>
          typeof value[key] === "string" || typeof value[key] === "number" ? [String(value[key])] : [],
        )
      : [];
    return { id, label, aliases: [id, label, ...aliases].map(normalized) };
  });
}

export async function getTags(signal?: AbortSignal): Promise<TagOption[]> {
  const payload = await requestJson<unknown>("/api/tags", { signal });
  return unwrapList(payload, "tags").map((value) => {
    if (!isRecord(value)) throw new Error("A resposta contém uma tag inválida.");

    const id = readId(value);
    const name = readLabel(value);
    if (!id || !name) throw new Error("A resposta de uma tag está incompleta.");

    return { id, name, groupIds: readGroupIds(value).map(normalized) };
  });
}
