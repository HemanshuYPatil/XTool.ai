import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Logo from "@/components/logo";
import { getHTMLWrapper } from "@/lib/frame-wrapper";
import { THEME_LIST } from "@/lib/themes";
import ContributionPanel from "@/components/share/contribution-panel";
import { ArrowLeftIcon } from "lucide-react";

const SharePage = async ({
  params,
}: {
  params: Promise<{ token: string }>;
}) => {
  const { token } = await params;
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      project: {
        include: {
          user: true,
          frames: true,
        },
      },
      frame: true,
    },
  });

  if (!shareLink || !shareLink.project) {
    return notFound();
  }

  if (shareLink.project.deletedAt) {
    return notFound();
  }

  const session = await getKindeServerSession();
  const user = await session.getUser();
  const isAuthenticated = Boolean(user);
  const isOwner = user?.id === shareLink.project.userId;
  const authorLabel =
    shareLink.project.user?.name ||
    shareLink.project.user?.email ||
    "XTool.ai creator";

  const themeStyle =
    THEME_LIST.find((theme) => theme.id === shareLink.project.theme)?.style ??
    undefined;
  const frames = shareLink.frame
    ? [shareLink.frame]
    : shareLink.project.frames;
  const canEdit = shareLink.permission === "EDIT" && isAuthenticated;

  return (
    <div className="min-h-screen w-full bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground shadow-sm transition hover:bg-muted/60"
            >
              <ArrowLeftIcon className="size-4" />
              Back to XTool.ai
            </Link>
            {isAuthenticated && isOwner ? (
              <Link
                href={`/project/${shareLink.projectId}`}
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
            Shared Project
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {shareLink.project.name}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>By {authorLabel}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
            <span>
              Access:{" "}
              {shareLink.permission === "EDIT" ? "Editable" : "Read-only"}
            </span>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-border/60 bg-muted/20 p-6">
          <p className="text-sm font-semibold">Sharing rules</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {shareLink.permission === "EDIT"
              ? "Editable access is enabled for this link. Sign in to open the editor if you have access."
              : "This link is read-only. You can view the project screens, but editing is disabled."}
          </p>
          {!isAuthenticated ? (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Want to edit or save changes?
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

        {canEdit ? (
          <div className="mt-8">
            <ContributionPanel
              shareToken={shareLink.token}
              frames={frames.map((frame) => ({
                id: frame.id,
                title: frame.title,
              }))}
            />
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {frames.map((frame) => (
            <div
              key={frame.id}
              className="rounded-3xl border bg-card/70 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between px-2 pb-3">
                <p className="text-sm font-semibold">{frame.title}</p>
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {shareLink.frame ? "Frame share" : "Project share"}
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

export default SharePage;
