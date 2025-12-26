"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboardIcon,
  ClapperboardIcon,
  CalendarClockIcon,
  GlobeIcon,
  Wand2Icon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Logo from "@/components/logo";

const navigation = [
  { name: "Dashboard", href: "/xcreator", icon: LayoutDashboardIcon },
  { name: "Production", href: "/xcreator/production", icon: ClapperboardIcon },
  { name: "Schedule", href: "/xcreator/schedule", icon: CalendarClockIcon },
  { name: "Channels", href: "/xcreator/channels", icon: GlobeIcon },
  { name: "AI Tools", href: "/xcreator/ai-tools", icon: Wand2Icon },
];

type CreatorSidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
};

export function CreatorSidebar({ isCollapsed, setIsCollapsed }: CreatorSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between px-2 py-4">
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
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
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

        <div className="mt-auto border-t pt-4 px-2">
          <Link
            href="/xcreator/settings"
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground",
              pathname === "/xcreator/settings" && "bg-muted text-foreground"
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
