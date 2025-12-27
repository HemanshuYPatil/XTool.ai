"use client";

import { useState } from "react";
import { 
  GlobeIcon, 
  Wand2Icon, 
  ArrowRightIcon, 
  SparklesIcon, 
  ScanEyeIcon, 
  ScissorsIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VideoClippingTool() {
  const [videoUrl, setVideoUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!videoUrl) return;
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 3000);
  };

  return (
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
  );
}
