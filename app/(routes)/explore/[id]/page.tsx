import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Logo from "@/components/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeftIcon } from "lucide-react";
import { getHTMLWrapper } from "@/lib/frame-wrapper";
import { THEME_LIST } from "@/lib/themes";

const ExploreProjectPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: {
      id,
      visibility: "PUBLIC",
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    },
    include: {
      user: true,
      frames: true,
    },
  });

  if (!project) {
    return notFound();
  }

  const session = await getKindeServerSession();
  const user = await session.getUser();
  const isAuthenticated = Boolean(user);
  const isOwner = user?.id === project.userId;
  const authorLabel =
    project.user?.name || project.user?.email || "XTool.ai creator";
  const authorInitials = authorLabel
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const themeStyle =
    THEME_LIST.find((theme) => theme.id === project.theme)?.style ?? undefined;

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm transition hover:bg-muted/60"
            >
              <ArrowLeftIcon className="size-4" />
              Back to Explore
            </Link>
            {isAuthenticated && isOwner ? (
              <Link
                href={`/project/${project.id}`}
                className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide text-background transition hover:opacity-90"
              >
                Open editor
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">
            Public Project
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{authorInitials}</AvatarFallback>
              </Avatar>
              <Link
                href={`/explore/author/${project.userId}`}
                className="text-sm font-medium text-foreground hover:text-primary"
              >
                {authorLabel}
              </Link>
            </div>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            <span>Read-only preview</span>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border/60 bg-muted/20 p-6">
          <p className="text-sm font-semibold">Viewing rules</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This public project is viewable by anyone. Sign in to XTool.ai to
            save your own copy or publish a project of your own.
          </p>
          {!isAuthenticated ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Want full access?
              </span>
              <Link
                href="/api/auth/login"
                className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide text-background transition hover:opacity-90"
              >
                Sign in to XTool.ai
              </Link>
            </div>
          ) : null}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {project.frames.map((frame) => (
            <div
              key={frame.id}
              className="rounded-3xl border bg-card/70 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between px-2 pb-3">
                <p className="text-sm font-semibold">{frame.title}</p>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  Public
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl border bg-background">
                <iframe
                  title={frame.title}
                  srcDoc={getHTMLWrapper(
                    frame.htmlContent,
                    frame.title,
                    themeStyle,
                    frame.id
                  )}
                  sandbox="allow-scripts allow-same-origin"
                  className="h-[520px] w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExploreProjectPage;
