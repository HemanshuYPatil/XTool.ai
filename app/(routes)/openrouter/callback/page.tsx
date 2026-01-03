"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "openrouter_api_key";
const STORAGE_USER_ID = "openrouter_user_id";
const STORAGE_KEYS = "openrouter_keys";
const STORAGE_PROVISIONING_KEY = "openrouter_provisioning_key";
const STORAGE_CONNECTING = "openrouter_connecting";
const STORAGE_STATE = "openrouter_state";
const STORAGE_CODE_VERIFIER = "openrouter_code_verifier";

type CallbackStatus = "working" | "success" | "error";

const CallbackContent = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("working");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const runExchange = async () => {
      try {
        const code = searchParams.get("code");
        const returnedState = searchParams.get("state");
        const storedState = sessionStorage.getItem(STORAGE_STATE);
        const codeVerifier = sessionStorage.getItem(STORAGE_CODE_VERIFIER);

        if (!code) {
          throw new Error("Missing authorization code.");
        }

        // State validation prevents CSRF and mismatched sessions.
        if (!returnedState || !storedState || returnedState !== storedState) {
          throw new Error("State mismatch. Please try connecting again.");
        }

        if (!codeVerifier) {
          throw new Error("Missing PKCE verifier. Please retry the connection.");
        }

        // Exchange the auth code for an API key on the server to avoid CORS issues.
        const response = await fetch("/api/openrouter/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            code_verifier: codeVerifier,
            code_challenge_method: "S256",
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "Failed to exchange code.");
        }

        const data = await response.json();
        const apiKey =
          data?.key || data?.api_key || data?.apiKey || data?.token;
        const provisioningKey =
          data?.provisioning_key ||
          data?.provisioningKey ||
          data?.provisioning_token ||
          data?.provisioningToken ||
          null;

        if (!apiKey) {
          throw new Error("OpenRouter did not return an API key.");
        }

        const userId =
          data?.user_id || data?.userId || data?.user?.id || null;

        sessionStorage.setItem(STORAGE_KEY, apiKey);
        if (userId) {
          sessionStorage.setItem(STORAGE_USER_ID, String(userId));
        }
        if (provisioningKey) {
          sessionStorage.setItem(STORAGE_PROVISIONING_KEY, provisioningKey);
        }

        const existingKeys = sessionStorage.getItem(STORAGE_KEYS);
        if (!existingKeys) {
          const entry = [
            {
              id: crypto.randomUUID(),
              name: "Primary key",
              key: apiKey,
              createdAt: new Date().toISOString(),
            },
          ];
          sessionStorage.setItem(STORAGE_KEYS, JSON.stringify(entry));
        }

        sessionStorage.removeItem(STORAGE_CONNECTING);
        sessionStorage.removeItem(STORAGE_STATE);
        sessionStorage.removeItem(STORAGE_CODE_VERIFIER);

        setStatus("success");
        setMessage("OpenRouter connected successfully.");
      } catch (error) {
        console.error(error);
        sessionStorage.removeItem(STORAGE_CONNECTING);
        sessionStorage.removeItem(STORAGE_STATE);
        sessionStorage.removeItem(STORAGE_CODE_VERIFIER);
        sessionStorage.removeItem(STORAGE_PROVISIONING_KEY);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to finish OpenRouter connection."
        );
      }
    };

    runExchange();
  }, [searchParams]);

  return (
    <div className="min-h-screen w-full bg-background">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">
            OpenRouter
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {status === "working" ? "Connecting..." : "Connection status"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {status === "working"
              ? "Exchanging authorization code for your OpenRouter key."
              : message}
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/xcode-cli/openrouter">Return to setup</Link>
        </Button>
      </section>
    </div>
  );
};

export default function OpenRouterCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-background">
          <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-primary">
                OpenRouter
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Connecting...
              </h1>
              <p className="text-sm text-muted-foreground">
                Exchanging authorization code for your OpenRouter key.
              </p>
            </div>
          </section>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
