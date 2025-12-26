"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  MoonIcon,
  MoreHorizontalIcon,
  SunIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getHTMLWrapper } from "@/lib/frame-wrapper";
import { THEME_LIST } from "@/lib/themes";

const Header = ({
  projectName,
  projectId,
  visibility = "PRIVATE",
  themeId,
}: {
  projectName?: string;
  projectId?: string;
  visibility?: "PRIVATE" | "PUBLIC";
  themeId?: string | null;
}) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState<
    "publish" | "export" | "engagement"
  >("publish");
  const [currentVisibility, setCurrentVisibility] = useState<
    "PRIVATE" | "PUBLIC"
  >(visibility);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);
  const [sharePermission, setSharePermission] = useState<
    "READ_ONLY" | "EDIT"
  >("READ_ONLY");
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [contributions, setContributions] = useState<any[]>([]);
  const [isLoadingContributions, setIsLoadingContributions] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<any | null>(
    null
  );
  const [acceptMode, setAcceptMode] = useState<"overwrite" | "new" | null>(
    null
  );
  const [isProcessingContribution, setIsProcessingContribution] =
    useState(false);

  const isPublic = currentVisibility === "PUBLIC";
  const openDrawer = (section: "publish" | "export" | "engagement") => {
    setDrawerSection(section);
    setIsDrawerOpen(true);
  };
  const projectTitle = projectName || "Untitled Project";
  const themeStyle = useMemo(
    () =>
      THEME_LIST.find((theme) => theme.id === themeId)?.style ?? undefined,
    [themeId]
  );

  useEffect(() => {
    setCurrentVisibility(visibility);
  }, [visibility]);

  const visibilityLabel = useMemo(
    () => (currentVisibility === "PUBLIC" ? "Public" : "Private"),
    [currentVisibility]
  );

  const handleVisibilityChange = async (nextVisibility: "PRIVATE" | "PUBLIC") => {
    if (!projectId || nextVisibility === currentVisibility) return;
    setIsUpdatingVisibility(true);
    setCurrentVisibility(nextVisibility);
    try {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: nextVisibility }),
      });
      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }
      toast.success(
        `Project is now ${nextVisibility === "PUBLIC" ? "public" : "private"}.`
      );
    } catch (error) {
      console.log(error);
      setCurrentVisibility(visibility);
      toast.error("Unable to update visibility.");
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleCreateShareLink = async () => {
    if (!projectId) return;
    if (shareLink) return;
    setIsSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          permission: sharePermission,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create share link");
      }
      const data = await response.json();
      setShareLink(data.url);
      await navigator.clipboard.writeText(data.url);
      toast.success("Share link copied to clipboard.");
    } catch (error) {
      console.log(error);
      toast.error("Unable to generate share link.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied to clipboard.");
    } catch (error) {
      console.log(error);
      toast.error("Unable to copy share link.");
    } finally {
      setIsCopying(false);
    }
  };

  const fetchContributions = async () => {
    if (!projectId) return;
    setIsLoadingContributions(true);
    try {
      const response = await fetch(`/api/contribution?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch contributions.");
      }
      const data = await response.json();
      setContributions(data?.data ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingContributions(false);
    }
  };

  const handleOpenContribution = async (contribution: any) => {
    setSelectedContribution(contribution);
    setAcceptMode(null);
  };

  const handleContributionDecision = async (action: "accept" | "decline") => {
    if (!selectedContribution) return;
    if (action === "accept" && !acceptMode) return;
    setIsProcessingContribution(true);
    try {
      const response = await fetch(
        `/api/contribution/${selectedContribution.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            mode: acceptMode,
          }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to process contribution.");
      }
      toast.success(
        action === "accept"
          ? "Contribution applied."
          : "Contribution declined."
      );
      setSelectedContribution(null);
      setAcceptMode(null);
      await fetchContributions();
    } catch (error) {
      console.log(error);
      toast.error(
        (error as Error)?.message ?? "Unable to process contribution."
      );
    } finally {
      setIsProcessingContribution(false);
    }
  };

  return (
    <div className="sticky top-0 z-30">
      <header
        className="border-b border-border/40
    bg-card/50 backdrop-blur-sm
    "
      >
        <div
          className="flex items-center justify-between px-4
          py-2
        "
        >
          <div className="flex items-center gap-4">
          
            <Button
              size="icon-sm"
              variant="ghost"
              className="rounded-full bg-muted!"
              onClick={() => router.push("/xdesign")}
            >
              <ArrowLeftIcon className="size-4" />
            </Button>
            <p className="max-w-[200px] truncate font-medium">
              {projectTitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full h-8 w-8"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              <SunIcon
                className={cn(
                  "absolute h-5 w-5 transition",
                  isDark ? "scale-100" : "scale-0"
                )}
              />
              <MoonIcon
                className={cn(
                  "absolute h-5 w-5 transition",
                  isDark ? "scale-0" : "scale-100"
                )}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                >
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => openDrawer("publish")}
                  className="cursor-pointer"
                >
                  Publish settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDrawer("export")}
                  className="cursor-pointer"
                >
                  Export UI
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => openDrawer("engagement")}
                  className="cursor-pointer"
                >
                  Engagement tools
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>Share link (Coming soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Duplicate project (Coming soon)</DropdownMenuItem>
                <DropdownMenuItem disabled>Archive project (Coming soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-50 transition",
          isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            isDrawerOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsDrawerOpen(false)}
        />
        <aside
          className={cn(
            "absolute right-0 top-0 h-full w-full max-w-md border-l border-border/60 bg-background shadow-xl transition-transform",
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Project panel
              </p>
              <h2 className="text-lg font-semibold">Publishing & export</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setIsDrawerOpen(false)}
            >
              <XIcon className="size-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6 text-sm">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={drawerSection === "publish" ? "default" : "outline"}
                onClick={() => setDrawerSection("publish")}
              >
                Publish
              </Button>
              <Button
                size="sm"
                variant={drawerSection === "export" ? "default" : "outline"}
                onClick={() => setDrawerSection("export")}
              >
                Export
              </Button>
              <Button
                size="sm"
                variant={drawerSection === "engagement" ? "default" : "outline"}
                onClick={() => setDrawerSection("engagement")}
              >
                Engagement
              </Button>
            </div>

            {drawerSection === "publish" ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Visibility</p>
                    <p className="text-xs text-muted-foreground">
                      Private by default. Switch to public when you are ready to
                      share globally.
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                      isPublic
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isUpdatingVisibility ? (
                      <span className="inline-flex items-center gap-2">
                        <Spinner className="size-3.5" />
                        Updating
                      </span>
                    ) : (
                      visibilityLabel
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={currentVisibility === "PRIVATE" ? "default" : "outline"}
                    disabled={isUpdatingVisibility}
                    onClick={() => handleVisibilityChange("PRIVATE")}
                  >
                    Keep private
                  </Button>
                  <Button
                    size="sm"
                    variant={currentVisibility === "PUBLIC" ? "default" : "outline"}
                    disabled={isUpdatingVisibility}
                    onClick={() => handleVisibilityChange("PUBLIC")}
                  >
                    Publish globally
                  </Button>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
                  {isPublic
                    ? "Public projects appear in the community gallery and can be viewed by anyone with the link."
                    : "Private projects stay visible to you and your workspace only."}
                </div>

                <div className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Shareable link</p>
                      <p className="text-xs text-muted-foreground">
                        Choose access level before generating a share link.
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {sharePermission === "EDIT" ? "Editable" : "Read-only"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={
                        sharePermission === "READ_ONLY" ? "default" : "outline"
                      }
                      onClick={() => setSharePermission("READ_ONLY")}
                      disabled={Boolean(shareLink)}
                    >
                      Read-only
                    </Button>
                    <Button
                      size="sm"
                      variant={sharePermission === "EDIT" ? "default" : "outline"}
                      onClick={() => setSharePermission("EDIT")}
                      disabled={Boolean(shareLink)}
                    >
                      Editable
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <Input
                      readOnly
                      value={shareLink ?? "Generate a share link to continue."}
                      className="rounded-xl text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateShareLink}
                      disabled={!projectId || isSharing || Boolean(shareLink)}
                    >
                      {isSharing ? (
                        <>
                          <Spinner className="size-3.5" />
                          Generating
                        </>
                      ) : (
                        "Generate link"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyShareLink}
                      disabled={!shareLink || isCopying}
                    >
                      {isCopying ? (
                        <>
                          <Spinner className="size-3.5" />
                          Copying
                        </>
                      ) : (
                        "Copy link"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-background p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Release notes</p>
                      <p className="text-xs text-muted-foreground">
                        Keep viewers in sync with what changed.
                      </p>
                    </div>
                    <ChevronRightIcon className="size-4 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Coming soon: publish updates and changelog history.
                  </p>
                </div>
              </div>
            ) : null}

            {drawerSection === "export" ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold">Export UI</p>
                  <p className="text-xs text-muted-foreground">
                    Export support is on the way. Choose a target format to get
                    notified first.
                  </p>
                </div>

                <div className="grid gap-3">
                  {[
                    "HTML",
                    "React",
                    "Flutter",
                    "React Native",
                  ].map((label) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">
                          Coming soon
                        </p>
                      </div>
                      <Button size="sm" variant="outline" disabled>
                        Notify me
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {drawerSection === "engagement" ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold">Engagement tools</p>
                  <p className="text-xs text-muted-foreground">
                    Keep your team and stakeholders connected to the project.
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-background p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Contribution queue</p>
                      <p className="text-xs text-muted-foreground">
                        Review proposed edits before they apply to your project.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={fetchContributions}
                      disabled={isLoadingContributions}
                    >
                      {isLoadingContributions ? (
                        <>
                          <Spinner className="size-3.5" />
                          Refreshing
                        </>
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {isLoadingContributions ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Spinner className="size-3.5" />
                        Loading contributions...
                      </div>
                    ) : contributions.length ? (
                      contributions.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-border/60 bg-muted/20 px-3 py-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {item.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.author?.name ||
                                  item.author?.email ||
                                  "External contributor"}
                              </p>
                            </div>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground">
                              Pending
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenContribution(item)}
                            >
                              View diff
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOpenContribution(item)}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No pending contributions yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    "Shareable review link",
                    "Invite collaborators",
                    "Collect feedback",
                    "Version snapshots",
                  ].map((label) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3"
                    >
                      <p className="text-sm font-medium">{label}</p>
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">
                        Coming soon
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      <Dialog
        open={Boolean(selectedContribution)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedContribution(null);
            setAcceptMode(null);
          }
        }}
      >
      <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Review contribution</DialogTitle>
        </DialogHeader>
        {selectedContribution ? (
            <div className="space-y-4 overflow-y-auto pr-1 max-h-[65vh]">
              <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
                <p className="font-medium">{selectedContribution.title}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedContribution.author?.name ||
                    selectedContribution.author?.email ||
                    "External contributor"}
                </p>
                {selectedContribution.summary ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {selectedContribution.summary}
                  </p>
                ) : null}
              </div>
              {selectedContribution.frames?.map((frame: any) => (
                <div key={frame.id} className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Current
                    </p>
                    <div className="mt-3 overflow-hidden rounded-xl border">
                      <iframe
                        title={`Current ${frame.title}`}
                        srcDoc={getHTMLWrapper(
                          frame.frame?.htmlContent ?? "",
                          frame.title,
                          themeStyle,
                          frame.frameId ?? frame.id
                        )}
                        sandbox="allow-scripts allow-same-origin"
                        className="h-[360px] w-full"
                      />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Proposed
                    </p>
                    <div className="mt-3 overflow-hidden rounded-xl border">
                      <iframe
                        title={`Proposed ${frame.title}`}
                        srcDoc={getHTMLWrapper(
                          frame.htmlContent,
                          frame.title,
                          themeStyle,
                          frame.id
                        )}
                        sandbox="allow-scripts allow-same-origin"
                        className="h-[360px] w-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
                <p className="font-medium">Apply changes</p>
                <p className="text-xs text-muted-foreground">
                  Choose whether to overwrite existing frames or add the
                  contribution as new frames.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={acceptMode === "overwrite" ? "default" : "outline"}
                    onClick={() => setAcceptMode("overwrite")}
                    disabled={isProcessingContribution}
                  >
                    Overwrite existing
                  </Button>
                  <Button
                    size="sm"
                    variant={acceptMode === "new" ? "default" : "outline"}
                    onClick={() => setAcceptMode("new")}
                    disabled={isProcessingContribution}
                  >
                    Add as new frame
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSelectedContribution(null)}
              disabled={isProcessingContribution}
            >
              Close
            </Button>
            <Button
              variant="ghost"
              onClick={() => handleContributionDecision("decline")}
              disabled={isProcessingContribution}
            >
              {isProcessingContribution ? (
                <>
                  <Spinner className="size-3.5" />
                  Processing
                </>
              ) : (
                "Decline"
              )}
            </Button>
            <Button
              onClick={() => handleContributionDecision("accept")}
              disabled={!acceptMode || isProcessingContribution}
            >
              {isProcessingContribution ? (
                <>
                  <Spinner className="size-3.5" />
                  Processing
                </>
              ) : (
                "Accept changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Header;
