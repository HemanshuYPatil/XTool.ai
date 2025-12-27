"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldCheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const STORAGE_KEY = "openrouter_api_key";
const STORAGE_USER_ID = "openrouter_user_id";
const STORAGE_KEYS = "openrouter_keys";
const STORAGE_PROVISIONING_KEY = "openrouter_provisioning_key";
const STORAGE_CONNECTING = "openrouter_connecting";
const STORAGE_STATE = "openrouter_state";
const STORAGE_CODE_VERIFIER = "openrouter_code_verifier";

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";
type TestStatus = "idle" | "testing" | "success" | "error";
type CreateStatus = "idle" | "creating" | "success" | "error";

type ApiKeyEntry = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
};

function maskKey(value: string) {
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}****${value.slice(-4)}`;
}

function base64UrlEncode(bytes: ArrayBuffer) {
  const array = new Uint8Array(bytes);
  let binary = "";
  for (const byte of array) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256(value: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

function createRandomString(length: number) {
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return base64UrlEncode(values.buffer).slice(0, length);
}

export default function OpenRouterPanel() {
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [provisioningKey, setProvisioningKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createStatus, setCreateStatus] = useState<CreateStatus>("idle");
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [provisioningInput, setProvisioningInput] = useState("");

  useEffect(() => {
    const storedKey = sessionStorage.getItem(STORAGE_KEY);
    const storedUserId = sessionStorage.getItem(STORAGE_USER_ID);
    const storedKeys = sessionStorage.getItem(STORAGE_KEYS);
    const storedProvisioning = sessionStorage.getItem(STORAGE_PROVISIONING_KEY);
    const isConnecting = sessionStorage.getItem(STORAGE_CONNECTING) === "1";

    if (storedKey) {
      setStatus("connected");
      setMaskedKey(maskKey(storedKey));
      setUserId(storedUserId);
      setProvisioningKey(storedProvisioning);
      if (storedProvisioning) {
        setProvisioningInput(storedProvisioning);
      }
      if (storedKeys) {
        try {
          const parsed = JSON.parse(storedKeys) as ApiKeyEntry[];
          setKeys(parsed);
        } catch {
          setKeys([]);
        }
      } else {
        const entry: ApiKeyEntry = {
          id: crypto.randomUUID(),
          name: "Primary key",
          key: storedKey,
          createdAt: new Date().toISOString(),
        };
        sessionStorage.setItem(STORAGE_KEYS, JSON.stringify([entry]));
        setKeys([entry]);
      }
      return;
    }

    if (isConnecting) {
      setStatus("connecting");
      return;
    }

    setStatus("idle");
  }, []);

  const connectLabel = useMemo(() => {
    if (status === "connecting") return "Connecting...";
    if (status === "connected") return "Connected";
    return "Connect OpenRouter";
  }, [status]);

  const handleConnect = async () => {
    setErrorMessage(null);
    setStatus("connecting");
    setTestStatus("idle");
    setTestMessage(null);
    setCreateStatus("idle");
    setCreateMessage(null);

    try {
      const codeVerifier = createRandomString(96);
      const codeChallenge = await sha256(codeVerifier);
      const state = createRandomString(32);

      sessionStorage.setItem(STORAGE_CODE_VERIFIER, codeVerifier);
      sessionStorage.setItem(STORAGE_STATE, state);
      sessionStorage.setItem(STORAGE_CONNECTING, "1");

      const callbackUrl = encodeURIComponent(
        "http://localhost:3000/openrouter/callback"
      );
      const authUrl =
        "https://openrouter.ai/auth" +
        `?callback_url=${callbackUrl}` +
        `&code_challenge=${encodeURIComponent(codeChallenge)}` +
        "&code_challenge_method=S256" +
        `&state=${encodeURIComponent(state)}`;

      window.location.href = authUrl;
    } catch (error) {
      console.error(error);
      sessionStorage.removeItem(STORAGE_CONNECTING);
      setStatus("error");
      setErrorMessage("Failed to start OpenRouter OAuth flow.");
    }
  };

  const handleDisconnect = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_USER_ID);
    sessionStorage.removeItem(STORAGE_KEYS);
    sessionStorage.removeItem(STORAGE_PROVISIONING_KEY);
    sessionStorage.removeItem(STORAGE_CONNECTING);
    sessionStorage.removeItem(STORAGE_STATE);
    sessionStorage.removeItem(STORAGE_CODE_VERIFIER);
    setStatus("idle");
    setMaskedKey(null);
    setUserId(null);
    setProvisioningKey(null);
    setProvisioningInput("");
    setErrorMessage(null);
    setTestStatus("idle");
    setTestMessage(null);
    setKeys([]);
    setNewKeyName("");
    setCreateStatus("idle");
    setCreateMessage(null);
    setDisconnectOpen(false);
  };

  const handleSaveProvisioningKey = () => {
    const trimmed = provisioningInput.trim();
    if (!trimmed) {
      sessionStorage.removeItem(STORAGE_PROVISIONING_KEY);
      setProvisioningKey(null);
      setCreateMessage("Provisioning key cleared.");
      setCreateStatus("error");
      return;
    }
    sessionStorage.setItem(STORAGE_PROVISIONING_KEY, trimmed);
    setProvisioningKey(trimmed);
    setCreateStatus("success");
    setCreateMessage("Provisioning key saved.");
  };

  const handleTestConnection = async () => {
    const storedKey = sessionStorage.getItem(STORAGE_KEY);
    if (!storedKey) {
      setTestStatus("error");
      setTestMessage("Missing API key. Connect OpenRouter first.");
      return;
    }

    setTestStatus("testing");
    setTestMessage(null);

    try {
      const response = await fetch("/api/openrouter/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: storedKey }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Connection test failed.");
      }

      setTestStatus("success");
      setTestMessage("Connection verified.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Connection test failed.";
      setTestStatus("error");
      setTestMessage(message);
    }
  };

  const handleCreateKey = async () => {
    const storedProvisioning = sessionStorage.getItem(
      STORAGE_PROVISIONING_KEY
    );
    const fallbackKey = sessionStorage.getItem(STORAGE_KEY);
    if (!storedProvisioning && !fallbackKey) {
      setCreateStatus("error");
      setCreateMessage("Connect OpenRouter before creating a key.");
      return;
    }

    if (!newKeyName.trim()) {
      setCreateStatus("error");
      setCreateMessage("Enter a name for the new key.");
      return;
    }

    setCreateStatus("creating");
    setCreateMessage(null);

    try {
      const response = await fetch("/api/openrouter/create-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provisioningKey: storedProvisioning,
          apiKey: fallbackKey,
          name: newKeyName.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail =
          data?.error?.message ||
          data?.error ||
          data?.message ||
          (data ? JSON.stringify(data) : null);
        throw new Error(detail || "Failed to create key.");
      }

      const data = await response.json();
      const createdKey =
        data?.key || data?.api_key || data?.apiKey || data?.token;

      if (!createdKey) {
        throw new Error("OpenRouter did not return a key.");
      }

      const entry: ApiKeyEntry = {
        id: data?.id ? String(data.id) : crypto.randomUUID(),
        name: newKeyName.trim(),
        key: createdKey,
        createdAt: new Date().toISOString(),
      };

      const nextKeys = [entry, ...keys];
      setKeys(nextKeys);
      sessionStorage.setItem(STORAGE_KEYS, JSON.stringify(nextKeys));
      setCreateStatus("success");
      setCreateMessage("API key created.");
      setNewKeyName("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create key.";
      setCreateStatus("error");
      setCreateMessage(message);
    }
  };

  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage("Key copied to clipboard.");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage("Failed to copy key.");
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-primary">
          OpenRouter
        </p>
        <h3 className="text-2xl font-semibold tracking-tight">
          Connect OpenRouter to XCode CLI
        </h3>
        <p className="text-sm text-muted-foreground">
          Use OpenRouter to access multiple models while keeping your CLI
          sessions consistent. This panel handles OAuth and key management.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
                <ShieldCheckIcon className="size-4" />
              </div>
              <div>
                <h4 className="text-lg font-semibold tracking-tight">
                  Security notes
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  We do not store your OpenRouter API keys in our database. The
                  connection uses OAuth and scoped tokens for safe access.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "No key storage",
                  description:
                    "Keys stay in sessionStorage and can be revoked anytime.",
                },
                {
                  title: "Scoped permissions",
                  description: "Only the required routing scopes are requested.",
                },
                {
                  title: "Safe by default",
                  description: "Sensitive data is redacted in CLI telemetry.",
                },
                {
                  title: "Transparent control",
                  description:
                    "Disconnect OpenRouter with one click from your settings.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/60 bg-background px-4 py-3"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border bg-muted/20 p-6">
            <h4 className="text-lg font-semibold tracking-tight">
              OAuth connection
            </h4>
            <p className="mt-2 text-sm text-muted-foreground">
              Start the OpenRouter OAuth flow to authorize XCode CLI.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                className="rounded-full"
                onClick={handleConnect}
                disabled={status === "connecting" || status === "connected"}
              >
                {connectLabel}
              </Button>
              {status === "connected" ? (
                <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="rounded-full">
                      Disconnect
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl">
                    <DialogHeader>
                      <DialogTitle>Disconnect OpenRouter?</DialogTitle>
                      <DialogDescription>
                        This clears your OpenRouter session and removes all
                        stored keys from this browser session. You can reconnect
                        anytime.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="rounded-full">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        className="rounded-full"
                        onClick={handleDisconnect}
                      >
                        Disconnect
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
              {status === "connected" ? (
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={handleTestConnection}
                  disabled={testStatus === "testing"}
                >
                  {testStatus === "testing" ? "Testing..." : "Test connection"}
                </Button>
              ) : null}
              <span className="text-xs text-muted-foreground">
                This button will open the OpenRouter consent screen.
              </span>
            </div>
            {status === "connected" ? (
              <div className="mt-4 rounded-2xl border border-border/60 bg-background px-4 py-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-3">
                  <span>Connected</span>
                  {userId ? <span>User: {userId}</span> : null}
                  {maskedKey ? <span>Key: {maskedKey}</span> : null}
                </div>
              </div>
            ) : null}
            {status === "connecting" ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Redirecting to OpenRouter...
              </p>
            ) : null}
            {errorMessage ? (
              <p className="mt-4 text-xs text-destructive">{errorMessage}</p>
            ) : null}
            {testMessage ? (
              <p
                className={`mt-2 text-xs ${
                  testStatus === "success"
                    ? "text-emerald-600"
                    : "text-destructive"
                }`}
              >
                {testMessage}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
          <h4 className="text-lg font-semibold tracking-tight">API keys</h4>
          <p className="mt-2 text-sm text-muted-foreground">
            Create named keys for different CLI environments.
          </p>
          <div className="mt-5 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Provisioning key
            </label>
            <input
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              placeholder="Paste OpenRouter provisioning key"
              value={provisioningInput}
              onChange={(event) => setProvisioningInput(event.target.value)}
              disabled={status !== "connected"}
            />
            <p className="text-xs text-muted-foreground">
              Get your provisioning key from{" "}
              <a
                href="https://openrouter.ai/settings/provisioning-keys"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-primary underline-offset-4 hover:underline"
              >
                OpenRouter provisioning keys
              </a>
              .
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={handleSaveProvisioningKey}
                disabled={status !== "connected"}
              >
                Save provisioning key
              </Button>
              <span className="text-xs text-muted-foreground">
                Required to create additional API keys.
              </span>
            </div>
            <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              New key name
            </label>
            <input
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              placeholder="e.g. Dev laptop"
              value={newKeyName}
              onChange={(event) => setNewKeyName(event.target.value)}
              disabled={status !== "connected"}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="rounded-full"
                onClick={handleCreateKey}
                disabled={
                  status !== "connected" ||
                  createStatus === "creating" ||
                  !provisioningKey
                }
              >
                {createStatus === "creating" ? "Creating..." : "Create API key"}
              </Button>
              <span className="text-xs text-muted-foreground">
                Keys are stored in sessionStorage only.
              </span>
            </div>
            {createMessage ? (
              <p
                className={`text-xs ${
                  createStatus === "success"
                    ? "text-emerald-600"
                    : "text-destructive"
                }`}
              >
                {createMessage}
              </p>
            ) : null}
          </div>
          <div className="mt-6 space-y-3">
            {keys.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                No API keys yet. Connect OpenRouter and create one.
              </div>
            ) : (
              keys.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-xs text-muted-foreground"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {entry.name}
                      </div>
                      <div className="mt-1">{maskKey(entry.key)}</div>
                    </div>
                    <Button
                      variant="outline"
                      className="rounded-full"
                      onClick={() => handleCopy(entry.key)}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ))
            )}
            {copyMessage ? (
              <p className="text-xs text-muted-foreground">{copyMessage}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
