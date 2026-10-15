export type HttpFieldErrors = Record<string, string[]>;

export class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: HttpFieldErrors = {},
  ) {
    super(message);
    this.name = "HttpError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getFieldErrors(payload: unknown): HttpFieldErrors {
  if (!isRecord(payload) || !isRecord(payload.errors)) return {};
  return Object.fromEntries(
    Object.entries(payload.errors).filter(
      ([, value]) =>
        Array.isArray(value) && value.every((message) => typeof message === "string"),
    ),
  ) as HttpFieldErrors;
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!isRecord(payload)) return fallback;
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;
  return Object.values(getFieldErrors(payload))[0]?.[0] ?? fallback;
}

export async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new HttpError("Não foi possível conectar ao servidor.", 0);
  }

  const responseText = await response.text();
  let payload: unknown = null;

  if (responseText) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new HttpError("O servidor retornou uma resposta inválida.", response.status);
      }
      payload = { message: responseText };
    }
  }

  if (!response.ok) {
    throw new HttpError(
      getErrorMessage(payload, response.statusText || "Não foi possível concluir a operação."),
      response.status,
      getFieldErrors(payload),
    );
  }

  return payload as T;
}
