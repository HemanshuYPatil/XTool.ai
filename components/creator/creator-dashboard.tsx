"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  CalendarClockIcon,
  ClapperboardIcon,
  GlobeIcon,
  ScanEyeIcon,
  TerminalIcon,
  TimerIcon,
  Wand2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRealtimeCredits } from "@/components/credits/realtime-credits";
import type { ModuleUsageSeries, UsagePoint, UsageTimeframe } from "@/lib/module-usage";
import { showXCreator } from "@/lib/feature-flags";
 

type CreatorDashboardProps = {
  userName?: string | null;
  initialUser?: {
    id?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    picture?: string | null;
  };
  initialIsDeveloper?: boolean;
  credits?: number;
  usageSeries?: ModuleUsageSeries;
};

const formatCredits = (credits?: number | null, isDeveloper?: boolean) => {
  if (isDeveloper) return "Unlimited";
  if (typeof credits === "number") {
    return credits.toLocaleString("en-US");
  }
  return "--";
};

const buildStudioStats = (credits?: number | null, isDeveloper?: boolean) => [
  { label: "Active modules", value: "6", meta: "2 launching now" },
  { label: "Live workspaces", value: "12", meta: "Across product teams" },
  {
    label: "Credits remaining",
    value: formatCredits(credits, isDeveloper),
    meta: "AI generation balance",
  },
  { label: "Automation runs", value: "48", meta: "Last 7 days" },
];



const recentActivity = [
  {
    id: 1,
    user: "Hemanshu Patil",
    action: "created a new project",
    target: "XDesign System",
    time: "2 mins ago",
    icon: Wand2Icon,
  },
  {
    id: 2,
    user: "Atharva Patil",
    action: "deployed a module",
    target: "XCode CLI",
    time: "15 mins ago",
    icon: TerminalIcon,
  },
  {
    id: 3,
    user: "System",
    action: "completed automation run",
    target: "Pipeline #482",
    time: "1 hour ago",
    icon: TimerIcon,
  },
  {
    id: 4,
    user: "Hemanshu Patil",
    action: "updated brand assets",
    target: "XCreator Studio",
    time: "3 hours ago",
    icon: ClapperboardIcon,
  },
].filter((activity) => showXCreator || !activity.target.includes("XCreator"));

const ModuleUsageGraph = ({ data }: { data: UsagePoint[] }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const height = 160;

  return (
    <div className="relative h-60 w-full">
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No usage yet.
        </div>
      ) : (
        <div className="flex h-full items-end justify-between gap-3 px-2">
          {data.map((item) => {
            const barHeight = (item.value / maxVal) * height;

            return (
              <div key={item.label} className="group relative flex flex-1 flex-col items-center gap-2">
                <div className="relative w-full flex flex-col-reverse items-center">
                  <div
                    className="w-full rounded-t-lg bg-purple-500/80 transition-all duration-300 group-hover:bg-purple-500"
                    style={{ height: `${barHeight}px` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </span>
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 z-20 w-32 rounded-xl border border-border bg-background/95 p-2 text-[10px] shadow-xl backdrop-blur-sm opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-top-24 pointer-events-none">
                  <div className="space-y-1.5">
                    <p className="font-bold border-bottom pb-1 mb-1 border-border/50">{item.label} Usage</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                        <span className="text-muted-foreground">XDesign</span>
                      </div>
                      <span className="font-mono font-bold">{item.value}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const RecentActivity = () => {
  return (
    <div className="space-y-4">
      {recentActivity.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex items-start gap-4 rounded-2xl border border-border/50 bg-background/50 p-3 transition-colors hover:bg-background">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30">
              <Icon className="size-4 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                <span className="text-foreground">{activity.user}</span>{" "}
                <span className="text-muted-foreground font-normal">{activity.action}</span>{" "}
                <span className="text-primary font-semibold">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CreatorDashboard = ({
  userName,
  initialUser,
  initialIsDeveloper,
  credits,
  usageSeries,
}: CreatorDashboardProps) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<UsageTimeframe>("daily");

  const rootRef = useRef<HTMLDivElement | null>(null);


  const realtimeCredits = useRealtimeCredits({
    initialCredits: credits ?? null,
    isDeveloper: Boolean(initialIsDeveloper),
  });
  const studioStats = buildStudioStats(realtimeCredits ?? null, initialIsDeveloper);
  const moduleUsage = usageSeries ?? { daily: [], monthly: [], yearly: [] };

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
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full">
                <ClapperboardIcon className="size-4" />
                Launch module
              </Button>
              <Button variant="outline" className="rounded-full">
                <CalendarClockIcon className="size-4" />
                Open planner
              </Button>
              <Button variant="outline" className="rounded-full">
                <GlobeIcon className="size-4" />
                View workspace
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
        className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold">Module usage</h2>
              <p className="text-sm text-muted-foreground">
                Activity across XDesign for your workspace.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 mr-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">XDesign</span>
                </div>
              </div>
              <div className="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
                {(["daily", "monthly", "yearly"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTimeframe(t)}
                    className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md transition-all ${
                      selectedTimeframe === t
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ModuleUsageGraph data={moduleUsage[selectedTimeframe]} />

        </div>

        <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <p className="text-sm text-muted-foreground">
                Latest updates from your team.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
              View all
            </Button>
          </div>
          <RecentActivity />
        </div>
      </section>

    </div>
  );
};

export default CreatorDashboard;
