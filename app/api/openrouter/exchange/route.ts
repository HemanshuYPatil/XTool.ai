import { NextResponse } from "next/server";

type ExchangeRequest = {
  code?: string;
  code_verifier?: string;
  code_challenge_method?: "S256";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExchangeRequest;
    const code = body?.code;
    const codeVerifier = body?.code_verifier;

    if (!code || !codeVerifier) {
      return NextResponse.json(
        { error: "Missing code or code_verifier." },
        { status: 400 }
      );
    }

    // No storage: exchange and return the OpenRouter response directly.
    const response = await fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
        code_challenge_method: "S256",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return NextResponse.json(
        {
          error:
            errorBody?.error ||
            errorBody?.message ||
            "OpenRouter exchange failed.",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
