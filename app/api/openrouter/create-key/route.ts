import { NextResponse } from "next/server";

type CreateKeyRequest = {
  provisioningKey?: string;
  apiKey?: string;
  name?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateKeyRequest;
    const provisioningKey = body?.provisioningKey;
    const apiKey = body?.apiKey;
    const name = body?.name;

    if (!name || (!provisioningKey && !apiKey)) {
      return NextResponse.json(
        { error: "Missing credentials or name." },
        { status: 400 }
      );
    }

    // OpenRouter endpoint may differ; update if their API changes.
    const authHeader = provisioningKey || apiKey;
    const response = await fetch("https://openrouter.ai/api/v1/keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authHeader}`,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const detail =
        errorBody?.error?.message ||
        errorBody?.error ||
        errorBody?.message ||
        (errorBody ? JSON.stringify(errorBody) : null);
      return NextResponse.json(
        {
          error: detail || "OpenRouter key creation failed.",
          status: response.status,
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
