import { NextResponse } from "next/server";

type TestRequest = {
  apiKey?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TestRequest;
    const apiKey = body?.apiKey;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing apiKey." },
        { status: 400 }
      );
    }

    // Proxy the request so the key never needs to be stored on the server.
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return NextResponse.json(
        {
          error:
            errorBody?.error ||
            errorBody?.message ||
            "OpenRouter test failed.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
