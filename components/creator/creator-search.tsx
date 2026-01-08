"use client";

import { Fragment, useEffect, useState } from "react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { showXCreator } from "@/lib/feature-flags";
import {
  CreditCardIcon,
  LayoutGridIcon,
  SettingsIcon,
  SparklesIcon,
  UserIcon,
  Wand2Icon,
  ClapperboardIcon,
  ImageIcon,
  VideoIcon,
  CalendarClockIcon,
  BellIcon,
  SearchIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

type SearchItem = {
  label: string;
  href?: string;
  description?: string;
  keywords: string[];
  shortcut?: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
  hidden?: boolean;
};

type SearchGroup = {
  heading: string;
  items: SearchItem[];
};

const searchGroups: SearchGroup[] = [
  {
    heading: "Navigation",
    items: [
      {
        label: "Home",
        href: "/",
        description: "Landing page",
        keywords: ["home", "landing", "marketing"],
        icon: LayoutGridIcon,
      },
      {
        label: "Explore",
        href: "/explore",
        description: "Discover public projects",
        keywords: ["explore", "discover", "public"],
        icon: SparklesIcon,
      },
      {
        label: "Projects",
        href: "/project",
        description: "Project workspace list",
        keywords: ["projects", "workspace", "list"],
        icon: LayoutGridIcon,
      },
    ],
  },
  {
    heading: "Quick links",
    items: [
      {
        label: "Dashboard",
        href: "/xtool",
        description: "Command center overview",
        keywords: ["home", "overview", "command center", "studio"],
        icon: LayoutGridIcon,
      },
      {
        label: "Pricing",
        href: "/pricing",
        description: "Plans and credit packs",
        keywords: ["plans", "billing", "credits", "cost"],
        icon: CreditCardIcon,
      },
      {
        label: "Modules",
        href: "/xtool",
        description: "Browse all modules",
        keywords: ["modules", "tools", "features"],
        icon: LayoutGridIcon,
      },
      {
        label: "Notifications",
        href: "/xtool/notifications",
        description: "Workspace updates",
        keywords: ["alerts", "updates", "activity"],
        icon: BellIcon,
      },
    ],
  },
  {
    heading: "Modules",
    items: [
      {
        label: "XDesign",
        href: "/xtool/module-xdesign",
        description: "AI UI generation studio",
        keywords: ["design", "ui", "mockups", "frames"],
        icon: Wand2Icon,
      },
      {
        label: "XCreator",
        href: "/xtool/module-xcreator",
        description: "Content and creator workflows",
        keywords: ["creator", "content", "social", "studio"],
        icon: ClapperboardIcon,
        hidden: !showXCreator,
      },
      {
        label: "XCreator Image Clipping",
        href: "/xtool/module-xcreator/image-clipping",
        description: "Batch image processing",
        keywords: ["image", "clip", "background", "remove"],
        icon: ImageIcon,
        hidden: !showXCreator,
      },
      {
        label: "XCreator Video Clipping",
        href: "/xtool/module-xcreator/video-clipping",
        description: "Automated video clips",
        keywords: ["video", "clip", "shorts", "reels"],
        icon: VideoIcon,
        hidden: !showXCreator,
      },
      {
        label: "XCreator Scheduler",
        href: "/xtool/module-xcreator/scheduler",
        description: "Content calendar",
        keywords: ["schedule", "planner", "calendar", "posts"],
        icon: CalendarClockIcon,
        hidden: !showXCreator,
      },
      {
        label: "XCreator Accounts",
        href: "/xtool/module-xcreator/accounts",
        description: "Linked social accounts",
        keywords: ["accounts", "profiles", "connections"],
        icon: UserIcon,
        hidden: !showXCreator,
      },
    ],
  },
  {
    heading: "Workspace",
    items: [
      {
        label: "Credits",
        href: "/billing",
        description: "Usage and credit history",
        keywords: ["billing", "credits", "usage", "history"],
        icon: CreditCardIcon,
      },
      {
        label: "Account",
        href: "/account",
        description: "Profile overview",
        keywords: ["profile", "user", "account"],
        icon: UserIcon,
      },
      {
        label: "Billing history",
        href: "/billing/history",
        description: "Full credit ledger",
        keywords: ["billing", "credits", "history", "transactions"],
        icon: CreditCardIcon,
      },
      {
        label: "Settings",
        href: "/account/settings",
        description: "Security and preferences",
        keywords: ["settings", "preferences", "security"],
        icon: SettingsIcon,
      },
    ],
  },
  {
    heading: "Shortcuts",
    items: [
      {
        label: "Open search",
        keywords: ["shortcut", "search", "open"],
        shortcut: "Ctrl/Cmd K",
        disabled: true,
      },
      {
        label: "Quick open",
        keywords: ["shortcut", "search", "slash"],
        shortcut: "/",
        disabled: true,
      },
      {
        label: "Close search",
        keywords: ["shortcut", "close", "escape"],
        shortcut: "Esc",
        disabled: true,
      },
    ],
  },
];

const isEditableTarget = (target: EventTarget | null) => {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return (
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};

export const CreatorSearch = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
        return;
      }
      if (event.key === "/") {
        event.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSelectItem = (href?: string) => {
    if (!href) return;
    setOpen(false);
    requestAnimationFrame(() => router.push(href));
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex h-9 w-80 items-center rounded-full border border-input bg-muted/50 px-4 text-left text-sm text-muted-foreground transition hover:bg-muted/70 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        aria-label="Open search"
      >
        <SearchIcon className="mr-2 h-4 w-4" />
        <span className="flex-1">Search Anything</span>
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded-full border border-border/60 bg-background px-2 py-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:flex">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search Anything" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {searchGroups.map((group, index) => {
            const visibleItems = group.items.filter((item) => !item.hidden);
            if (visibleItems.length === 0) return null;
            return (
            <Fragment key={group.heading}>
              <CommandGroup heading={group.heading}>
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const value = `${item.label} ${item.keywords.join(" ")} ${item.href ?? ""}`;
                  return (
                    <CommandItem
                      key={item.label}
                      value={value}
                      onSelect={() => onSelectItem(item.href)}
                      onClick={() => onSelectItem(item.href)}
                      disabled={item.disabled}
                    >
                      {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
                      <div className="flex flex-1 flex-col">
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.description ? (
                          <span className="text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        ) : null}
                      </div>
                      {item.shortcut ? (
                        <CommandShortcut>{item.shortcut}</CommandShortcut>
                      ) : null}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {index < searchGroups.length - 1 ? <CommandSeparator /> : null}
            </Fragment>
          );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
};
