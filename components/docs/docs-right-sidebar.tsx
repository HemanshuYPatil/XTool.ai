"use client";

import { DocsAgent } from "./docs-agent";
import { cn } from "@/lib/utils";

interface DocsRightSidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function DocsRightSidebar({ className, isOpen, onClose }: DocsRightSidebarProps) {
  return (
    <aside 
      className={cn(
        "sticky top-14 h-[calc(100vh-3.5rem)] z-40 bg-background border-l border-border transition-all duration-500 ease-in-out shadow-2xl overflow-hidden",
        isOpen ? "w-112.5 opacity-100 border-l" : "w-0 opacity-0 border-l-0",
        className
      )}
    >
      {/* AI Assistant Panel - Full Height/Width */}
      <div className="flex-1 flex flex-col h-full w-112.5">
        <DocsAgent isEmbedded onClose={onClose} />
      </div>
    </aside>
  );
}
