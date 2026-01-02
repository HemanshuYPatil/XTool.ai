"use client";

import React, { useRef, useState } from "react";
import {
  Palette,
  LayoutGrid,
  Type,
  Code,
  Smartphone,
  Zap,
  Layers,
  Box,
  Wand2,
} from "lucide-react";

export const ToolsShowcase = () => {
  return (
    <section className="py-32 bg-background relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {/* Large Card - Design */}
          <SpotlightCard className="col-span-1 md:col-span-2 row-span-2">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Palette className="w-48 h-48" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
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
          </SpotlightCard>

          {/* Medium Card - Layout */}
          <SpotlightCard className="col-span-1 md:col-span-1">
            <div className="h-full flex flex-col justify-between">
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
          </SpotlightCard>

          {/* Medium Card - Typography */}
          <SpotlightCard className="col-span-1 md:col-span-1">
            <div className="h-full flex flex-col justify-between">
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
          </SpotlightCard>

          {/* Large Card - Code */}
          <SpotlightCard className="col-span-1 md:col-span-2 row-span-1">
            <div className="h-full flex items-center justify-between overflow-hidden">
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
          </SpotlightCard>

          {/* Small Cards Grid */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
            <SpotlightCard className="flex flex-col items-center justify-center text-center">
              <Smartphone className="w-8 h-8 text-foreground mb-3" />
              <span className="font-semibold text-sm">Responsive</span>
            </SpotlightCard>
            <SpotlightCard className="flex flex-col items-center justify-center text-center">
              <Box className="w-8 h-8 text-foreground mb-3" />
              <span className="font-semibold text-sm">3D Assets</span>
            </SpotlightCard>
            <SpotlightCard className="flex flex-col items-center justify-center text-center">
              <Layers className="w-8 h-8 text-foreground mb-3" />
              <span className="font-semibold text-sm">Layers</span>
            </SpotlightCard>
            <SpotlightCard className="flex flex-col items-center justify-center text-center">
              <Zap className="w-8 h-8 text-foreground mb-3" />
              <span className="font-semibold text-sm">Interactions</span>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
};

const SpotlightCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-border bg-card overflow-hidden p-8 group hover:border-primary/50 transition-colors ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.1), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
