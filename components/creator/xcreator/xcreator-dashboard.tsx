"use client";

import { 
  TrendingUpIcon, 
  UsersIcon, 
  PlayIcon, 
  CalendarIcon, 
  ArrowUpRightIcon,
  VideoIcon,
  FileTextIcon,
  MessageSquareIcon,
  MoreHorizontalIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Reach", value: "1.2M", change: "+12.5%", icon: UsersIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "Engagement", value: "84.2K", change: "+5.2%", icon: TrendingUpIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Content Created", value: "142", change: "+18", icon: PlayIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
];

const timeline = [
  { time: "09:00 AM", title: "AI Trends Reel", platform: "Instagram", status: "Scheduled", type: "Reel" },
  { time: "11:30 AM", title: "XCode CLI Post", platform: "Twitter", status: "Processing", type: "Post" },
  { time: "02:00 PM", title: "Productivity Short", platform: "YouTube", status: "Draft", type: "Video" },
  { time: "05:00 PM", title: "Weekly Roundup", platform: "LinkedIn", status: "Scheduled", type: "Post" },
];

const recentContent = [
  { title: "Future of AI", date: "2h ago", views: "12.4K", type: "Reel", thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop" },
  { title: "Coding Setup", date: "5h ago", views: "8.2K", type: "Video", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop" },
  { title: "Design Tips", date: "1d ago", views: "45.1K", type: "Post", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop" },
];

export function XCreatorDashboard() {
  return (
    <div className="space-y-10">
      {/* Hero Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative overflow-hidden rounded-3xl border bg-card/40 p-6 transition-all hover:bg-card hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", stat.bg)}>
                <stat.icon className={cn("size-6", stat.color)} />
              </div>
              <span className={cn("text-xs font-bold", stat.color)}>{stat.change}</span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h3 className="text-3xl font-bold tracking-tight">{stat.value}</h3>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12">
              <stat.icon className="size-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Performance Graph Placeholder */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold tracking-tight">Performance Overview</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Last 7 Days <ArrowUpRightIcon className="ml-2 size-4" />
            </Button>
          </div>
          <div className="relative h-87.5 rounded-3xl border bg-card/40 p-8 overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex items-end justify-between px-8 pb-8">
              {[60, 45, 75, 50, 90, 65, 85].map((h, i) => (
                <div key={i} className="group relative flex flex-col items-center gap-2 w-full max-w-10">
                  <div 
                    className="w-full bg-primary/20 rounded-t-xl transition-all hover:bg-primary/50 cursor-pointer relative" 
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-primary px-2 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {h}K
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-8 left-8 space-y-1">
              <p className="text-4xl font-bold tracking-tighter">84.2K</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg. Daily Engagement</p>
            </div>
          </div>
        </div>

        {/* Upcoming Timeline */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold tracking-tight">Today's Schedule</h3>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              View Calendar
            </Button>
          </div>
          <div className="rounded-3xl border bg-card/40 p-6 space-y-6 shadow-sm">
            {timeline.map((item, i) => (
              <div key={i} className="relative flex gap-4 pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-border last:before:hidden">
                <div className="absolute -left-1 top-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.time}</span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                      item.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                      item.status === "Processing" ? "bg-amber-500/10 text-amber-500" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {item.status}
                    </span>
                  </div>
                  <p className="font-bold">{item.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {item.platform} • {item.type}
                  </div>
                </div>
              </div>
            ))}
            <Button className="w-full rounded-2xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all border-dashed border-2 border-primary/20">
              <CalendarIcon className="mr-2 size-4" />
              Manage Full Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Content Gallery */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold tracking-tight">Recent Content</h3>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" className="rounded-full">
              <VideoIcon className="mr-2 size-4" /> Reels
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              <FileTextIcon className="mr-2 size-4" /> Posts
            </Button>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {recentContent.map((content, i) => (
            <div key={i} className="group overflow-hidden rounded-3xl border bg-card/40 transition-all hover:bg-card hover:shadow-xl">
              <div className="relative aspect-video overflow-hidden">
                <img src={content.thumbnail} alt={content.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                  <Button size="icon" variant="secondary" className="rounded-full scale-90 group-hover:scale-100 transition-transform">
                    <PlayIcon className="size-5 fill-current" />
                  </Button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="rounded-full bg-black/40 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    {content.type}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold leading-tight">{content.title}</h4>
                    <p className="text-xs text-muted-foreground">{content.date} • {content.views} views</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontalIcon className="size-4" />
                  </Button>
                </div>
                <div className="mt-4 flex items-center gap-4 border-t pt-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <MessageSquareIcon className="size-3" /> 124
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <TrendingUpIcon className="size-3" /> 8.4%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
