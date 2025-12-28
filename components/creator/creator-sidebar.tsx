"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboardIcon,
  ClapperboardIcon,
  GlobeIcon,
  Wand2Icon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ScissorsIcon,
  ImageIcon,
  UsersIcon,
  CalendarIcon,
  ArrowLeftIcon,
  FileTextIcon,
  TagIcon,
  ArrowUpRightIcon,
  HomeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";

const mainNavigation = [
  { name: "Dashboard", href: "/xtool", icon: LayoutDashboardIcon },
  { name: "XDesign", href: "/xtool/module-xdesign", icon: Wand2Icon },
  { name: "XCode CLI", href: "/xtool/module-xcode", icon: GlobeIcon },
  { name: "XCreator", href: "/xtool/module-xcreator", icon: ClapperboardIcon },
];

const xcreatorNavigation = [
  { name: "XCreator Home", href: "/xtool/module-xcreator", icon: HomeIcon },
  { name: "AI Image Clip", href: "/xtool/module-xcreator/image-clipping", icon: ImageIcon },
  { name: "AI Video Clip", href: "/xtool/module-xcreator/video-clipping", icon: ScissorsIcon },
  { name: "Manage Accounts", href: "/xtool/module-xcreator/accounts", icon: UsersIcon },
  { name: "Schedule Post", href: "/xtool/module-xcreator/scheduler", icon: CalendarIcon },
];

type CreatorSidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
};

export function CreatorSidebar({ isCollapsed, setIsCollapsed }: CreatorSidebarProps) {
  const pathname = usePathname();
  const isXCreatorContext = pathname.startsWith("/xtool/module-xcreator");
  
  const navigation = isXCreatorContext ? xcreatorNavigation : mainNavigation;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-65"
      )}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className={cn(
          "flex items-center px-2 py-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && <Logo />}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="h-4 w-4" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="flex-1 space-y-1 px-2">
          {isXCreatorContext && !isCollapsed && (
            <div className="mb-4 px-3">
              <Link
                href="/xtool"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeftIcon className="size-3" />
                Back to Dashboard
              </Link>
            </div>
          )}
          
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isCollapsed ? "justify-center px-0" : "",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground"
                  )}
                />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t pt-4 px-2 space-y-1">
          <Link
            href="/docs"
            className={cn(
              "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-0"
            )}
          >
            <div className="flex items-center gap-3">
              <FileTextIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && <span>Documentation</span>}
            </div>
            {!isCollapsed && <ArrowUpRightIcon className="h-3.5 w-3.5 opacity-50" />}
          </Link>

          <Link
            href="/pricing"
            className={cn(
              "group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-0"
            )}
          >
            <div className="flex items-center gap-3">
              <TagIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && <span>Pricing</span>}
            </div>
            {!isCollapsed && <ArrowUpRightIcon className="h-3.5 w-3.5 opacity-50" />}
          </Link>

          <Link
            href="/account/settings"
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground",
              isCollapsed && "justify-center px-0",
              pathname === "/account/settings" && "bg-muted text-foreground"
            )}
          >
            <SettingsIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:rotate-45" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
