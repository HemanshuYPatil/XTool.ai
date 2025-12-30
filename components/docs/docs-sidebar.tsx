"use client";

import { docsContent } from "@/lib/docs-content";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DocsSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("hidden lg:block", className)}>
      <nav className="flex flex-col gap-8">
        <div>
          <h4 className="mb-4 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            Getting Started
          </h4>
          <div className="flex flex-col gap-1">
            {Object.entries(docsContent).map(([key, section]) => {
              const href = `/docs/${key === "introduction" ? "" : key}`;
              const isActive = pathname === href || (key === "introduction" && pathname === "/docs");
              
              return (
                <Link
                  key={key}
                  href={href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary/5 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full mr-3 transition-all duration-300",
                    isActive ? "bg-primary scale-100" : "bg-transparent scale-0 group-hover:bg-muted-foreground/30 group-hover:scale-100"
                  )} />
                  {section.title}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-border/40">
          <h4 className="mb-4 px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            Resources
          </h4>
          <div className="flex flex-col gap-1">
            <a 
              href="#" 
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              API Reference
            </a>
            <a 
              href="#" 
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Community
            </a>
          </div>
        </div>
      </nav>
    </aside>
  );
}

