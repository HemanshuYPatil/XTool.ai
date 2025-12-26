import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Logo from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeftIcon } from "lucide-react";

const AuthorProfilePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const author = await prisma.user.findUnique({
    where: { kindeId: id },
  });

  if (!author) {
    return notFound();
  }

  const publicProjects = await prisma.project.findMany({
    where: {
      userId: id,
      visibility: "PUBLIC",
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    },
    orderBy: { createdAt: "desc" },
  });

  const authorLabel = author.name || author.email || "XTool.ai creator";
  const initials = authorLabel
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm transition hover:bg-muted/60"
          >
            <ArrowLeftIcon className="size-4" />
            Back to Explore
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div className="rounded-3xl border border-border/60 bg-muted/20 p-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">
                Author profile
              </p>
              <h1 className="text-2xl font-semibold">{authorLabel}</h1>
              <p className="text-sm text-muted-foreground">
                {publicProjects.length} public project
                {publicProjects.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publicProjects.map((project) => (
            <Link
              key={project.id}
              href={`/explore/${project.id}`}
              className="group rounded-3xl border bg-card/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="rounded-2xl border bg-muted/30 overflow-hidden">
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={`${project.name} preview`}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    No preview yet
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-1">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Public project
                </p>
              </div>
              <div className="mt-4 inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition group-hover:bg-muted/40">
                View project
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AuthorProfilePage;
