import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backend-auth";

type ArticleRouteContext = {
  params: Promise<{ id: string }>;
};

async function proxyArticleRequest(request: NextRequest, context: ArticleRouteContext) {
  const { id } = await context.params;
  return proxyBackendRequest(request, `/articles/${encodeURIComponent(id)}`);
}

export async function GET(request: NextRequest, context: ArticleRouteContext) {
  return proxyArticleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: ArticleRouteContext) {
  return proxyArticleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: ArticleRouteContext) {
  return proxyArticleRequest(request, context);
}