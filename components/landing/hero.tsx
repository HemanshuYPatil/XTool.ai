"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power4.out",
      })
        .from(
          subtitleRef.current,
          {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.5"
        )
        .from(
          ctaRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.5"
        );

      // Parallax effect for the visual element
      gsap.to(visualRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 200,
        rotationX: 10,
        scale: 0.9,
        ease: "none",
      });
      
       // Mouse movement parallax
      const handleMouseMove = (e: MouseEvent) => {
        if (!visualRef.current) return;
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20;
        const y = (clientY / window.innerHeight - 0.5) * 20;

        gsap.to(visualRef.current, {
          rotationY: x,
          rotationX: -y,
          duration: 1,
          ease: "power2.out",
        });
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background pt-20"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container px-4 md:px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border backdrop-blur-sm mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-secondary-foreground">
            Reimagining Development
          </span>
        </div>

        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/50 mb-6"
        >
          Build Faster. <br />
          <span className="text-primary">Design Better.</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          XTool.ai provides a suite of powerful tools to streamline your
          workflow, from design to deployment. Experience the future of
          software creation.
        </p>

        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/xtool/module-xdesign"
            className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-primary px-8 font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          >
            <span className="mr-2">Get Started</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex h-12 items-center justify-center rounded-full border border-input bg-background px-8 font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View Pricing
          </Link>
        </div>

        {/* 3D Visual Element Placeholder */}
        <div
          ref={visualRef}
          className="mt-20 relative w-full max-w-5xl mx-auto aspect-video rounded-xl border border-border/50 bg-card/50 backdrop-blur-md shadow-2xl overflow-hidden perspective-1000"
          style={{ transformStyle: "preserve-3d" }}
        >
           <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
           <div className="flex items-center justify-center h-full text-muted-foreground/20 font-bold text-9xl select-none">
             XTOOL
           </div>
           {/* Add more decorative elements here to enhance the 3D feel */}
           <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-lg backdrop-blur-xl border border-white/10 shadow-lg transform translate-z-10" />
           <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/10 rounded-full backdrop-blur-xl border border-white/10 shadow-lg transform translate-z-20" />
        </div>
      </div>
    </section>
  );
};
