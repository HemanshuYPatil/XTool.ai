"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRightIcon, ZapIcon } from "lucide-react";

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: any;
    const loadGSAP = async () => {
      const { gsap } = await import("gsap");
      ctx = gsap.context(() => {
        gsap.fromTo("[data-animate]", 
          { 
            opacity: 0, 
            y: 30 
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
          }
        );
      }, heroRef);
    };

    loadGSAP();
    return () => ctx?.revert();
  }, []);

  return (
    <section 
      ref={heroRef}
      className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 pb-16 px-6 overflow-hidden"
    >
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-250 h-150 bg-primary/20 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
        <div 
          data-animate
          className="opacity-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card/50 backdrop-blur-sm text-xs font-bold text-primary mb-4"
        >
          <ZapIcon className="size-3 fill-current" />
          <span>The Future of AI-Powered Creation</span>
        </div>

        <h1 
          data-animate
          className="opacity-0 text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
        >
          Build, Design, and Scale <br />
          <span className="bg-linear-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
            with XTool.ai
          </span>
        </h1>

        <p 
          data-animate
          className="opacity-0 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          The all-in-one command center for modern creators and developers. 
          Transform long-form content, design stunning UIs, and automate your workflow with AI.
        </p>

        <div 
          data-animate
          className="opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Button asChild size="lg" className="rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-primary/20">
            <Link href="/xtool">
              Get Started Free <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-12 text-base font-bold bg-card/50 backdrop-blur-sm">
            <Link href="#modules">
              Explore Modules
            </Link>
          </Button>
        </div>

        {/* Floating Elements / Decorative */}
        <div 
          data-animate
          className="opacity-0 pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 grayscale hover:grayscale-0 transition-all duration-500"
        >
          {['XCreator', 'XCode', 'XDesign', 'XStudio'].map((item) => (
            <div key={item} className="text-sm font-bold tracking-widest uppercase">{item}</div>
          ))}
        </div>
      </div>
    </section>
  );
};
