"use client";
import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import PromptInput from "@/components/prompt-input";
import Header from "./header";
import {
  useCreateProject,
  useDeleteProject,
  useGetProjects,
  useRenameProject,
} from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Spinner } from "@/components/ui/spinner";
import { ProjectType } from "@/types/project";
import { useRouter } from "next/navigation";
import {
  FolderOpenDotIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LandingSectionProps = {
  initialUser?: {
    id?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    picture?: string | null;
  };
  initialIsDeveloper?: boolean;
  initialCredits?: number | null;
  showHeader?: boolean;
  mode?: "page" | "module";
};

const PLACEHOLDER_PROJECT_NAME = "Q model";

const LandingSection = ({
  initialUser,
  initialIsDeveloper,
  initialCredits,
  showHeader = true,
  mode = "page",
}: LandingSectionProps) => {
  const { user } = useKindeBrowserClient();
  const [promptText, setPromptText] = useState<string>("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [renameProject, setRenameProject] = useState<ProjectType | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteProject, setDeleteProject] = useState<ProjectType | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [modelInfo, setModelInfo] = useState<{
    model?: string;
    provider?: string;
  } | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const projectsRef = useRef<HTMLDivElement | null>(null);
  const userId = user?.id ?? initialUser?.id ?? undefined;

  const { data: projects, isLoading, isError, refetch } =
    useGetProjects(userId);
  const { mutate, isPending } = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const renameProjectMutation = useRenameProject();
  const developer = Boolean(initialIsDeveloper);
  useEffect(() => {
    if (!projects?.length) {
      setSelectedProjects([]);
      return;
    }
    setSelectedProjects((prev) =>
      prev.filter((id) =>
        projects.some((project: ProjectType) => project.id === id)
      )
    );
  }, [projects]);

  useEffect(() => {
    if (!projects?.some((project: ProjectType) => project.name === PLACEHOLDER_PROJECT_NAME)) {
      return;
    }
    const timer = setTimeout(() => {
      refetch();
    }, 4000);
    return () => clearTimeout(timer);
  }, [projects, refetch]);

  useEffect(() => {
    if (!modelDialogOpen || modelInfo) return;
    fetch("/api/model")
      .then((res) => res.json())
      .then((data) => setModelInfo(data))
      .catch(() => setModelInfo({ model: "Unavailable", provider: "Unknown" }));
  }, [modelDialogOpen, modelInfo]);

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let active = true;
    (async () => {
      const { gsap } = await import("gsap");
      if (!active) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-hero]",
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
          }
        );
      }, heroRef);
    })();
    return () => {
      active = false;
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    if (!projectsRef.current || !projects?.length) return;
    let ctx: { revert: () => void } | undefined;
    let active = true;
    (async () => {
      const { gsap } = await import("gsap");
      if (!active) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          ".project-card",
          {
            opacity: 0,
            y: 14,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.05,
          }
        );
      }, projectsRef);
    })();
    return () => {
      active = false;
      ctx?.revert();
    };
  }, [projects?.length]);

  const suggestions = [
    {
      label: "Finance Tracker",
      icon: "💸",
      value: `Finance app statistics screen. Current balance at top with dollar amount, bar chart showing spending over months (Oct-Mar) with month selector pills below, transaction list with app icons, amounts, and categories. Bottom navigation bar. Mobile app, single screen. Style: Dark theme, chunky rounded cards, playful but professional, modern sans-serif typography, Gen Z fintech vibe. Fun and fresh, not corporate.`,
    },
    {
      label: "Fitness Activity",
      icon: "🔥",
      value: `Fitness tracker summary screen. Large central circular progress ring showing steps and calories with neon glow. Line graph showing heart rate over time. Bottom section with grid of health metrics (Sleep, Water, SpO2). Mobile app, single screen. Style: Deep Dark Mode (OLED friendly). Pitch black background with electric neon green and vibrant blue accents. High contrast, data-heavy but organized, sleek and sporty aesthetic.`,
    },
    {
      label: "Food Delivery",
      icon: "🍔",
      value: `Food delivery home feed. Top search bar with location pin. Horizontal scrolling hero carousel of daily deals. Vertical list of restaurants with large delicious food thumbnails, delivery time badges, and rating stars. Floating Action Button (FAB) for cart. Mobile app, single screen. Style: Vibrant and Appetizing. Warm colors (orange, red, yellow), rounded card corners, subtle drop shadows to create depth. Friendly and inviting UI.`,
    },
    {
      label: "Travel Booking",
      icon: "✈️",
      value: `Travel destination detail screen. Full-screen immersive photography of a tropical beach. Bottom sheet overlay with rounded top corners containing hotel title, star rating, price per night, and a large "Book Now" button. Horizontal scroll of amenity icons. Mobile app, single screen. Style: Minimalist Luxury. ample whitespace, elegant serif typography for headings, clean sans-serif for body text. Sophisticated, airy, high-end travel vibe.`,
    },
    {
      label: "E-Commerce",
      icon: "👟",
      value: `Sneaker product page. Large high-quality product image on a light gray background. Color selector swatches, size selector grid, and a sticky "Add to Cart" button at the bottom. Title and price in bold, oversized typography. Mobile app, single screen. Style: Neo-Brutalism. High contrast, thick black outlines on buttons and cards, hard shadows (no blur), unrefined geometry, bold solid colors (yellow and black). Trendy streetwear aesthetic.`,
    },
    {
      label: "Meditation",
      icon: "🧘",
      value: `Meditation player screen. Central focus is a soft, abstract breathing bubble animation. Play/Pause controls and a time slider below. Background is a soothing solid pastel sage green. Mobile app, single screen. Style: Soft Minimal. Rounded corners on everything, low contrast text for relaxation, pastel color palette, very little UI clutter. Zen, calming, and therapeutic atmosphere.`,
    },
  ];

  const handleSuggestionClick = (val: string) => {
    setPromptText(val);
  };

  const handleSubmit = () => {
    if (!promptText) return;
    mutate(promptText);
  };

  const toggleSelected = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const selectedProjectItems = useMemo(() => {
    if (!projects?.length) return [];
    return projects.filter((project: ProjectType) =>
      selectedProjects.includes(project.id)
    );
  }, [projects, selectedProjects]);

  const onConfirmDelete = async () => {
    if (!deleteProject) return;
    await deleteProjectMutation.mutateAsync(deleteProject.id);
    setDeleteProject(null);
  };

  const onConfirmBulkDelete = async () => {
    if (!selectedProjectItems.length) return;
    await Promise.all(
      selectedProjectItems.map((project: ProjectType) =>
        deleteProjectMutation.mutateAsync(project.id)
      )
    );
    setSelectedProjects([]);
    setBulkDeleteOpen(false);
  };

  const onConfirmRename = async () => {
    if (!renameProject) return;
    const nextName = renameValue.trim();
    if (!nextName || nextName === renameProject.name) {
      setRenameProject(null);
      return;
    }
    await renameProjectMutation.mutateAsync({
      projectId: renameProject.id,
      name: nextName,
    });
    setRenameProject(null);
  };

  const isModule = mode === "module";

  return (
    <div
      className={cn(
        "w-full",
        !isModule && "min-h-screen",
        isModule && "rounded-3xl border bg-card/70 shadow-sm"
      )}
    >
      <div className="flex flex-col">
        {showHeader || isModule ? (
          <Header
            initialUser={initialUser}
            initialCredits={initialCredits}
            isDeveloper={Boolean(initialIsDeveloper)}
          />
        ) : null}

        <div
          className={cn(
            "relative overflow-hidden",
            isModule ? "pt-12 pb-6" : "pt-28"
          )}
          ref={heroRef}
        >
          <div
            className="max-w-6xl mx-auto flex flex-col
         items-center justify-center gap-8
        "
          >
            <div className="space-y-3">
              <h1
                data-hero
                className="opacity-0 text-center font-semibold text-4xl
            tracking-tight sm:text-5xl
            "
              >
                Design mobile apps UI <br className="md:hidden" />
                <span className="text-primary">in minutes</span>
              </h1>
              <div className="mx-auto max-w-2xl " data-hero>
                <p className="opacity-0 text-center font-medium text-foreground leading-relaxed sm:text-lg">
                  Go from idea to beautiful app mockups in minutes by chatting
                  with AI.
                </p>
              </div>
            </div>

            <div
              data-hero
              className="opacity-0 flex w-full max-w-3xl flex-col
            item-center gap-8 relative z-50
            "
            >
              <div className="w-full">
                <PromptInput
                  className="ring-2 ring-primary"
                  promptText={promptText}
                  setPromptText={setPromptText}
                  isLoading={isPending}
                  onSubmit={handleSubmit}
                />
              </div>
              {developer && (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setModelDialogOpen(true)}
                  >
                    Model details
                  </Button>
                </div>
              )}

              <div
                className="flex flex-wrap justify-center gap-2 px-5"
                data-hero
              >
                <Suggestions>
                  {suggestions.map((s) => (
                    <Suggestion
                      key={s.label}
                      suggestion={s.label}
                      className="text-xs! h-7! px-2.5 pt-1!"
                      onClick={() => handleSuggestionClick(s.value)}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </Suggestion>
                  ))}
                </Suggestions>
              </div>
            </div>

            {!isModule && (
              <div
                className="absolute -translate-x-1/2
               left-1/2 w-1250 h-750 top-[80%]
               -z-10"
              >
                <div
                  className="-translate-x-1/2 absolute
                 bottom-[calc(100%-300px)] left-1/2
                 h-[2000px] w-[2000px]
                 opacity-20 bg-radial-primary"
                ></div>
                <div
                  className="absolute -mt-2.5
                size-full rounded-[50%]
                 bg-primary/20 opacity-70
                 [box-shadow:0_-15px_24.8px_var(--primary)]"
                ></div>
                <div
                  className="absolute z-0 size-full
                 rounded-[50%] bg-background"
                ></div>
              </div>
            )}
          </div>
        </div>

        <div
          className={cn(
            "w-full",
            isModule ? "px-6 pb-10" : "py-10",
            isModule && "border-t border-border/60"
          )}
          ref={projectsRef}
        >
          <div className="mx-auto max-w-3xl">
            {userId && (
              <div>
                <h1
                  className="font-medium text-xl
              tracking-tight mb-2
              "
                >
                  Recent Projects
                </h1>

                {isLoading ? (
                  <div
                    className="flex items-center
                  justify-center py-2
                  "
                  >
                    <Spinner className="size-10" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedProjectItems.length > 0 && (
                      <div className="rounded-xl border bg-background p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">
                              Selection
                            </p>
                            <p className="mt-1 text-sm">
                              {selectedProjectItems.length} selected
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setBulkDeleteOpen(true)}
                            >
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedProjects([])}
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {isPending && (
                        <ProjectCard
                          loading
                          project={{
                            id: "loading",
                            name: PLACEHOLDER_PROJECT_NAME,
                            createdAt: new Date().toISOString(),
                            theme: null,
                            frames: [],
                          } as ProjectType}
                        />
                      )}
                      {projects?.map((project: ProjectType) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          isSelected={selectedProjects.includes(project.id)}
                          onToggleSelect={() => toggleSelected(project.id)}
                          onRequestDelete={() => setDeleteProject(project)}
                          onRequestRename={() => {
                            setRenameValue(project.name);
                            setRenameProject(project);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isError && <p className="text-red-500">Failed to load projects</p>}
          </div>
        </div>
      </div>

      <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generation model</DialogTitle>
            <DialogDescription>
              The active model used for generating UI screens.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Provider</span>
              <span className="font-medium">
                {modelInfo?.provider ?? "OpenRouter"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">
                {modelInfo?.model ?? "Loading..."}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setModelDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(renameProject)}
        onOpenChange={(open) => {
          if (!open) {
            setRenameProject(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit project name</DialogTitle>
            <DialogDescription>
              Choose a new name for this project.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            placeholder="Project name"
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRenameProject(null)}>
              Cancel
            </Button>
            <Button
              onClick={onConfirmRename}
              disabled={renameProjectMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteProject)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteProject(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-medium">{deleteProject?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteProject(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              disabled={deleteProjectMutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete selected projects</DialogTitle>
            <DialogDescription>
              You are about to delete {selectedProjectItems.length} project
              {selectedProjectItems.length === 1 ? "" : "s"}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-48 space-y-2 overflow-y-auto text-sm">
            {selectedProjectItems.map((project: ProjectType) => (
              <div
                key={project.id}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <span className="font-medium">{project.name}</span>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(project.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setBulkDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmBulkDelete}
              disabled={
                deleteProjectMutation.isPending || !selectedProjectItems.length
              }
            >
              Delete selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProjectCard = memo(
  ({
    project,
    isSelected,
    onToggleSelect,
    onRequestDelete,
    onRequestRename,
    loading,
  }: {
    project: ProjectType;
    isSelected?: boolean;
    onToggleSelect?: () => void;
    onRequestDelete?: () => void;
    onRequestRename?: () => void;
    loading?: boolean;
  }) => {
    const router = useRouter();
    const createdAtDate = new Date(project.createdAt);
    const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
    const thumbnail = project.thumbnail || null;

    const onRoute = () => {
      if (loading) return;
      router.push(`/project/${project.id}`);
    };

    return (
      <div
        role="button"
        className={cn(
          "project-card w-full flex flex-col border rounded-xl overflow-hidden transition-all duration-300",
          loading ? "cursor-not-allowed opacity-70 scale-[0.98]" : "cursor-pointer hover:shadow-md"
        )}
        onClick={onRoute}
      >
        <div
          className={cn(
            "h-40 bg-muted relative overflow-hidden flex items-center justify-center",
            loading && "animate-pulse"
          )}
        >
          {!loading && (
            <>
              <button
                type="button"
                className="absolute left-2 top-2 z-10 rounded-full border bg-background/90 px-2 py-1 text-xs font-medium"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleSelect?.();
                }}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full border ${
                      isSelected ? "bg-primary border-primary" : "bg-transparent"
                    }`}
                  ></span>
                  {isSelected ? "Selected" : "Select"}
                </span>
              </button>
              <div className="absolute right-2 top-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRequestRename?.();
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        onRequestDelete?.();
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}

          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                <div className="relative h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Spinner className="size-6 text-primary" />
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                Queueing...
              </span>
            </div>
          ) : thumbnail ? (
            <img
              src={thumbnail}
              className="w-full h-full object-cover object-left
           scale-110
          "
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full bg-primary/20
              flex items-center justify-center text-primary
            "
            >
              <FolderOpenDotIcon />
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col">
          <h3
            className="font-semibold
         text-sm truncate w-full mb-1 line-clamp-1"
          >
            {project.name}
          </h3>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
      </div>
    );
  }
);

ProjectCard.displayName = "ProjectCard";

export default LandingSection;
