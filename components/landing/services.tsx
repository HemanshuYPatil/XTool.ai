"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layout, Code, Zap, Layers, MousePointer2, Terminal, Share2, Box } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Services = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".bento-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Workflow <br />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Redefined.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Experience a development process that flows as fast as your thoughts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {/* Card 1: Intuitive UI/UX Design (Span 2 Cols) */}
          <div className="bento-card group relative md:col-span-2 rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 overflow-hidden hover:border-primary/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform duration-500">
                  <Layout className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Intuitive UI/UX Design</h3>
                <p className="text-muted-foreground max-w-md">
                  Drag, drop, and design with pixel-perfect precision. Our advanced editor feels like your favorite design tool but outputs real code.
                </p>
              </div>

              {/* Visual Decoration */}
              <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-50 md:opacity-100 translate-x-1/4 translate-y-1/4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                <div className="w-full h-full bg-background border border-border rounded-tl-3xl shadow-2xl p-4">
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-20 w-full bg-muted/50 rounded-xl" />
                    <div className="flex gap-3">
                      <div className="h-20 w-1/2 bg-primary/10 rounded-xl" />
                      <div className="h-20 w-1/2 bg-muted/50 rounded-xl" />
                    </div>
                  </div>
                  {/* Floating Cursor */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-2 animate-floating">
                    <MousePointer2 className="w-3 h-3" />
                    <span>Editing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Production-Ready Code (Row Span 2) */}
          <div className="bento-card group relative md:row-span-2 rounded-3xl border border-border bg-zinc-950 text-white p-8 overflow-hidden hover:border-purple-500/50 transition-colors duration-500">
             <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-500">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Production-Ready Code</h3>
              <p className="text-zinc-400 mb-8">
                Forget spaghetti code. XTool generates clean, semantic, and optimized React, Vue, or HTML/CSS.
              </p>

              {/* Code Visual */}
              <div className="flex-1 bg-zinc-900/50 rounded-xl border border-white/10 p-4 font-mono text-xs text-zinc-300 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-8 bg-white/5 border-b border-white/5 flex items-center px-3 gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="mt-8 space-y-1 opacity-80">
                  <p><span className="text-purple-400">export</span> <span className="text-blue-400">const</span> <span className="text-yellow-400">Button</span> = () <span className="text-blue-400">=&gt;</span> {"{"}</p>
                  <p className="pl-4"><span className="text-purple-400">return</span> (</p>
                  <p className="pl-8">&lt;<span className="text-red-400">button</span></p>
                  <p className="pl-12"><span className="text-green-400">className</span>=<span className="text-orange-300">"px-4 py-2..."</span></p>
                  <p className="pl-8">&gt;</p>
                  <p className="pl-12">Click me</p>
                  <p className="pl-8">&lt;/<span className="text-red-400">button</span>&gt;</p>
                  <p className="pl-4">);</p>
                  <p>{"}"};</p>
                </div>
                {/* Gradient Overlay at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-zinc-950 to-transparent" />
              </div>
            </div>
          </div>

          {/* Card 3: Instant Prototyping */}
          <div className="bento-card group relative rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 overflow-hidden hover:border-yellow-500/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6 text-yellow-500 group-hover:scale-110 transition-transform duration-500">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Prototyping</h3>
              <p className="text-muted-foreground text-sm">
                Turn static designs into interactive prototypes with a single click.
              </p>
              
              <div className="mt-6 flex items-center gap-3">
                 <div className="h-10 px-4 rounded-full bg-primary/10 text-primary flex items-center gap-2 text-sm font-medium">
                    <Share2 className="w-4 h-4" />
                    <span>Share Link</span>
                 </div>
                 <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 </div>
              </div>
            </div>
          </div>

          {/* Card 4: Component Library */}
          <div className="bento-card group relative rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-8 overflow-hidden hover:border-green-500/50 transition-colors duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 text-green-500 group-hover:scale-110 transition-transform duration-500">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Component Library</h3>
              <p className="text-muted-foreground text-sm">
                Access thousands of pre-built, customizable components.
              </p>

              {/* Mini Grid Visual */}
              <div className="absolute right-4 bottom-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
                 <div className="grid grid-cols-2 gap-2">
                    <div className="w-8 h-8 rounded bg-current" />
                    <div className="w-8 h-8 rounded bg-current" />
                    <div className="w-8 h-8 rounded bg-current" />
                    <div className="w-8 h-8 rounded bg-current" />
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
