"use client";

import { cn } from "@/lib/utils";
import { ArrowUp, Command } from "lucide-react";
import { useEffect, useState } from "react";

interface FloatingAskBarProps {
  onClick: () => void;
  className?: string;
}

export function FloatingAskBar({ onClick, className }: FloatingAskBarProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to show animation on mount
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0",
        className
      )}
    >
      <button
        onClick={onClick}
        className="group flex items-center gap-4 bg-[#171717] hover:bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-foreground pl-4 pr-2 py-2 rounded-full shadow-2xl hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] transition-all duration-300 w-100 max-w-[90vw]"
      >
        <span className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors">
          Ask a question...
        </span>
        
        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[10px] font-medium text-muted-foreground border border-white/5">
            <span className="text-xs">⌘</span>
            <span>K</span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
            <ArrowUp className="w-4 h-4" />
          </div>
        </div>
      </button>
    </div>
  );
}
