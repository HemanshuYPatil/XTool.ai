"use client";

import { cn } from "@/lib/utils";
import {
  DownloadIcon,
  GripVertical,
  MoreHorizontalIcon,
  Trash2Icon,
  Send,
  Wand2,
  Wand2Icon,
} from "lucide-react";
import { useState } from "react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { InputGroup, InputGroupAddon } from "../ui/input-group";
import { Input } from "../ui/input";
import { ButtonGroup } from "../ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { toast } from "sonner";

type PropsType = {
  title: string;
  frameId: string;
  projectId: string;
  isSelected?: boolean;
  disabled?: boolean;
  isDownloading: boolean;
  isExportDisabled?: boolean;
  scale?: number;
  isRegenerating?: boolean;
  isDeleting?: boolean;
  onOpenHtmlDialog: () => void;
  onDownloadPng?: () => void;
  onRegenerate?: (prompt: string) => void;
  onDeleteFrame?: () => void;
};
const DeviceFrameToolbar = ({
  title,
  frameId,
  projectId,
  isSelected,
  disabled,
  scale = 1.7,
  isDownloading,
  isExportDisabled = false,
  isRegenerating = false,
  isDeleting = false,
  onOpenHtmlDialog,
  onDownloadPng,
  onRegenerate,
  onDeleteFrame,
}: PropsType) => {
  void onOpenHtmlDialog;
  const [promptValue, setPromptValue] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleRegenerate = () => {
    if (promptValue.trim()) {
      onRegenerate?.(promptValue);
      setPromptValue("");
      setIsPopoverOpen(false);
    }
  };

  const handleShareFrame = async (permission: "READ_ONLY" | "EDIT") => {
    if (!projectId || !frameId) return;
    setIsSharing(true);
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          frameId,
          permission,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create share link");
      }
      const data = await response.json();
      await navigator.clipboard.writeText(data.url);
      toast.success("Frame share link copied.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to create frame link.");
    } finally {
      setIsSharing(false);
    }
  };
  return (
    <div
      className={cn(
        `absolute -mt-2 flex items-center justify-between gap-2 rounded-full z-50
        `,
        isSelected
          ? `left-1/2 -translate-x-1/2 border bg-card
            dark:bg-muted pl-2 py-1 shadown-sm
            min-w-[260px] h-[35px]
          `
          : "w-[150px h-auto] left-10 "
      )}
      style={{
        top: isSelected ? "-70px" : "-38px",
        transformOrigin: "center top",
        transform: `scale(${scale})`,
      }}
    >
      <div
        role="button"
        className="flex flex-1 cursor-grab items-center
        justify-start gap-1.5 active:cursor-grabbing h-full
        "
      >
        <GripVertical className="size-4 text-muted-foreground" />
        <div
          className={cn(
            `min-w-20 font-medium text-sm
           mx-px truncate mt-0.5
          `,
            isSelected && "w-[100px]"
          )}
        >
          {title}
        </div>
      </div>

      {isSelected && (
        <>
          <Separator orientation="vertical" className="h-5! bg-border" />
          <ButtonGroup className="gap-px! justify-end pr-2! h-full ">
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled}
                    size="icon-xs"
                    variant="ghost"
                    className="rounded-full!"
                    onClick={onOpenHtmlDialog}
                  >
                    <CodeIcon className="size-3.5! stroke-1.5! mt-px" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View HTML</TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    disabled={disabled || isDownloading || isExportDisabled}
                    size="icon-xs"
                    className="rounded-full!"
                    variant="ghost"
                    onClick={onDownloadPng}
                  >
                    {isDownloading ? (
                      <Spinner />
                    ) : (
                      <DownloadIcon className="size-3.5! stroke-1.5!" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PNG</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        disabled={disabled}
                        size="icon-xs"
                        className="rounded-full!"
                        variant="ghost"
                      >
                        {isRegenerating ? (
                          <Spinner className="size-3.5!" />
                        ) : (
                          <Wand2 className="size-3.5! stroke-1.5!" />
                        )}
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>AI Regenerate</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PopoverContent align="end" className="w-80 p-1! rounded-lg!">
                <div className="space-y-2">
                  <InputGroup className="bg-transparent! border-0! shadow-none! ring-0! px-0!">
                    <InputGroupAddon>
                      <Wand2Icon />
                    </InputGroupAddon>
                    <Input
                      placeholder="Edit with AI..."
                      value={promptValue}
                      onChange={(e) => setPromptValue(e.target.value)}
                      className="ring-0! border-0!  shadow-none! bg-transparent! "
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRegenerate();
                        }
                      }}
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        size="icon-sm"
                        disabled={!promptValue.trim() || isRegenerating}
                        onClick={handleRegenerate}
                      >
                        {isRegenerating ? (
                          <Spinner className="size-3.5!" />
                        ) : (
                          <Send className="size-4" />
                        )}
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="rounded-full!"
                      >
                        <MoreHorizontalIcon className=" mb-px size-3.5! stroke-1.5!" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenuContent align="end" className="w-32 rounded-md p-0!">
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger disabled={disabled || isSharing}>
                    <span className="flex items-center gap-2">
                      {isSharing ? <Spinner className="size-3.5" /> : null}
                      Share frame
                    </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-44">
                    <DropdownMenuItem
                      disabled={disabled || isSharing}
                      onClick={() => handleShareFrame("READ_ONLY")}
                    >
                      Read-only link
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={disabled || isSharing}
                      onClick={() => handleShareFrame("EDIT")}
                    >
                      Editable link
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  disabled={disabled || isDeleting}
                  onClick={onDeleteFrame}
                  className="cursor-pointer"
                >
                  {isDeleting ? (
                    <Spinner />
                  ) : (
                    <>
                      <Trash2Icon className="size-4" />
                      Delete
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </>
      )}
    </div>
  );
};

export default DeviceFrameToolbar;
