"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import { Copy, Check, Info, AlertCircle, Terminal } from "lucide-react";

export function DocsRenderer({ content, className }: { content: string; className?: string }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            
            if (!inline && match) {
              return (
                <div className="relative group my-6">
                  <div className="absolute right-4 top-4 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 bg-muted/50 px-2 py-1 rounded">
                      {match[1]}
                    </span>
                    <button
                      onClick={() => copyToClipboard(codeString)}
                      className="p-2 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
                    >
                      {copied === codeString ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-2xl! bg-muted/30! border! border-border/40! p-6! m-0!"
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return (
              <code className={cn("bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-mono text-[0.9em]", className)} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 id={String(children).toLowerCase().replace(/\s+/g, "-")} className="text-4xl font-black mb-8 text-foreground tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 id={String(children).toLowerCase().replace(/\s+/g, "-")} className="text-2xl font-bold mt-16 mb-6 text-foreground tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 id={String(children).toLowerCase().replace(/\s+/g, "-")} className="text-xl font-bold mt-10 mb-4 text-foreground tracking-tight">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-6 text-[15px]">{children}</p>,
          ul: ({ children }) => <ul className="list-none space-y-3 mb-8">{children}</ul>,
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-muted-foreground text-[15px]">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2.5 shrink-0" />
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <div className="my-8 p-4 rounded-2xl bg-primary/5 border border-primary/20 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm text-primary/80 leading-relaxed italic">
                {children}
              </div>
            </div>
          ),
          table: ({ children }) => (
            <div className="my-8 rounded-2xl border border-border/40 overflow-hidden bg-muted/10">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/30 border-b border-border/40">{children}</thead>,
          th: ({ children }) => <th className="px-6 py-4 text-left font-bold text-foreground uppercase tracking-wider text-[11px]">{children}</th>,
          td: ({ children }) => <td className="px-6 py-4 border-b border-border/20 text-muted-foreground">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
