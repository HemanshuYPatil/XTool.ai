"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, SparklesIcon } from "lucide-react";

type ModuleItem = {
  name: string;
  description: string;
  status: "Active" | "Beta" | "Coming soon";
  href?: string;
};

const ModulesBrowser = ({
  modules,
  isDeveloper,
}: {
  modules: ModuleItem[];
  isDeveloper?: boolean;
}) => {
  const [query, setQuery] = useState("");
  const filteredModules = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return modules;
    return modules.filter((module) => {
      return (
        module.name.toLowerCase().includes(normalized) ||
        module.description.toLowerCase().includes(normalized)
      );
    });
  }, [modules, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Product catalog
          </p>
          <p className="text-sm text-muted-foreground">
            Discover every AI capability available in your workspace.
          </p>
        </div>
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tools"
            className="pl-9 rounded-full"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {isDeveloper ? (
          <Button className="rounded-full" disabled>
            <SparklesIcon className="size-4" />
            New tool
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredModules.map((module) => (
          <div
            key={module.name}
            className="rounded-3xl border bg-card/70 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{module.name}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {module.description}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  module.status === "Active"
                    ? "bg-emerald-100 text-emerald-700"
                    : module.status === "Beta"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {module.status}
              </span>
            </div>
            {module.href ? (
              <Link
                href={module.href}
                className="mt-6 inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-foreground transition hover:bg-muted/60"
              >
                Open tool
              </Link>
            ) : (
              <button
                type="button"
                className="mt-6 inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                disabled
              >
                Coming soon
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulesBrowser;
