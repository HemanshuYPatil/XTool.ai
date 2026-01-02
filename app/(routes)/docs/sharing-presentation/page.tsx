import { docsContent } from "@/lib/docs-content";
import { DocsRenderer } from "@/components/docs/docs-renderer";

export default function SharingPresentationPage() {
  const content = docsContent["sharing-presentation"];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DocsRenderer content={content.content} />
    </div>
  );
}
