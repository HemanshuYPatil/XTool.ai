"use client";

import { useMemo, useState } from "react";
import { CreatorSidebar } from "./creator-sidebar";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CreditDisplay } from "@/components/credits/credit-display";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { CreatorSearch } from "@/components/creator/creator-search";

type CreatorLayoutProps = {
  children: React.ReactNode;
  user?: any;
  credits?: number | null;
  isDeveloper?: boolean;
};

export function CreatorLayout({
  children,
  user,
  credits,
  isDeveloper,
}: CreatorLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  
  const breadcrumb = useMemo(() => {
    if (pathname === "/xtool") return "Dashboard";
    if (pathname === "/xtool/module-xdesign") return "XDesign";
    if (pathname.startsWith("/xtool/module-xcreator")) {
      if (pathname === "/xtool/module-xcreator") return "XCreator";
      if (pathname.includes("/image-clipping")) return "XCreator / Image Clipping";
      if (pathname.includes("/video-clipping")) return "XCreator / Video Clipping";
      if (pathname.includes("/accounts")) return "XCreator / Accounts";
      if (pathname.includes("/scheduler")) return "XCreator / Scheduler";
      return "XCreator";
    }
    if (pathname === "/account") return "Account";
    if (pathname === "/billing") return "Credits";
    if (pathname === "/account/settings") return "Settings";
    return "Dashboard";
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <CreatorSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      
      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-20" : "ml-65"
        )}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-8 backdrop-blur-md">
          <div className="flex items-center gap-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm font-medium">
              <span className="text-muted-foreground">XTool.ai</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">{breadcrumb}</span>
            </nav>

            <CreatorSearch />
          </div>

          <div className="flex items-center gap-4">
            <CreditDisplay
              initialUserId={user?.id ?? null}
              initialCredits={credits}
              isDeveloper={isDeveloper}
            />
            <NotificationBell />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 border-2 border-primary/10 transition-transform hover:scale-105">
                    <AvatarImage src={user?.picture} alt={user?.given_name || "User"} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      {user?.given_name?.charAt(0) || <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.given_name} {user?.family_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">Credits</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/account/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <LogoutLink className="w-full">Log out</LogoutLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="h-[calc(100vh-64px)] overflow-y-auto p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
