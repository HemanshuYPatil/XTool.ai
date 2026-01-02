"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Palette,
  LayoutGrid,
  Type,
  Code,
  Smartphone,
  Zap,
  Layers,
  Box,
  Image as ImageIcon,
  Share2,
  Wand2,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const ToolsShowcase = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from(headerRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      // Grid Items Animation
      gsap.from(gridRef.current?.children || [], {
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-background relative overflow-hidden"
    >
      <div className="container px-4 md:px-6 relative z-10">
        <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6">
            <Wand2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Powerhouse
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-primary">20+ Tools</span> under one roof
          </h2>
          <p className="text-lg text-muted-foreground">
            Stop switching between apps. XTool.ai brings every specialized tool
            you need into a single, unified workflow.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto"
        >
          {/* Large Card - Design */}
          <div className="col-span-1 md:col-span-2 row-span-2 rounded-3xl bg-card border border-border p-8 flex flex-col justify-between overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Palette className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <Palette className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Advanced Design System</h3>
              <p className="text-muted-foreground">
                Create, manage, and apply global design tokens. Colors,
                typography, and spacing scales at your fingertips.
              </p>
            </div>
            <div className="mt-8 flex gap-2">
              <div className="h-2 flex-1 rounded-full bg-blue-500/20" />
              <div className="h-2 flex-1 rounded-full bg-purple-500/20" />
              <div className="h-2 flex-1 rounded-full bg-pink-500/20" />
            </div>
          </div>

          {/* Medium Card - Layout */}
          <div className="col-span-1 md:col-span-1 rounded-3xl bg-card border border-border p-6 flex flex-col justify-between group hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
              <LayoutGrid className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Smart Layouts</h3>
              <p className="text-sm text-muted-foreground">
                Auto-layout engine that handles flexbox & grid for you.
              </p>
            </div>
          </div>

          {/* Medium Card - Typography */}
          <div className="col-span-1 md:col-span-1 rounded-3xl bg-card border border-border p-6 flex flex-col justify-between group hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
              <Type className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">Typography</h3>
              <p className="text-sm text-muted-foreground">
                Google Fonts integration with live preview.
              </p>
            </div>
          </div>

          {/* Large Card - Code */}
          <div className="col-span-1 md:col-span-2 row-span-1 rounded-3xl bg-card border border-border p-8 flex items-center justify-between overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="max-w-xs relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Production Ready Code</h3>
              <p className="text-sm text-muted-foreground">
                Export clean, semantic React, Vue, or HTML code instantly.
              </p>
            </div>
            <div className="hidden md:block p-4 rounded-xl bg-muted/50 border border-border font-mono text-xs text-muted-foreground">
              <span className="text-blue-400">const</span> App = () ={">"} {"{"}
              <br />
              &nbsp;&nbsp;<span className="text-purple-400">return</span> (
              <br />
              &nbsp;&nbsp;&nbsp;&nbsp;{"<"}
              <span className="text-red-400">Button</span> /{">"}
              <br />
              &nbsp;&nbsp;);
              <br />
              {"}"};
            </div>
          </div>

          {/* Small Cards Grid */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-card border border-border p-5 flex flex-col items-center justify-center text-center hover:bg-accent/5 transition-colors">
              <Smartphone className="w-8 h-8 text-foreground mb-3" />
              <span className="font-semibold text-sm">Responsive</span>
            </div>
            <div className="rounded-3xl bg-card border border-border p-5 flex flex-col items-center justify-center text-center hover:bg-accent/5 transition-colors">
              <Box className="w-8 h-8 text-foreground mb-3" />
              <span className="font-semibold text-sm">3D Assets</span>
            </div>
            <div className="rounded-3xl bg-card border border-border p-5 flex flex-col items-center justify-center text-center hover:bg-accent/5 transition-colors">
              <Layers className="w-8 h-8 text-foreground mb-3" />
              <span className="font-semibold text-sm">Layers</span>
            </div>
            <div className="rounded-3xl bg-card border border-border p-5 flex flex-col items-center justify-center text-center hover:bg-accent/5 transition-colors">
              <Zap className="w-8 h-8 text-foreground mb-3" />
              <span className="font-semibold text-sm">Interactions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
