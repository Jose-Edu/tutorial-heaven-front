import { NextRequest } from "next/server";
import { proxyAuthRequest } from "@/lib/backend-auth";

export async function POST(request: NextRequest) {
  return proxyAuthRequest(request, "/login");
}