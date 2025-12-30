import { docsContent, DocSection } from "@/lib/docs-content";
import { DocsRenderer } from "@/components/docs/docs-renderer";
import { notFound } from "next/navigation";

export default async function DocSubPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const content = docsContent[section as DocSection];

  if (!content) {
    notFound();
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DocsRenderer content={content.content} />
    </div>
  );
}
