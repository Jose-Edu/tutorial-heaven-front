import { NextRequest } from "next/server";
import { proxyBackendRequest } from "@/lib/backend-auth";

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, "/tags");
}
