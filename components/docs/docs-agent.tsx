"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageCircle, X, Send, Bot, User, Minimize2, Sparkles, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import gsap from "gsap";

export function DocsAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/docs/chat",
  });

  useEffect(() => {
    if (isOpen && !isMinimized) {
      gsap.fromTo(
        chatRef.current,
        { opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const toggleChat = () => {
    if (isOpen) {
      gsap.to(chatRef.current, {
        opacity: 0,
        y: 40,
        scale: 0.9,
        filter: "blur(10px)",
        duration: 0.4,
        ease: "power3.in",
        onComplete: () => setIsOpen(false),
      });
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4" ref={containerRef}>
      {isOpen && !isMinimized && (
        <div
          ref={chatRef}
          className="w-[380px] md:w-[420px] h-[600px] bg-background/80 border border-border/50 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden backdrop-blur-2xl ring-1 ring-white/10"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/40 bg-gradient-to-b from-primary/10 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[11px] font-medium text-muted-foreground">Online & Ready</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-colors" 
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors" 
                onClick={toggleChat}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
            <div className="space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-muted/30 flex items-center justify-center mb-6 ring-1 ring-border/50">
                    <Bot className="w-8 h-8 text-primary/40" />
                  </div>
                  <h4 className="text-base font-semibold mb-2">How can I help you today?</h4>
                  <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">
                    I can explain our modules, pricing, or help you with technical questions.
                  </p>
                  <div className="mt-8 grid grid-cols-1 gap-2 w-full">
                    {["Tell me about XDesign", "What are the pricing plans?", "How do I use the CLI?"].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleInputChange({ target: { value: suggestion } } as any)}
                        className="text-xs font-medium px-4 py-3 rounded-xl bg-muted/30 border border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
                    m.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border/50"
                    )}
                  >
                    {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={cn(
                      "relative p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm transition-all",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-muted/40 border border-border/40 rounded-tl-none backdrop-blur-sm"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 animate-in fade-in duration-300">
                  <div className="w-8 h-8 rounded-xl bg-muted border border-border/50 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted/40 border border-border/40 p-4 rounded-[1.5rem] rounded-tl-none backdrop-blur-sm">
                    <div className="flex gap-1.5">
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s]" />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-6 border-t border-border/40 bg-background/50 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl group-focus-within:bg-primary/10 transition-all duration-500" />
              <div className="relative flex items-center gap-2 bg-muted/40 border border-border/50 rounded-2xl p-1.5 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                <Input
                  placeholder="Type a message..."
                  value={input}
                  onChange={handleInputChange}
                  className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-3 text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input || isLoading}
                  className={cn(
                    "h-10 w-10 rounded-xl transition-all duration-300 shadow-lg shadow-primary/20",
                    !input ? "opacity-50 grayscale" : "opacity-100"
                  )}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-50">
                <span className="flex items-center gap-1"><Command className="w-2.5 h-2.5" /> + Enter to send</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <Button
        onClick={isMinimized ? () => setIsMinimized(false) : toggleChat}
        className={cn(
          "h-16 w-16 rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-105 active:scale-95 group",
          isOpen && !isMinimized 
            ? "bg-background border border-border/50 text-foreground hover:bg-muted" 
            : "bg-primary text-primary-foreground hover:shadow-primary/20"
        )}
      >
        {isOpen && !isMinimized ? (
          <X className="h-6 w-6 transition-transform duration-500 group-hover:rotate-90" />
        ) : (
          <div className="relative">
            <MessageCircle className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />
            {!isOpen && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-primary ring-4 ring-emerald-500/20 animate-pulse" />
            )}
          </div>
        )}
      </Button>
    </div>
  );
}
