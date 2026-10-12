import { NextRequest, NextResponse } from "next/server";

export const authTokenCookieName = "tutorial-heaven-access-token";

function getBackendBaseUrl() {
  const configuredRoute = (process.env.APP_URL ?? process.env.BACKEND_ROUTE ?? "").trim();

  if (!configuredRoute) {
    throw new Error("APP_URL or BACKEND_ROUTE is not configured.");
  }

  return configuredRoute.replace(/\/+$/, "").replace(/\/api$/, "");
}

function normalizeApiPath(pathname: string) {
  const relativePath = pathname.trim();
  if (!relativePath) return "/api";

  const normalizedPath = `/${relativePath.replace(/^\/+/, "")}`;
  return normalizedPath.startsWith("/api") ? normalizedPath : `/api${normalizedPath}`;
}

function buildBackendUrl(pathname: string) {
  return `${getBackendBaseUrl()}${normalizeApiPath(pathname)}`;
}

function copyResponseHeaders(source: Response, target: NextResponse) {
  const contentType = source.headers.get("content-type");
  if (contentType) {
    target.headers.set("content-type", contentType);
  }
}

function buildBackendHeaders(request: NextRequest) {
  const token = request.cookies.get(authTokenCookieName)?.value;
  return {
    accept: request.headers.get("accept") ?? "application/json",
    "content-type": request.headers.get("content-type") ?? "application/json",
    "x-requested-with": "XMLHttpRequest",
    ...(token ? { authorization: "Bearer " + token } : {}),
  };
}

async function sendToBackend(request: NextRequest, backendPath: string) {
  const backendUrl = buildBackendUrl(`${backendPath}${request.nextUrl.search}`);
  const isBodyAllowed = request.method !== "GET" && request.method !== "HEAD";
  const body = isBodyAllowed ? await request.text() : undefined;

  return fetch(backendUrl, {
    method: request.method,
    headers: buildBackendHeaders(request),
    body,
    cache: "no-store",
  });
}

function proxyResponse(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok && !contentType.includes("application/json")) {
    return NextResponse.json(
      { message: "O backend retornou um erro inesperado." },
      { status: response.status },
    );
  }

  const proxiedResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
  });

  copyResponseHeaders(response, proxiedResponse);
  return proxiedResponse;
}

function backendUnavailable(error: unknown) {
  console.error("Failed to contact Laravel backend.", error);
  return NextResponse.json(
    { message: "Não foi possível contatar o backend Laravel." },
    { status: 502 },
  );
}

function authCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export function clearAuthTokenCookie(response: NextResponse) {
  response.cookies.set(authTokenCookieName, "", {
    ...authCookieOptions(),
    maxAge: 0,
  });
  return response;
}

export async function proxyBackendRequest(request: NextRequest, backendPath: string) {
  try {
    const response = await sendToBackend(request, backendPath);
    const proxiedResponse = proxyResponse(response);
    return response.status === 401 ? clearAuthTokenCookie(proxiedResponse) : proxiedResponse;
  } catch (error) {
    return backendUnavailable(error);
  }
}

export async function proxyAuthRequest(request: NextRequest, backendPath: string) {
  try {
    const response = await sendToBackend(request, backendPath);
    const isLogin = backendPath === "/login";
    const isRegister = backendPath === "/register";
    const isLogout = backendPath === "/logout";
    const shouldClearToken = isLogout && (response.ok || response.status === 401);
    let proxiedResponse: NextResponse;

    if ((isLogin || isRegister) && response.ok) {
      const payload: unknown = await response.json();
      const token =
        typeof payload === "object" &&
        payload !== null &&
        "token" in payload &&
        typeof payload.token === "string" &&
        payload.token.length > 0
          ? payload.token
          : null;

      if (isLogin && !token) {
        return NextResponse.json(
          { message: "A resposta de login não contém um token válido." },
          { status: 502 },
        );
      }

      const safePayload =
        typeof payload === "object" && payload !== null && "token" in payload
          ? Object.fromEntries(Object.entries(payload).filter(([key]) => key !== "token"))
          : payload;

      proxiedResponse = NextResponse.json(safePayload, { status: response.status });
      if (token) {
        proxiedResponse.cookies.set(authTokenCookieName, token, authCookieOptions());
      }
    } else {
      proxiedResponse = proxyResponse(response);
    }

    return shouldClearToken ? clearAuthTokenCookie(proxiedResponse) : proxiedResponse;
  } catch (error) {
    return backendUnavailable(error);
  }
}
