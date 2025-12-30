import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { DocsAgent } from "@/components/docs/docs-agent";
import Link from "next/link";
import { Github } from "lucide-react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">X</span>
              </div>
              <span className="font-bold text-xl tracking-tight">XTool.ai <span className="text-muted-foreground font-medium">Docs</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/xtool" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <div className="h-4 w-px bg-border/60" />
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      <div className="container px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-12 py-12">
          {/* Redesigned Sidebar */}
          <DocsSidebar className="w-full md:w-64 shrink-0 md:sticky md:top-28 h-auto md:h-[calc(100vh-160px)] overflow-y-auto pr-4 scrollbar-none" />
          
          {/* Main Content Area */}
          <main className="flex-1 min-w-0 max-w-4xl mx-auto md:mx-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>

          {/* Docs Agent - Redesigned UI will be handled in its component */}
          <DocsAgent />
        </div>
      </div>
    </div>
  );
}
