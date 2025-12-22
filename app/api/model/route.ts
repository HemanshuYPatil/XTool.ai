import { NextResponse } from "next/server";
import { OPENROUTER_MODEL_ID } from "@/lib/ai-models";

export async function GET() {
  return NextResponse.json({
    provider: "OpenRouter",
    model: OPENROUTER_MODEL_ID ?? "Unavailable",
  });
}
