"use client";

import { CameraIcon, ChevronDown, Palette, Save, Wand2 } from "lucide-react";
import { useCanvas } from "@/context/canvas-context";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import PromptInput from "../prompt-input";
import { useEffect, useState } from "react";
import { parseThemeColors } from "@/lib/themes";
import ThemeSelector from "./theme-selector";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import {
  useGenerateDesignById,
  useUpdateProject,
} from "@/features/use-project-id";
import { useUpdateFrame } from "@/features/use-frame";
import { Spinner } from "../ui/spinner";
import { toast } from "sonner";

const CanvasFloatingToolbar = ({
  projectId,
  isScreenshotting,
  onScreenshot,
}: {
  projectId: string;
  isScreenshotting: boolean;
  onScreenshot: () => void;
}) => {
  const {
    themes,
    theme: currentTheme,
    setTheme,
    plan,
    frames,
    updateFrame: updateFrameState,
    loadingStatus,
    themeDirty,
    markThemeSaved,
  } = useCanvas();
  const canExport = plan === "PRO";
  const [promptText, setPromptText] = useState<string>("");
  const [isSavingFrames, setIsSavingFrames] = useState(false);

  const { mutate, isPending } = useGenerateDesignById(projectId);

  const update = useUpdateProject(projectId);
  const updateFrameMutation = useUpdateFrame(projectId);

  const isGenerating =
    Boolean(loadingStatus) &&
    loadingStatus !== "idle" &&
    loadingStatus !== "completed";

  const handleAIGenerate = () => {
    if (!promptText || isGenerating) return;
    mutate(promptText);
  };

  const hasDirtyFrames = frames.some((frame) => frame.isDirty);
  const hasUnsavedChanges = hasDirtyFrames || themeDirty;

  const handleUpdate = async () => {
    if (!hasUnsavedChanges) return;
    if (isSavingFrames) return;
    setIsSavingFrames(true);
    try {
      const dirtyFrames = frames.filter((frame) => frame.isDirty);
      if (dirtyFrames.length > 0) {
        await Promise.all(
          dirtyFrames.map((frame) =>
            updateFrameMutation.mutateAsync({
              frameId: frame.id,
              htmlContent: frame.htmlContent,
            })
          )
        );
        dirtyFrames.forEach((frame) =>
          updateFrameState(frame.id, { isDirty: false })
        );
      }
      if (currentTheme && themeDirty) {
        await update.mutateAsync(currentTheme.id);
        markThemeSaved();
      }
      toast.success("Project saved");
    } catch (error) {
      console.log(error);
      toast.error("Failed to save changes");
    } finally {
      setIsSavingFrames(false);
    }
  };
  const isSaving = isSavingFrames || update.isPending;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s"
      ) {
        event.preventDefault();
        if (hasUnsavedChanges) {
          handleUpdate();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges, handleUpdate]);

  return (
    <div
      className="
   fixed top-6 left-1/2 -translate-x-1/2 z-50
  "
    >
      <div
        className="w-full max-w-2xl bg-background
     dark:bg-gray-950 rounded-full shadow-xl border
    "
      >
        <div className="flex flex-row items-center gap-2 px-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon-sm"
                className="px-4  bg-linear-to-r
                 from-purple-500 to-indigo-600
                  text-white rounded-2xl
                  shadow-lg shadow-purple-200/50 cursor-pointer"
              >
                <Wand2 className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-2!
             rounded-xl! shadow-lg border mt-1
            "
            >
              <PromptInput
                promptText={promptText}
                setPromptText={setPromptText}
                className="min-h-[150px] ring-1! ring-purple-500!
                rounded-xl! shadow-none border-muted
                "
                hideSubmitBtn={true}
                isLoading={isPending || isGenerating}
              />
              <Button
                disabled={isPending || isGenerating || !promptText.trim()}
                className="mt-2 w-full
                  bg-linear-to-r
                 from-purple-500 to-indigo-600
                  text-white rounded-2xl
                  shadow-lg shadow-purple-200/50 cursor-pointer
                "
                onClick={handleAIGenerate}
              >
                {isPending || isGenerating ? <Spinner /> : <>Design</>}
              </Button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger>
              <div className="flex items-center gap-2 px-3 py-2">
                <Palette className="size-4" />
                <div className="flex gap-1.5">
                  {themes?.slice(0, 4)?.map((theme, index) => {
                    const color = parseThemeColors(theme.style);
                    return (
                      <div
                        role="button"
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTheme(theme.id);
                        }}
                        className={cn(
                          `w-6.5 h-6.5 rounded-full cursor-pointer
                           `,
                          currentTheme?.id === theme.id &&
                            "ring-1 ring-offset-1"
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${color.primary}, ${color.accent})`,
                        }}
                      />
                    );
                  })}
                </div>
                <div
                  className="flex items-center gap-1 text-sm
                "
                >
                  +{Math.max((themes?.length ?? 0) - 4, 0)} more
                  <ChevronDown className="size-4" />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="px-0 rounded-xl
            shadow border
            "
            >
              <ThemeSelector />
            </PopoverContent>
          </Popover>

          {/* Divider */}
          <Separator orientation="vertical" className="h-4!" />

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:flex">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isSaving
                    ? "bg-amber-500"
                    : hasUnsavedChanges
                    ? "bg-rose-500"
                    : "bg-emerald-500"
                )}
              />
              {isSaving
                ? "Saving..."
                : hasUnsavedChanges
                ? "Unsaved changes"
                : "All changes saved"}
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-full cursor-pointer"
              disabled={isScreenshotting || !canExport}
              onClick={onScreenshot}
            >
              {isScreenshotting ? (
                <Spinner />
              ) : (
                <CameraIcon className="size-4.5" />
              )}
            </Button>
            {hasUnsavedChanges ? (
            <Button
              variant="default"
              size="sm"
              className="rounded-full cursor-pointer"
              onClick={handleUpdate}
              disabled={isSaving}
            >
              {isSaving ? (
                <Spinner />
              ) : (
                <>
                  <Save className="size-4" />
                  Save
                  </>
                )}
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">
                All changes saved
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasFloatingToolbar;
