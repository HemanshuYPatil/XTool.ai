"use client";

import { useEffect, useRef } from "react";
import {
  CalendarClockIcon,
  ClapperboardIcon,
  FilmIcon,
  FlameIcon,
  GlobeIcon,
  LayersIcon,
  MicIcon,
  ScanEyeIcon,
  SparklesIcon,
  TimerIcon,
  VideoIcon,
  Wand2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type CreatorDashboardProps = {
  userName?: string | null;
};

const studioStats = [
  { label: "In production", value: "8", meta: "2 in review" },
  { label: "Scheduled", value: "14", meta: "Next 7 days" },
  { label: "Channels", value: "6", meta: "4 verified" },
  { label: "Asset vault", value: "312", meta: "Clips + b-roll" },
];

const productionQueue = [
  {
    title: "Founder spotlight reel",
    type: "Reel",
    stage: "Editing",
    due: "Tomorrow",
  },
  {
    title: "Product update cut",
    type: "Short",
    stage: "Review",
    due: "Thu",
  },
  {
    title: "AI tools roundup",
    type: "Carousel",
    stage: "Script",
    due: "Today",
  },
  {
    title: "Weekly creator tips",
    type: "Post",
    stage: "Scheduled",
    due: "Fri",
  },
];

const studioSchedule = [
  {
    title: "Launch teaser reel",
    platform: "Instagram",
    time: "Tomorrow · 10:30 AM",
    status: "Queued",
  },
  {
    title: "Podcast trailer cutdown",
    platform: "YouTube",
    time: "Wed · 2:00 PM",
    status: "Scheduled",
  },
  {
    title: "Weekly AI roundup",
    platform: "LinkedIn",
    time: "Fri · 9:00 AM",
    status: "Draft",
  },
];

const studioTracks = [
  {
    name: "Reels",
    meta: "5 active cuts",
    icon: VideoIcon,
  },
  {
    name: "Shorts",
    meta: "3 drafts",
    icon: FilmIcon,
  },
  {
    name: "Podcast",
    meta: "2 episodes in edit",
    icon: MicIcon,
  },
  {
    name: "Posts",
    meta: "12 ideas",
    icon: LayersIcon,
  },
];

const aiStudioTools = [
  {
    title: "Auto repurpose",
    description: "Spin long form into reels, shorts, and threads.",
  },
  {
    title: "Studio captions",
    description: "On-brand captions, hooks, and hashtags.",
  },
  {
    title: "Scene highlights",
    description: "Detect best moments and trim automatically.",
  },
  {
    title: "Thumbnail kit",
    description: "Generate consistent covers for every format.",
  },
];

const connectedChannels = [
  { name: "YouTube", handle: "@xtoolstudio", status: "Connected" },
  { name: "Instagram", handle: "@xtool.studio", status: "Connected" },
  { name: "TikTok", handle: "@xtoolclips", status: "Needs refresh" },
  { name: "LinkedIn", handle: "XTool.ai", status: "Connected" },
];

const CreatorDashboard = ({ userName }: CreatorDashboardProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return undefined;

    const run = async () => {
      const { gsap } = await import("gsap");
      ctx = gsap.context(() => {
        gsap.from("[data-studio-hero]", {
          opacity: 0,
          y: 18,
          duration: 0.8,
          ease: "power3.out",
        });

        gsap.from("[data-studio-stat]", {
          opacity: 0,
          y: 14,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.06,
          delay: 0.12,
        });

        gsap.from("[data-studio-section]", {
          opacity: 0,
          y: 18,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.2,
        });
      }, rootRef);
    };

    run();

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="space-y-8">
      <section
        data-studio-hero
        className="relative overflow-hidden rounded-3xl border bg-card/70 p-8 shadow-sm md:p-10"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_60%)]" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              X Creator Production Studio
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {userName ? `Welcome back, ${userName}` : "Creator studio"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Run your entire content pipeline from one studio. Manage assets,
              production, scheduling, and publishing with modern creator
              workflows.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="rounded-full">
                <ClapperboardIcon className="size-4" />
                New production
              </Button>
              <Button variant="outline" className="rounded-full">
                <CalendarClockIcon className="size-4" />
                Open scheduler
              </Button>
              <Button variant="outline" className="rounded-full">
                <GlobeIcon className="size-4" />
                Add channel
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

      <section
        data-studio-section
        className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]"
      >
        <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Production pipeline</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Track every asset from script to publish.
              </p>
            </div>
            <Button variant="outline" className="rounded-full">
              <ScanEyeIcon className="size-4" />
              Review board
            </Button>
          </div>
          <div className="mt-6 overflow-hidden rounded-2xl border border-border/60 bg-background">
            {productionQueue.map((item, index) => {
              const isLast = index === productionQueue.length - 1;
              return (
                <div
                  key={item.title}
                  className={`flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                    isLast ? "" : "border-b border-border/60"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.type} · {item.stage}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">Due {item.due}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {studioTracks.map((track) => {
              const Icon = track.icon;
              return (
                <div
                  key={track.name}
                  className="rounded-2xl border border-border/60 bg-background p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/30">
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{track.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {track.meta}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border bg-muted/20 p-6">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <TimerIcon className="size-4 text-muted-foreground" />
              Schedule drop
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Queue a post, reel, or short in seconds.
            </p>
            <div className="mt-5 space-y-3">
              <Input placeholder="Content title" />
              <Input placeholder="Channel" />
              <Input placeholder="Publish time" />
              <Button className="w-full rounded-full">Schedule</Button>
            </div>
          </div>

          <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Next up</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Scheduled content over the next few days.
                </p>
              </div>
              <CalendarClockIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="mt-5 space-y-3">
              {studioSchedule.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/60 bg-background px-4 py-3"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.platform}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        data-studio-section
        className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="rounded-3xl border bg-card/70 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Channel lineup</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Manage connected accounts and publishing health.
              </p>
            </div>
            <Button variant="outline" size="sm" className="rounded-full">
              Manage
            </Button>
          </div>
          <div className="mt-5 space-y-3">
            {connectedChannels.map((channel) => (
              <div
                key={channel.name}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{channel.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {channel.handle}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {channel.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-muted/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Studio creation</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Spin up scripts, reels, and posts with creator AI.
              </p>
            </div>
            <SparklesIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                New script
              </p>
              <div className="mt-3 space-y-3">
                <Input placeholder="Video topic" />
                <Textarea placeholder="Outline or key beats" />
                <Button className="w-full rounded-full">
                  <Wand2Icon className="size-4" />
                  Generate script
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {aiStudioTools.map((tool) => (
                <div
                  key={tool.title}
                  className="rounded-2xl border border-border/60 bg-background p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <FlameIcon className="size-4 text-primary" />
                      {tool.title}
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full">
                      Open
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreatorDashboard;
