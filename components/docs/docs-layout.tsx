"use client";

import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsRightSidebar } from "@/components/docs/docs-right-sidebar";
import { FloatingAskBar } from "@/components/docs/floating-ask-bar";
import Link from "next/link";
import { Search, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Chat: Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsChatOpen(prev => !prev);
      }
      // Search: Ctrl + /
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">X</span>
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:inline-block">XTool.ai</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
              <Link href="/docs" className="text-foreground border-b-2 border-primary pb-4 mt-4">Documentation</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="relative w-full max-w-sm hidden lg:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="search"
                placeholder="Search documentation... (Ctrl /)"
                className="w-full bg-muted/50 pl-9 h-9 rounded-xl border-border/40 focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <Moon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full px-4 md:px-6">
        <div className="flex gap-6 justify-center">
          {/* Left Sidebar */}
          <DocsSidebar className="w-64 shrink-0 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-4 py-8" />
          
          {/* Main Content Area */}
          <main className={`flex-1 min-w-0 py-8 transition-all duration-500 ease-in-out ${isChatOpen ? 'max-w-3xl' : 'max-w-6xl'}`}>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>

          {/* Right Sidebar (Assistant Only) */}
          <DocsRightSidebar 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        </div>
      </div>

      {/* Floating Ask Bar */}
      {!isChatOpen && (
        <FloatingAskBar onClick={() => setIsChatOpen(true)} />
      )}
    </div>
  );
}
