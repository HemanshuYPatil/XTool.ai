"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TerminalIcon,
  CpuIcon,
  ZapIcon,
  ShieldCheckIcon,
  WorkflowIcon,
  Code2Icon,
  CopyIcon,
  CheckIcon,
  ArrowRightIcon,
} from "lucide-react";

type XCodeCliOverviewProps = {
  connectionHref?: string;
};

export default function XCodeCliOverview({
  connectionHref = "/xtool/module-xcode#openrouter",
}: XCodeCliOverviewProps) {
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

  const features = [
    {
      title: "Agentic Coding",
      description: "Autonomous agents that can read, write, and execute code across your entire project.",
      icon: CpuIcon,
    },
    {
      title: "Multi-Model Routing",
      description: "Seamlessly switch between Claude, GPT-4, and other top models via OpenRouter.",
      icon: WorkflowIcon,
    },
    {
      title: "Fast Iteration",
      description: "Built for speed with instant startup and optimized context management.",
      icon: ZapIcon,
    },
    {
      title: "Secure & Private",
      description: "Your keys stay local. We never store your sensitive API credentials.",
      icon: ShieldCheckIcon,
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border bg-card/50 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.05),transparent_50%)]" />
        
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <TerminalIcon className="size-3.5" />
            XCode CLI v1.2.0
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Your Agentic <span className="text-primary">Coding Partner</span> in the Terminal
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            XCode CLI brings the power of advanced AI agents directly to your development workflow. 
            Automate complex refactors, generate documentation, and build features with a single command.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Button size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20" asChild>
              <Link href="#setup">Get Started <ArrowRightIcon className="ml-2 size-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="https://docs.xtool.ai" target="_blank">Documentation</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="group rounded-3xl border bg-card/40 p-6 transition-all hover:bg-card hover:shadow-lg">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background transition-transform group-hover:scale-110">
              <feature.icon className="size-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </section>

      {/* Setup Guide */}
      <section id="setup" className="space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold tracking-tight">Quick Setup Guide</h2>
          <p className="text-muted-foreground">Get up and running with XCode CLI in less than 2 minutes.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="relative space-y-4 rounded-3xl border bg-card/60 p-8 shadow-sm">
            <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg">1</div>
            <h3 className="text-xl font-bold pt-2">Connect OpenRouter</h3>
            <p className="text-sm text-muted-foreground">
              Authorize XCode CLI to use your OpenRouter models. This ensures secure and flexible model routing.
            </p>
            <div className="pt-4">
              <Button asChild variant="outline" className="w-full rounded-full border-primary/20 hover:bg-primary/5">
                <Link href={connectionHref}>Configure Connection</Link>
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative space-y-4 rounded-3xl border bg-card/60 p-8 shadow-sm">
            <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg">2</div>
            <h3 className="text-xl font-bold pt-2">Install Globally</h3>
            <p className="text-sm text-muted-foreground">
              Install the CLI package via npm to make it available anywhere in your system.
            </p>
            <div className="mt-4 overflow-hidden rounded-2xl border bg-background/80">
              <div className="flex items-center justify-between px-4 py-3">
                <code className="text-xs font-mono text-primary">{installCommand}</code>
                <button 
                  onClick={handleCopy}
                  className="rounded-lg p-2 hover:bg-muted transition-colors"
                >
                  {copyMessage ? <CheckIcon className="size-4 text-emerald-500" /> : <CopyIcon className="size-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative space-y-4 rounded-3xl border bg-card/60 p-8 shadow-sm">
            <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg">3</div>
            <h3 className="text-xl font-bold pt-2">Launch Session</h3>
            <p className="text-sm text-muted-foreground">
              Navigate to any project directory and run the command to start your first session.
            </p>
            <div className="space-y-2 pt-2">
              <div className="rounded-xl border bg-background/50 px-4 py-2 text-xs font-mono">
                $ cd my-awesome-project
              </div>
              <div className="rounded-xl border bg-background/50 px-4 py-2 text-xs font-mono">
                $ xcode-cli
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="rounded-[2.5rem] border bg-primary/5 p-8 md:p-12">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Why XCode CLI?</h2>
            <div className="space-y-4">
              {[
                { title: "Context Awareness", text: "Deep understanding of your codebase structure and dependencies." },
                { title: "Reproducible Workflows", text: "Save and share complex agentic tasks with your team." },
                { title: "Model Agnostic", text: "Use the best model for the task, whether it's Claude 3.5 or GPT-4o." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <CheckIcon className="size-3" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-video rounded-3xl border bg-background shadow-2xl overflow-hidden group">
             <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-transparent opacity-50" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
                    <Code2Icon className="size-8" />
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">Terminal Preview Coming Soon</p>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
