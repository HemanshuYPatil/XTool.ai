"use client";

import Link from "next/link";
import { 
  PlusIcon, 
  ClapperboardIcon, 
  LayoutGridIcon, 
  ImageIcon, 
  ScissorsIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreationHub() {
  return (
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

        {/* AI Clipping Shortcut */}
        <div className="group relative overflow-hidden rounded-3xl border bg-card/40 p-8 transition-all hover:bg-card hover:shadow-xl">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-background transition-transform group-hover:scale-110">
            <ScissorsIcon className="size-7 text-primary" />
          </div>
          <h4 className="text-xl font-bold mb-2">AI Clipping</h4>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Instantly turn long-form videos into viral clips for social media.
          </p>
          <Button asChild className="w-full rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
            <Link href="/xtool/module-xcreator/video-clipping">Try AI Clipping</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
