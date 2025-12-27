"use client";

import { 
  YoutubeIcon, 
  InstagramIcon, 
  TwitterIcon, 
  LinkedinIcon, 
  PlusIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const connectedChannels = [
  { name: "YouTube", handle: "@xtoolstudio", status: "Connected", icon: YoutubeIcon, color: "text-red-500" },
  { name: "Instagram", handle: "@xtool.studio", status: "Connected", icon: InstagramIcon, color: "text-pink-500" },
  { name: "Twitter", handle: "@xtool_ai", status: "Connected", icon: TwitterIcon, color: "text-sky-500" },
  { name: "LinkedIn", handle: "XTool.ai", status: "Connected", icon: LinkedinIcon, color: "text-blue-600" },
];

export function ChannelManagement() {
  return (
    <section className="space-y-6">
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
    </section>
  );
}
