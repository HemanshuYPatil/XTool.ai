"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualContainerRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial Entrance Animation
      const tl = gsap.timeline();

      tl.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      })
        .from(
          subtitleRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.6"
        )
        .from(
          ctaRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.6"
        )
        .from(
          visualContainerRef.current,
          {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.8"
        );

      // Scroll Animation (Container Scroll)
      // Initial state: Tilted and slightly scaled down
      gsap.set(visualRef.current, {
        rotationX: 20,
        scale: 0.8,
        z: -100,
      });

      gsap.to(visualRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          pin: true, // Pin the hero section while scrolling
        },
        rotationX: 0, // Rotate to flat
        scale: 1, // Scale up to full size
        z: 0,
        y: -50, // Move up slightly
        ease: "power2.inOut",
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[150vh] flex flex-col items-center bg-background overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-blue-500/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="container px-4 md:px-6 relative z-10 flex flex-col items-center pt-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border backdrop-blur-sm mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-secondary-foreground">
            The Future of Development
          </span>
        </div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-center bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/50 mb-6"
        >
          Unleash Your <br />
          <span className="text-primary">Creative Potential</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-muted-foreground text-center max-w-2xl mx-auto mb-10"
        >
          XTool.ai combines powerful design tools with production-ready code generation.
          Build faster, design better, and ship instantly.
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <Link
            href="/xtool"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-primary px-8 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          >
            <span className="mr-2">Start Building</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-8 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            See Pricing
          </Link>
        </div>

        {/* 3D Container Scroll Visual */}
        <div
          ref={visualContainerRef}
          className="w-full max-w-6xl mx-auto perspective-1000 pb-20"
          style={{ perspective: "1000px" }}
        >
          <div
            ref={visualRef}
            className="relative w-full aspect-video rounded-2xl border border-border/50 bg-card/50 backdrop-blur-md shadow-2xl overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
          >
             {/* Glow Effect */}
             <div className="absolute -inset-1 bg-linear-to-r from-primary/30 to-purple-600/30 rounded-2xl blur opacity-20" />
             
             <div className="relative rounded-2xl overflow-hidden bg-background/50 w-full h-full">
               <Image 
                  src="/dashboard.png" 
                  alt="XTool Dashboard" 
                  fill
                  className="object-cover"
                  priority
               />
               {/* Overlay Gradient */}
               <div className="absolute inset-0 bg-linear-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};
