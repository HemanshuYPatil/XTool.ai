"use client";

import { useLayoutEffect, useRef } from "react";
import {
  CalendarClockIcon,
  ClapperboardIcon,
  FilmIcon,
  GlobeIcon,
  LayersIcon,
  MicIcon,
  ScanEyeIcon,
  SparklesIcon,
  TerminalIcon,
  TimerIcon,
  VideoIcon,
  Wand2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";


type CreatorDashboardProps = {
  userName?: string | null;
  initialUser?: {
    id?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    picture?: string | null;
  };
  initialIsDeveloper?: boolean;
};

const studioStats = [
  { label: "Active modules", value: "6", meta: "2 launching now" },
  { label: "Live workspaces", value: "12", meta: "Across product teams" },
  { label: "Automation runs", value: "48", meta: "Last 7 days" },
  { label: "Knowledge vault", value: "1,204", meta: "Docs + assets" },
];









const usageData = [
  { day: "Mon", value: 45 },
  { day: "Tue", value: 52 },
  { day: "Wed", value: 38 },
  { day: "Thu", value: 65 },
  { day: "Fri", value: 48 },
  { day: "Sat", value: 32 },
  { day: "Sun", value: 28 },
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
];

const ModuleUsageGraph = () => {
  const maxVal = Math.max(...usageData.map((d) => d.value));
  const height = 120;
  const width = 400;
  const padding = 20;

  return (
    <div className="relative h-[180px] w-full">
      <div className="flex h-full items-end justify-between gap-2 px-2">
        {usageData.map((data, i) => {
          const barHeight = (data.value / maxVal) * height;
          return (
            <div key={data.day} className="group relative flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-primary/20 transition-all duration-300 group-hover:bg-primary/40"
                style={{ height: `${barHeight}px` }}
              >
                <div
                  className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-primary opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ bottom: `${barHeight}px` }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {data.day}
              </span>
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-foreground px-2 py-1 text-[10px] font-bold text-background opacity-0 transition-opacity group-hover:opacity-100">
                {data.value}
              </div>
            </div>
          );
        })}
      </div>
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
}: CreatorDashboardProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_60%)]" />
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
                Weekly activity across all active modules.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                +12% from last week
              </span>
            </div>
          </div>
          <ModuleUsageGraph />
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
