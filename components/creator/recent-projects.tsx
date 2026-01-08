"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { ArrowRight, FileIcon, LockIcon, GlobeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecentProject } from "@/lib/dashboard-stats";

const ClientRelativeTime = ({ value }: { value: Date | string }) => {
  const [text, setText] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(formatDistanceToNow(new Date(value), { addSuffix: true }));
  }, [value]);

  return <span suppressHydrationWarning>{text}</span>;
};

export const RecentProjects = ({ projects }: { projects: RecentProject[] }) => {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card/50 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileIcon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Start by generating a new module or creating a workspace to see your recent projects here.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/xtool/xdesign">Create Project</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/xtool/project/${project.id}`}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/50"
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileIcon className="h-5 w-5" />
              </div>
              <div className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide border ${
                  project.visibility === 'PUBLIC' 
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50' 
                    : 'bg-muted text-muted-foreground border-border/50'
                }`}>
                {project.visibility === 'PUBLIC' ? (
                    <div className="flex items-center gap-1"><GlobeIcon className="size-3" /> Public</div>
                ) : (
                    <div className="flex items-center gap-1"><LockIcon className="size-3" /> Private</div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {project.theme ? `Theme: ${project.theme}` : "Default Theme"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
            <span className="text-[10px] text-muted-foreground">
              <ClientRelativeTime value={project.updatedAt} />
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </Link>
      ))}
    </div>
  );
};
