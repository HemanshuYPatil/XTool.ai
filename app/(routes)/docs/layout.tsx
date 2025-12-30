import DocsLayout from "@/components/docs/docs-layout";

export default async function DocsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DocsLayout>
      {children}
    </DocsLayout>
  );
}

