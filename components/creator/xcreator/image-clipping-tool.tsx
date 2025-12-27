"use client";

import { useState } from "react";
import { 
  ImageIcon, 
  SparklesIcon, 
  Wand2Icon, 
  ArrowRightIcon, 
  LayersIcon, 
  MaximizeIcon, 
  PaletteIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImageClippingTool() {
  const [imageUrl, setImageUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!imageUrl) return;
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
          AI Image Clipping
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Transform Images with <span className="text-primary">AI Precision</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Paste an image URL or upload your own. Our AI will intelligently crop, 
          remove backgrounds, and optimize for social media formats.
        </p>
        
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-linear-to-r from-primary/50 to-purple-500/50 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          <div className="relative flex items-center gap-2 rounded-2xl border bg-background p-2 shadow-xl">
            <div className="pl-4 text-muted-foreground">
              <ImageIcon className="size-5" />
            </div>
            <Input 
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL or drag & drop..." 
              className="border-0 bg-transparent focus-visible:ring-0 text-base"
            />
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !imageUrl}
              className="rounded-xl px-6 h-12 shadow-lg shadow-primary/20"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <Wand2Icon className="size-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Process <ArrowRightIcon className="size-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-center gap-8 pt-4">
          {[
            { label: "Background Removal", icon: LayersIcon },
            { label: "Smart Upscale", icon: MaximizeIcon },
            { label: "Color Grading", icon: PaletteIcon },
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
