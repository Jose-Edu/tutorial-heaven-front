import { NextRequest, NextResponse } from "next/server";

function getBackendBaseUrl() {
  const backendRoute = process.env.BACKEND_ROUTE?.trim();

  if (!backendRoute) {
    throw new Error("BACKEND_ROUTE is not configured.");
  }

  return backendRoute.replace(/\/+$/, "");
}

function buildBackendUrl(pathname: string) {
  return `${getBackendBaseUrl()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function copyResponseHeaders(source: Response, target: NextResponse) {
  const setCookie = source.headers.get("set-cookie");

  if (setCookie) {
    target.headers.set("set-cookie", setCookie);
  }
}

export async function proxyBackendRequest(request: NextRequest, backendPath: string) {
  const backendUrl = buildBackendUrl(backendPath);
  const isBodyAllowed = request.method !== "GET" && request.method !== "HEAD";
  const body = isBodyAllowed ? await request.text() : undefined;
  const authorization = request.headers.get("authorization");
  const response = await fetch(backendUrl, {
    method: request.method,
    headers: {
      accept: request.headers.get("accept") ?? "application/json",
      "content-type": request.headers.get("content-type") ?? "application/json",
      cookie: request.headers.get("cookie") ?? "",
      ...(authorization ? { authorization } : {}),
      "x-requested-with": "XMLHttpRequest",
    },
    body,
    cache: "no-store",
  });

  const proxiedResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
  });

  copyResponseHeaders(response, proxiedResponse);

  const responseContentType = response.headers.get("content-type");

  if (responseContentType) {
    proxiedResponse.headers.set("content-type", responseContentType);
  }

  return proxiedResponse;
}

export const proxyAuthRequest = proxyBackendRequest;