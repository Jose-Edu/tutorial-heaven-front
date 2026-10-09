import { HttpError, requestJson } from "@/lib/http";

export { HttpError as AuthApiError } from "@/lib/http";

export type AuthUser = {
  id: number | string;
  name?: string;
  email?: string;
};

export type AuthFieldErrors = Record<string, string[]>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function login(input: { email: string; password: string }) {
  return requestJson<unknown>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function register(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) {
  return requestJson<unknown>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logout() {
  return requestJson<unknown>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUser(signal?: AbortSignal): Promise<AuthUser> {
  const payload = await requestJson<unknown>("/api/auth/user", { signal });
  const user = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;

  if (
    !isRecord(user) ||
    (typeof user.id !== "number" && typeof user.id !== "string")
  ) {
    throw new HttpError("A resposta do usuário está incompleta.", 502);
  }

  return {
    id: user.id,
    ...(typeof user.name === "string" ? { name: user.name } : {}),
    ...(typeof user.email === "string" ? { email: user.email } : {}),
  };
}

export function getAuthFieldErrors(error: unknown): AuthFieldErrors {
  return error instanceof HttpError ? error.fieldErrors : {};
}
