"use client";

import { useMemo, useState } from "react";
import { CreatorSidebar } from "./creator-sidebar";
import { SearchIcon, BellIcon, UserIcon, PlusIcon, CheckIcon, InfoIcon, AlertCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";

type CreatorLayoutProps = {
  children: React.ReactNode;
  user?: any;
};

const notifications = [
  { id: 1, title: "Video Processed", description: "Your AI clip 'Future of AI' is ready.", time: "2h ago", icon: CheckIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: 2, title: "New Feature", description: "AI Image Clipping is now live!", time: "5h ago", icon: InfoIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 3, title: "Storage Alert", description: "You are using 85% of your storage.", time: "1d ago", icon: AlertCircleIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
];

export function CreatorLayout({ children, user }: CreatorLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  
  const breadcrumb = useMemo(() => {
    if (pathname === "/xtool") return "Dashboard";
    if (pathname === "/xtool/module-xdesign") return "XDesign";
    if (pathname === "/xtool/module-xcode") return "XCode CLI";
    if (pathname.startsWith("/xtool/module-xcreator")) {
      if (pathname === "/xtool/module-xcreator") return "XCreator";
      if (pathname.includes("/image-clipping")) return "XCreator / Image Clipping";
      if (pathname.includes("/video-clipping")) return "XCreator / Video Clipping";
      if (pathname.includes("/accounts")) return "XCreator / Accounts";
      if (pathname.includes("/scheduler")) return "XCreator / Scheduler";
      return "XCreator";
    }
    if (pathname === "/account") return "Account";
    if (pathname === "/billing") return "Billing";
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
          isCollapsed ? "ml-20" : "ml-[260px]"
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

            <div className="relative w-80">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search modules..."
                className="h-9 w-full rounded-full bg-muted/50 pl-10 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full relative">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                  <h4 className="font-bold">Notifications</h4>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", n.bg)}>
                        <n.icon className={cn("h-4 w-4", n.color)} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold leading-none">{n.title}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{n.description}</p>
                        <p className="text-[10px] text-muted-foreground">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center border-t">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-primary font-bold">
                    View All Notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
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
                  <Link href="/billing">Billing</Link>
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
