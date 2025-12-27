"use client";

import { 
  CalendarClockIcon, 
  TimerIcon, 
  PlayIcon, 
  ScanEyeIcon, 
  Wand2Icon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export function AdvancedScheduler() {
  return (
    <section className="space-y-6">
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
    </section>
  );
}
