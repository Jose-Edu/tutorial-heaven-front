import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backend-auth";

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, "/onboarding/tags");
}
