"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { gsap } from "gsap";

const subtitles = [
  "Preparing your creative space...",
  "Loading project assets...",
  "Initializing AI engine...",
  "Setting up the canvas...",
  "Almost there...",
];

export const StudioLoader = ({ isDone }: { isDone?: boolean }) => {
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (subtitleIndex + 1) % subtitles.length;
      
      if (subtitleRef.current) {
        gsap.to(subtitleRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.4,
          onComplete: () => {
            setSubtitleIndex(nextIndex);
            gsap.fromTo(subtitleRef.current, 
              { y: 20, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.4 }
            );
          }
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [subtitleIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 98) return prev;
        const remaining = 100 - prev;
        return prev + (Math.random() * (remaining * 0.1));
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDone && progress > 50) {
      setProgress(100);
      const timeout = setTimeout(() => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.05,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => setIsExiting(true)
          });
        } else {
          setIsExiting(true);
        }
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [isDone, progress]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, []);

  if (isExiting) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background/80 backdrop-blur-3xl"
    >
      <div className="relative flex flex-col items-center max-w-md w-full px-6">
        {/* Modern Loader Animation */}
        <div className="relative mb-12 h-48 w-48">
          {/* Animated Glow */}
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-[60px] animate-pulse" />
          
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/10 border-t-primary animate-[spin_3s_linear_infinite]" />
          
          {/* Middle Ring */}
          <div className="absolute inset-4 rounded-full border-2 border-accent/10 border-t-accent animate-[spin_2s_linear_infinite_reverse]" />
          
          {/* Inner Ring */}
          <div className="absolute inset-8 rounded-full border-2 border-primary/20 border-b-primary animate-[spin_4s_linear_infinite]" />
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-20 w-20 rounded-[2.5rem] bg-linear-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-2xl border border-white/10 backdrop-blur-md">
                <Sparkles className="h-10 w-10 text-primary animate-pulse" />
             </div>
          </div>
        </div>

        <div className="text-center space-y-6 w-full">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/50">
              {isDone ? "Studio Ready" : "Opening Studio"}
            </h1>
            <div className="h-8 flex items-center justify-center overflow-hidden">
                <p 
                  ref={subtitleRef}
                  className="text-muted-foreground text-lg font-medium tracking-wide"
                >
                  {isDone ? "Welcome back, creator." : subtitles[subtitleIndex]}
                </p>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full space-y-3">
            <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
              <div 
                className="h-full bg-linear-to-r from-primary to-accent transition-all duration-500 ease-out shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              <span>System Initializing</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[70%] w-[70%] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute -right-[10%] -bottom-[10%] h-[70%] w-[70%] rounded-full bg-accent/5 blur-[120px] animate-pulse delay-1000" />
      </div>
    </div>
  );
};
