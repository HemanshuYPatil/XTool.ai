import Link from "next/link";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import Header from "../_common/header";
import prisma from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ExplorePage = async () => {
  const session = await getKindeServerSession();
  const user = await session.getUser();
  const publicProjects = await prisma.project.findMany({
    where: {
      visibility: "PUBLIC",
      OR: [{ deletedAt: null }, { deletedAt: { isSet: false } }],
    },
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const publicCountByAuthor = publicProjects.reduce<Record<string, number>>(
    (acc, project) => {
      acc[project.userId] = (acc[project.userId] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen w-full bg-background">
      <Header initialUser={user ?? undefined} />

      <section className="pt-16 pb-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">
              Explore
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Discover public XTool.ai projects
            </h1>
            <p className="text-foreground/80 max-w-2xl">
              Browse what the community is publishing. Open any project in a
              read-only view, and sign in to save or edit your own versions.
            </p>
          </div>

          {!user ? (
            <div className="mt-8 rounded-2xl border border-border/60 bg-muted/20 px-6 py-4 text-sm text-muted-foreground">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Create or log in to an XTool.ai account to open projects in the
                  editor and publish your own work.
                </p>
                <Link
                  href="/api/auth/login"
                  className="inline-flex items-center justify-center rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wide text-background transition hover:opacity-90"
                >
                  Sign in
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publicProjects.map((project) => {
              const authorLabel =
                project.user?.name || project.user?.email || "XTool.ai creator";
              const authorInitials = authorLabel
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase();
              const authorCount = publicCountByAuthor[project.userId] ?? 0;
              return (
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
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <Avatar className="h-8 w-8">
                        <AvatarImage alt={authorLabel} />
                        <AvatarFallback>{authorInitials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {authorLabel}
                        </p>
                        <Link
                          href={`/explore/author/${project.userId}`}
                          className="text-xs font-medium text-foreground hover:text-primary"
                        >
                          {authorCount} public project
                          {authorCount === 1 ? "" : "s"}
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition group-hover:bg-muted/40">
                    View project
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExplorePage;
