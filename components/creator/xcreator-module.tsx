"use client";

import { useState } from "react";
import {
  CalendarClockIcon,
  ClapperboardIcon,
  GlobeIcon,
  ScanEyeIcon,
  SparklesIcon,
  TimerIcon,
  Wand2Icon,
  YoutubeIcon,
  InstagramIcon,
  TwitterIcon,
  LinkedinIcon,
  PlusIcon,
  ScissorsIcon,
  LayoutGridIcon,
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  PlayIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const connectedChannels = [
  { name: "YouTube", handle: "@xtoolstudio", status: "Connected", icon: YoutubeIcon, color: "text-red-500" },
  { name: "Instagram", handle: "@xtool.studio", status: "Connected", icon: InstagramIcon, color: "text-pink-500" },
  { name: "Twitter", handle: "@xtool_ai", status: "Connected", icon: TwitterIcon, color: "text-sky-500" },
  { name: "LinkedIn", handle: "XTool.ai", status: "Connected", icon: LinkedinIcon, color: "text-blue-600" },
];

const upcomingContent = [
  {
    title: "The Future of Agentic AI",
    type: "Reel",
    platform: "Instagram",
    time: "Today, 6:00 PM",
    status: "Ready",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop",
  },
  {
    title: "XCode CLI Tutorial",
    type: "Video",
    platform: "YouTube",
    time: "Tomorrow, 10:00 AM",
    status: "Scheduled",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop",
  },
  {
    title: "Creator Economy Trends",
    type: "Post",
    platform: "LinkedIn",
    time: "Dec 28, 9:00 AM",
    status: "Draft",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
  },
];

export default function XCreatorModule() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!videoUrl) return;
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  return (
    <div className="space-y-12 pb-12">
      {/* AI Video Clipping Hero */}
      <section className="relative overflow-hidden rounded-[2.5rem] border bg-card/50 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_50%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.06),transparent_50%)]" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
            <SparklesIcon className="size-3.5" />
            AI Video Clipping
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Turn Long Videos into <span className="text-primary">Viral Clips</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste any YouTube or public video URL. Our AI will analyze the content, 
            recognize the best moments, and generate optimized shorts and reels.
          </p>
          
          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary/50 to-purple-500/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex items-center gap-2 rounded-2xl border bg-background p-2 shadow-xl">
              <div className="pl-4 text-muted-foreground">
                <GlobeIcon className="size-5" />
              </div>
              <Input 
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube, Vimeo, or public video URL..." 
                className="border-0 bg-transparent focus-visible:ring-0 text-base"
              />
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing || !videoUrl}
                className="rounded-xl px-6 h-12 shadow-lg shadow-primary/20"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <Wand2Icon className="size-4 animate-spin" />
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Analyze <ArrowRightIcon className="size-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 pt-4">
            {[
              { label: "Scene Detection", icon: ScanEyeIcon },
              { label: "Auto Captions", icon: Wand2Icon },
              { label: "Smart Cropping", icon: ScissorsIcon },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="size-4 text-primary/60" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Creation Hub */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight">Creation Hub</h3>
            <p className="text-sm text-muted-foreground">Design and craft your next masterpiece.</p>
          </div>
          <Button variant="outline" className="rounded-full">
            <LayoutGridIcon className="size-4 mr-2" />
            Templates
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* IBS Post */}
          <div className="group relative overflow-hidden rounded-3xl border bg-card/40 p-8 transition-all hover:bg-card hover:shadow-xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-background transition-transform group-hover:scale-110">
              <PlusIcon className="size-7 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Create IBS Post</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Generate high-engagement Interactive Brand Stories (IBS) with AI-powered copy and visuals.
            </p>
            <Button className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
              Start Designing
            </Button>
          </div>

          {/* New Reel */}
          <div className="group relative overflow-hidden rounded-3xl border bg-card/40 p-8 transition-all hover:bg-card hover:shadow-xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-background transition-transform group-hover:scale-110">
              <ClapperboardIcon className="size-7 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Create New Reel</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Craft stunning short-form videos with built-in trending audio and AI scene transitions.
            </p>
            <Button className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
              Open Studio
            </Button>
          </div>

          {/* Asset Vault */}
          <div className="group relative overflow-hidden rounded-3xl border bg-card/40 p-8 transition-all hover:bg-card hover:shadow-xl">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-background transition-transform group-hover:scale-110">
              <LayoutGridIcon className="size-7 text-primary" />
            </div>
            <h4 className="text-xl font-bold mb-2">Asset Vault</h4>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Access your library of clips, b-roll, and generated assets across all your projects.
            </p>
            <Button className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
              Browse Assets
            </Button>
          </div>
        </div>
      </section>

      {/* Advanced Scheduler */}
      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">Advanced Scheduler</h3>
              <p className="text-sm text-muted-foreground">Manage and optimize your publishing pipeline.</p>
            </div>
            <Button variant="outline" className="rounded-full">
              <CalendarClockIcon className="size-4 mr-2" />
              Full Calendar
            </Button>
          </div>

          <div className="rounded-3xl border bg-card/40 overflow-hidden shadow-sm">
            <div className="divide-y border-t">
              {upcomingContent.map((item) => (
                <div key={item.title} className="group flex items-center gap-6 p-6 hover:bg-muted/30 transition-colors">
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border bg-muted">
                    <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayIcon className="size-6 text-white fill-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.type}</span>
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-xs text-muted-foreground">{item.platform}</span>
                    </div>
                    <h5 className="font-bold text-lg truncate">{item.title}</h5>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TimerIcon className="size-3.5" />
                        {item.time}
                      </div>
                      <div className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        item.status === "Ready" ? "bg-emerald-500/10 text-emerald-500" : 
                        item.status === "Scheduled" ? "bg-primary/10 text-primary" : 
                        "bg-muted text-muted-foreground"
                      )}>
                        {item.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                      <ScanEyeIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Wand2Icon className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Management */}
        <div className="space-y-6">
          <div className="space-y-1 px-2">
            <h3 className="text-2xl font-bold tracking-tight">Channels</h3>
            <p className="text-sm text-muted-foreground">Connected accounts.</p>
          </div>
          
          <div className="rounded-3xl border bg-card/40 p-6 space-y-4 shadow-sm">
            {connectedChannels.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between p-4 rounded-2xl border bg-background/60 hover:bg-background transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-xl border flex items-center justify-center bg-background", channel.color)}>
                    <channel.icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{channel.name}</p>
                    <p className="text-xs text-muted-foreground">{channel.handle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full rounded-2xl border-dashed border-2 py-8 hover:bg-primary/5 hover:border-primary/50 transition-all">
              <PlusIcon className="size-4 mr-2" />
              Connect New Channel
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="rounded-3xl border bg-primary/5 p-6 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Weekly Reach</h4>
            <div className="flex items-end gap-2 h-24">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-primary/20 rounded-t-md transition-all hover:bg-primary/40" 
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="text-2xl font-bold">1.2M</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Impressions</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-500 font-bold text-sm">+12.5%</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">vs last week</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
