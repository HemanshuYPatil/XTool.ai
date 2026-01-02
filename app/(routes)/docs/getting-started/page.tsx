import { docsContent } from "@/lib/docs-content";
import { DocsRenderer } from "@/components/docs/docs-renderer";

export default function GettingStartedPage() {
  const content = docsContent["getting-started"];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DocsRenderer content={content.content} />
    </div>
  );
}
