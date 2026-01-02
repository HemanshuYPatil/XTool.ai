import { docsContent } from "@/lib/docs-content";
import { DocsRenderer } from "@/components/docs/docs-renderer";

export default function BillingCreditsPage() {
  const content = docsContent["billing-credits"];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DocsRenderer content={content.content} />
    </div>
  );
}
