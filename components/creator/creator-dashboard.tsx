"use client";

import { useLayoutEffect, useRef } from "react";
import { ScanEyeIcon, TerminalIcon, Wand2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRealtimeCredits } from "@/components/credits/realtime-credits";
import type { ModuleUsageSeriesByModule } from "@/lib/module-usage";
import { RecentProjects } from "./recent-projects";
import { UsageBreakdownCard } from "./usage-breakdown";
import type { DashboardStats } from "@/lib/dashboard-stats";

 

type CreatorDashboardProps = {
  userName?: string | null;
  initialIsDeveloper?: boolean;
  credits?: number;
  usageSeries?: ModuleUsageSeriesByModule;
  stats?: DashboardStats;
};

const formatCredits = (credits?: number | null, isDeveloper?: boolean) => {
  if (isDeveloper) return "Unlimited";
  if (typeof credits === "number") {
    return credits.toLocaleString("en-US");
  }
  return "--";
};

const buildStudioStats = (credits?: number | null, isDeveloper?: boolean, stats?: DashboardStats) => [
  { 
    label: "Active modules", 
    value: stats?.activeModules.toString() ?? "0", 
    meta: "Used in your projects" 
  },
  { 
    label: "Live workspaces", 
    value: stats?.liveWorkspaces.toString() ?? "0", 
    meta: "Total active projects" 
  },
  {
    label: "Credits remaining",
    value: formatCredits(credits, isDeveloper),
    meta: "AI generation balance",
  },
  { 
    label: "Total Generations", 
    value: stats?.totalGenerations.toString() ?? "0", 
    meta: `${stats?.recentGenerations ?? 0} in last 7 days` 
  },
];

const CreatorDashboard = ({
  userName,
  initialIsDeveloper,
  credits,
  usageSeries,
  stats,
}: CreatorDashboardProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);


  const realtimeCredits = useRealtimeCredits({
    initialCredits: credits ?? null,
    isDeveloper: Boolean(initialIsDeveloper),
  });
  const studioStats = buildStudioStats(realtimeCredits ?? null, initialIsDeveloper, stats);

  useLayoutEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let frame = 0;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !rootRef.current) return undefined;

    const run = async () => {
      const { gsap } = await import("gsap");
      ctx = gsap.context(() => {
        gsap.from("[data-studio-hero]", {
          opacity: 0,
          y: 18,
          duration: 0.8,
          ease: "power3.out",
          immediateRender: false,
        });

        gsap.from("[data-studio-stat]", {
          opacity: 0,
          y: 14,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.12,
          immediateRender: false,
        });

        gsap.from("[data-studio-section]", {
          opacity: 0,
          y: 18,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.2,
          immediateRender: false,
        });
      }, rootRef);
    };

    frame = window.requestAnimationFrame(() => {
      run();
    });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="space-y-8 pb-12">
      <section
        id="overview"
        data-studio-hero
        className="relative overflow-hidden rounded-3xl border bg-card/70 p-8 shadow-sm md:p-10"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_60%)]" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              XTool.ai Command Center
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              XTool.ai Dashboard
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {userName ? `Welcome back, ${userName}. ` : ""}
              Run every module, tool, and workspace from one unified studio.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-2">
                <Wand2Icon className="size-3.5 text-primary" />
                Generate & Refine
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-2">
                <TerminalIcon className="size-3.5 text-primary" />
                Ship Builds
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-2">
                <ScanEyeIcon className="size-3.5 text-primary" />
                Track Activity
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {studioStats.map((stat) => (
              <div
                key={stat.label}
                data-studio-stat
                className="rounded-2xl border border-border/60 bg-background p-4"
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.meta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Section: Usage & Activity */}
      <section
        data-studio-section
        className="grid gap-6"
      >
        <UsageBreakdownCard 
          items={stats?.usageBreakdown ?? []} 
          credits={realtimeCredits}
          isDeveloper={initialIsDeveloper}
          usageSeries={usageSeries}
        />
      </section>

      {/* New Section: Recent Projects */}
      <section data-studio-section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent Projects</h2>
            <p className="text-sm text-muted-foreground">
              Jump back into your latest work.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
            View all projects
          </Button>
        </div>
        <RecentProjects projects={stats?.recentProjects ?? []} />
      </section>

    </div>
  );
};

export default CreatorDashboard;

