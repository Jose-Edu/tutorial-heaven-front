import { NextRequest } from "next/server";
import { proxyAuthRequest } from "@/lib/backend-auth";

export async function GET(request: NextRequest) {
  return proxyAuthRequest(request, "/user");
}