export function resolveBackendBaseUrl(backendRoute?: string, appUrl?: string) {
  const configuredRoute = backendRoute?.trim() || appUrl?.trim() || "";

  if (!configuredRoute) {
    throw new Error("BACKEND_ROUTE or APP_URL is not configured.");
  }

  return configuredRoute.replace(/\/+$/, "").replace(/\/api$/i, "");
}
