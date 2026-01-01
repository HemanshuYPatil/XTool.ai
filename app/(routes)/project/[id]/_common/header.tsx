"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  MoonIcon,
  MoreHorizontalIcon,
  SunIcon,
  XIcon,
  Code2Icon,
  SmartphoneIcon,
  GlobeIcon,
  LayersIcon,
  UsersIcon,
  MessageSquareIcon,
  HistoryIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
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
import { CreditDisplay } from "@/components/credits/credit-display";
import { buildExportFile, ExportTarget } from "@/lib/export";

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
  const [exportTarget, setExportTarget] = useState<ExportTarget>("react");
  const [isExporting, setIsExporting] = useState(false);
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
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      toast.error("Unable to copy share link.");
    } finally {
      setIsCopying(false);
    }
  };

  const handleExport = async () => {
    if (!projectId) return;
    setIsExporting(true);
    try {
      const response = await fetch(`/api/project/${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project for export.");
      }
      const data = await response.json();
      const frames = (data?.frames ?? []).map((frame: any) => ({
        title: frame.title ?? "Untitled",
        htmlContent: frame.htmlContent ?? "",
      }));
      const exportFile = buildExportFile({
        projectName: data?.name ?? projectTitle,
        frames,
        themeStyle,
        target: exportTarget,
      });

      const blob = new Blob([exportFile.content], { type: exportFile.mime });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = exportFile.filename;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export ready.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to export project.");
    } finally {
      setIsExporting(false);
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
      console.error(error);
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
      console.error(error);
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
        className={cn(
          "relative border-b border-border/40 bg-card/50 backdrop-blur-sm"
        )}
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
            <p className="max-w-50 truncate font-medium">
              {projectTitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CreditDisplay />
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
            "absolute right-0 top-0 h-full w-full max-w-md border-l border-border/60 bg-background shadow-2xl transition-transform duration-300 ease-in-out",
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-5 bg-muted/10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/70">
                Project Management
              </p>
              <h2 className="text-xl font-bold tracking-tight">Project Settings</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-muted transition-colors"
              onClick={() => setIsDrawerOpen(false)}
            >
              <XIcon className="size-5" />
            </Button>
          </div>

          <div className="flex flex-col h-[calc(100%-85px)]">
            <div className="px-6 py-4 border-b border-border/40 bg-muted/5">
              <div className="flex p-1 bg-muted/50 rounded-lg gap-1">
                {[
                  { id: "publish", label: "Publish", icon: GlobeIcon },
                  { id: "export", label: "Export", icon: Code2Icon },
                  { id: "engagement", label: "Engagement", icon: UsersIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerSection(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                      drawerSection === tab.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <tab.icon className="size-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {drawerSection === "publish" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold">Project Visibility</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Control who can see and access your project.
                        </p>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        isPublic 
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                          : "bg-muted text-muted-foreground border border-border/50"
                      )}>
                        {isUpdatingVisibility ? (
                          <Spinner className="size-3" />
                        ) : (
                          <div className={cn("size-1.5 rounded-full", isPublic ? "bg-emerald-500" : "bg-muted-foreground")} />
                        )}
                        {visibilityLabel}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={currentVisibility === "PRIVATE" ? "default" : "outline"}
                        className={cn(
                          "h-20 flex-col gap-2 rounded-xl border-2 transition-all",
                          currentVisibility === "PRIVATE" ? "border-primary bg-primary/5 hover:bg-primary/10 text-primary" : "border-border/50 hover:border-border"
                        )}
                        disabled={isUpdatingVisibility}
                        onClick={() => handleVisibilityChange("PRIVATE")}
                      >
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                          <MoonIcon className="size-4" />
                        </div>
                        <span className="text-xs font-bold">Private</span>
                      </Button>
                      <Button
                        variant={currentVisibility === "PUBLIC" ? "default" : "outline"}
                        className={cn(
                          "h-20 flex-col gap-2 rounded-xl border-2 transition-all",
                          currentVisibility === "PUBLIC" ? "border-primary bg-primary/5 hover:bg-primary/10 text-primary" : "border-border/50 hover:border-border"
                        )}
                        disabled={isUpdatingVisibility}
                        onClick={() => handleVisibilityChange("PUBLIC")}
                      >
                        <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                          <GlobeIcon className="size-4" />
                        </div>
                        <span className="text-xs font-bold">Public</span>
                      </Button>
                    </div>
                  </section>

                  <section className="space-y-4 pt-4 border-t border-border/40">
                    <div>
                      <h3 className="text-sm font-bold">Collaboration Link</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Share this link with others to collaborate.
                      </p>
                    </div>

                    <div className="space-y-3 p-4 rounded-2xl border border-border/60 bg-muted/10">
                      <div className="flex items-center gap-2 p-1 bg-background rounded-lg border border-border/40">
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "flex-1 h-8 text-[11px] font-bold rounded-md transition-all",
                            sharePermission === "READ_ONLY" ? "bg-muted text-foreground" : "text-muted-foreground"
                          )}
                          onClick={() => setSharePermission("READ_ONLY")}
                          disabled={Boolean(shareLink)}
                        >
                          Read-only
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={cn(
                            "flex-1 h-8 text-[11px] font-bold rounded-md transition-all",
                            sharePermission === "EDIT" ? "bg-muted text-foreground" : "text-muted-foreground"
                          )}
                          onClick={() => setSharePermission("EDIT")}
                          disabled={Boolean(shareLink)}
                        >
                          Editable
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            readOnly
                            value={shareLink ?? ""}
                            placeholder="Generate a link..."
                            className="h-10 pr-10 text-xs bg-background border-border/40 rounded-xl"
                          />
                          {shareLink && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                            </div>
                          )}
                        </div>
                        {!shareLink ? (
                          <Button
                            size="sm"
                            className="h-10 px-4 rounded-xl font-bold"
                            onClick={handleCreateShareLink}
                            disabled={!projectId || isSharing}
                          >
                            {isSharing ? <Spinner className="size-3.5" /> : "Generate"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-10 px-4 rounded-xl font-bold border-border/60 hover:bg-muted"
                            onClick={handleCopyShareLink}
                            disabled={isCopying}
                          >
                            {isCopying ? <Spinner className="size-3.5" /> : "Copy"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="p-4 rounded-2xl border border-border/60 bg-muted/5 hover:bg-muted/10 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-background border border-border/40 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                          <HistoryIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold">Release Notes</h4>
                          <p className="text-[11px] text-muted-foreground">Manage project updates</p>
                        </div>
                      </div>
                      <div className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Soon
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {drawerSection === "export" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold">Export</h3>
                    <p className="text-xs text-muted-foreground">
                      Download a ZIP with a full project scaffold and one file per screen.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "html", label: "HTML", icon: GlobeIcon },
                      { id: "react", label: "React", icon: Code2Icon },
                      { id: "react-native", label: "Native", icon: SmartphoneIcon },
                      { id: "flutter", label: "Flutter", icon: SmartphoneIcon },
                      { id: "nextjs", label: "Next.js", icon: Code2Icon },
                      { id: "svelte", label: "Svelte", icon: LayersIcon },
                      { id: "vue", label: "Vue", icon: LayersIcon },
                      { id: "astro", label: "Astro", icon: LayersIcon },
                      { id: "solid", label: "Solid", icon: LayersIcon },
                    ].map((item) => {
                      const selected = exportTarget === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setExportTarget(item.id as ExportTarget)}
                          className={cn(
                            "flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all group relative",
                            selected
                              ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                              : "border-border/50 bg-card/50 hover:border-primary/30 hover:bg-muted/50"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-xl transition-colors",
                            selected ? "bg-primary/10" : "bg-muted/50 group-hover:bg-primary/5"
                          )}>
                            <item.icon className={cn("size-5", selected ? "text-primary" : "text-muted-foreground group-hover:text-primary/70")} />
                          </div>
                          <span className="text-[11px] font-bold tracking-tight">
                            {item.label}
                          </span>
                          {selected && (
                            <div className="absolute top-2 right-2">
                              <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-muted/5 p-4">
                    <div>
                      <h4 className="text-sm font-bold">Download export</h4>
                      <p className="text-[11px] text-muted-foreground">
                        Includes folder structure and separate files per screen.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="h-10 rounded-xl font-bold"
                      onClick={handleExport}
                      disabled={!projectId || isExporting}
                    >
                      {isExporting ? <Spinner className="size-3.5" /> : "Download ZIP"}
                    </Button>
                  </div>
                </div>
              )}

              {drawerSection === "engagement" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold">Engagement Tools</h3>
                    <p className="text-xs text-muted-foreground">
                      Collaborate with your team and gather feedback.
                    </p>
                  </div>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
                        Contribution Queue
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[10px] font-bold hover:bg-muted"
                        onClick={fetchContributions}
                        disabled={isLoadingContributions}
                      >
                        {isLoadingContributions ? <Spinner className="size-3 mr-1.5" /> : <HistoryIcon className="size-3 mr-1.5" />}
                        Refresh
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {isLoadingContributions ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-3 border border-border/40 rounded-2xl bg-muted/5">
                          <Spinner className="size-5 text-primary/40" />
                          <p className="text-xs text-muted-foreground font-medium">Checking for updates...</p>
                        </div>
                      ) : contributions.length ? (
                        contributions.map((item) => (
                          <div
                            key={item.id}
                            className="group p-4 rounded-2xl border border-border/60 bg-background hover:border-primary/30 transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                  {item.author?.name?.charAt(0) || item.author?.email?.charAt(0) || "U"}
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold leading-none mb-1">{item.title}</h5>
                                  <p className="text-[11px] text-muted-foreground">
                                    by {item.author?.name || item.author?.email || "External"}
                                  </p>
                                </div>
                              </div>
                              <div className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[9px] font-bold uppercase tracking-wider border border-amber-500/20">
                                Pending
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-8 text-[11px] font-bold rounded-lg border-border/40 hover:bg-muted"
                                onClick={() => handleOpenContribution(item)}
                              >
                                View Diff
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 h-8 text-[11px] font-bold rounded-lg"
                                onClick={() => handleOpenContribution(item)}
                              >
                                Review
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-10 flex flex-col items-center justify-center text-center border border-dashed border-border/80 rounded-2xl bg-muted/5">
                          <div className="size-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                            <MessageSquareIcon className="size-6 text-muted-foreground/30" />
                          </div>
                          <h5 className="text-sm font-bold text-muted-foreground">No contributions</h5>
                          <p className="text-[11px] text-muted-foreground/60 mt-1">
                            New proposals will appear here for review.
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="space-y-3 pt-4 border-t border-border/40">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-4">
                      Upcoming Features
                    </h4>
                    <div className="grid gap-3">
                      {[
                        { label: "Review Links", icon: ExternalLinkIcon },
                        { label: "Team Invites", icon: UsersIcon },
                        { label: "Feedback Mode", icon: MessageSquareIcon },
                        { label: "Version Snapshots", icon: HistoryIcon },
                      ].map((tool) => (
                        <div
                          key={tool.label}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/5 opacity-70"
                        >
                          <div className="flex items-center gap-3">
                            <tool.icon className="size-4 text-muted-foreground" />
                            <span className="text-xs font-bold">{tool.label}</span>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/50">
                            Soon
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
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
                        className="h-90 w-full"
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
                        className="h-90 w-full"
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
