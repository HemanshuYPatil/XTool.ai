import { NextResponse } from "next/server";
import { verifyCliToken } from "@/lib/cli-auth";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const bearerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : "";

  let token = bearerToken.trim();

  if (!token) {
    try {
      const body = await req.json();
      if (body?.token && typeof body.token === "string") {
        token = body.token;
      }
    } catch {
      // ignore json parse errors
    }
  }

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 401 });
  }

  const user = await verifyCliToken(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user });
}
