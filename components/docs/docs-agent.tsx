"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { 
  MessageCircle, 
  X, 
  Bot, 
  Sparkles, 
  Command, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  RotateCcw,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter
} from "@/components/ui/dialog";

export function DocsAgent({ isEmbedded = false, onClose }: { isEmbedded?: boolean; onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, status } = useChat({
    api: "/api/docs/chat",
    streamProtocol: "text",
    experimental_throttle: 40,
  });

  // ... (useEffect and other handlers remain same)

  const handleClearChat = () => {
    setMessages([]);
    setIsDeleteOpen(false);
  };

  // ... (toggleChat and handleClose remain same)


  useEffect(() => {
    if (!isEmbedded && isOpen && !isMinimized) {
      gsap.fromTo(
        chatRef.current,
        { opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, [isOpen, isMinimized, isEmbedded]);

  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Handle scroll to show/hide button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isAtBottom);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  };

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

  const handleClose = () => {
    if (isEmbedded && onClose) {
      onClose();
    } else {
      toggleChat();
    }
  };

  const ChatContent = (
    <div
      ref={chatRef}
      className={cn(
        "flex flex-col h-full min-h-0", // Added min-h-0 for proper flex scrolling
        isEmbedded 
          ? "bg-background" 
          : "w-95 md:w-105 h-150 bg-background border border-border/20 rounded-4xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      )}
    >
      {/* Header - Clean and Organized */}
      <div className="px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-red-500 transition-colors"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-transparent" 
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area - Scrollable */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full px-6" ref={scrollRef} onScroll={handleScroll}>
          <div className="py-4 space-y-8 pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-forwards delay-100">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-5 ring-1 ring-border/50">
                  <Bot className="w-7 h-7 text-muted-foreground" />
                </div>
                <h4 className="text-[15px] font-medium mb-2 text-foreground">How can I help you?</h4>
                <p className="text-[13px] text-muted-foreground/80 max-w-55 leading-relaxed">
                  Ask questions about XTool.ai documentation, guides, or API.
                </p>
              </div>
            )}
            {messages.map((m, index) => {
              const isAssistant = m.role === "assistant";
              const isStreaming = status === "streaming";
              const isLastMessage = index === messages.length - 1;
              const messageText = typeof m.content === "string" ? m.content : "";

              return (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col gap-2 group animate-in fade-in slide-in-from-bottom-2 duration-500",
                  m.role === "user" ? "items-end" : "items-start"
                )}
              >
                {m.role === "user" ? (
                  <div className="bg-muted text-foreground px-4 py-2.5 rounded-[1.25rem] rounded-tr-sm text-[13px] leading-relaxed font-medium max-w-[85%] shadow-sm border border-border/50">
                    {messageText}
                  </div>
                ) : (
                  <div className="space-y-2 w-full pl-1">
                    <div className="text-[14px] text-foreground/90 leading-7 font-normal tracking-wide">
                      {messageText}
                      {isAssistant && isStreaming && isLastMessage && (
                        <span className="ml-1 inline-block h-4 w-2 animate-pulse rounded-sm bg-foreground/60 align-middle" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="p-1.5 hover:text-foreground hover:bg-muted/50 rounded-md transition-all">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:text-foreground hover:bg-muted/50 rounded-md transition-all">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:text-foreground hover:bg-muted/50 rounded-md transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:text-foreground hover:bg-muted/50 rounded-md transition-all">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
            })}
            {isLoading && (
              <div className="flex gap-2 animate-in fade-in duration-300 pl-1">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce animation-duration-[1s]" />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce animation-duration-[1s] [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce animation-duration-[1s] [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-4 right-6 p-2 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-muted transition-all duration-300 animate-in fade-in zoom-in z-50"
          >
            <ArrowDown className="w-4 h-4 text-foreground" />
          </button>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className="p-6 pt-2 pb-10 shrink-0 bg-background z-10">
        <form onSubmit={handleSubmit} className="relative group">
          <div className="relative flex flex-col bg-muted/30 border border-border/60 rounded-3xl p-4 min-h-30 focus-within:border-primary/50 focus-within:bg-muted/50 focus-within:shadow-sm transition-all duration-300">
            <textarea
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => handleInputChange(e as any)}
              className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none resize-none text-[14px] text-foreground placeholder:text-muted-foreground/50 h-full custom-scrollbar leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <div className="flex justify-between items-end mt-2">
              <div className="flex gap-2">
                <button type="button" className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-background/50 rounded-lg transition-all">
                  <Command className="w-4 h-4" />
                </button>
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={!input || isLoading}
                className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-none hover:shadow-md hover:scale-105 transition-all duration-300"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear Chat History?</DialogTitle>
            <DialogDescription>
              Are you sure to clear the list? This process is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleClearChat}>Clear Chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (isEmbedded) return ChatContent;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4" ref={containerRef}>
      {isOpen && !isMinimized && ChatContent}

      <Button
        onClick={isMinimized ? () => setIsMinimized(false) : toggleChat}
        className={cn(
          "h-16 w-16 rounded-4xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] transition-all duration-500 hover:scale-105 active:scale-95 group",
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
