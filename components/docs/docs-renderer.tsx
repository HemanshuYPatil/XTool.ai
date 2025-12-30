"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

// Note: Using react-markdown and react-syntax-highlighter for simplicity and reliability
// in this environment. Shiki is great but requires more setup for client-side rendering.

export function DocsRenderer({ content, className }: { content: string; className?: string }) {
  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus as any}
                language={match[1]}
                PreTag="div"
                className="rounded-lg !bg-muted/50 !border !border-border"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={cn("bg-muted px-1.5 py-0.5 rounded text-primary", className)} {...props}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => <h1 className="text-4xl font-bold mb-8 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-semibold mt-12 mb-4 text-foreground border-b border-border pb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-medium mt-8 mb-3 text-foreground">{children}</h3>,
          p: ({ children }) => <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>,
          ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-muted-foreground">{children}</ul>,
          li: ({ children }) => <li className="ml-4">{children}</li>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-8">
              <table className="w-full border-collapse border border-border text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => <th className="border border-border bg-muted/30 px-4 py-2 text-left font-semibold">{children}</th>,
          td: ({ children }) => <td className="border border-border px-4 py-2">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
