"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function XCodeCliPage() {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const installCommand = "npm install -g xcode-cli";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopyMessage("Copied!");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage("Copy failed");
      setTimeout(() => setCopyMessage(null), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Button
            asChild
            variant="outline"
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeftIcon className="size-4" />
              Back to dashboard
            </Link>
          </Button>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Beta module
          </span>
        </div>
      </div>

      <section className="pt-12 pb-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">
              X-code CLI
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Agentic CLI coding, tuned for fast iteration
            </h1>
            <p className="text-base text-muted-foreground max-w-3xl">
              X-code CLI is an agentic coding partner built for fast, focused
              iteration. Run tasks like Claude Code or Codex with flexible model
              routing and reproducible workflows.
            </p>
            <div className="flex flex-wrap gap-2">
              {["CLI-first", "OpenRouter-ready", "Team profiles"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border/70 bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-6 rounded-3xl border bg-muted/20 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  Get started
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Connect, install, and launch your first CLI session
                </h2>
                <p className="text-sm text-muted-foreground">
                  Follow the three steps below to enable X-code CLI in your
                  workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["OAuth-ready", "Session-only keys", "Fast setup"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/60 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
              <h3 className="text-lg font-semibold tracking-tight">
                1. Connect OpenRouter
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your OpenRouter account to unlock multi-model routing.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild className="rounded-full">
                  <Link href="/xcode-cli/openrouter">
                    Add OpenRouter connection
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">
                  Opens setup details and OAuth flow.
                </span>
              </div>
            </div>

            <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
              <h3 className="text-lg font-semibold tracking-tight">
                2. Install the CLI
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Install X-code CLI globally with npm.
              </p>
              <div className="mt-4 rounded-2xl border border-border/70 bg-background px-4 py-3 text-xs text-foreground/80">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <code>{installCommand}</code>
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={handleCopy}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              {copyMessage ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {copyMessage}
                </p>
              ) : null}
            </div>

            <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
              <h3 className="text-lg font-semibold tracking-tight">
                3. Run a session
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start an agentic session inside any repo.
              </p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-xs text-foreground/80">
                  <code>cd your-project</code>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-xs text-foreground/80">
                  <code>xcode-cli</code>
                </div>
                <p className="text-xs text-muted-foreground">
                  X-code CLI will prompt for the OpenRouter key if missing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
