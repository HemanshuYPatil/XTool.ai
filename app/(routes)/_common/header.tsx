"use client";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { LogOutIcon, MoonIcon, SunIcon, UserIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreditDisplay } from "@/components/credits/credit-display";

type HeaderProps = {
  initialUser?: {
    id?: string | null;
    given_name?: string | null;
    family_name?: string | null;
    picture?: string | null;
  };
  initialCredits?: number | null;
  isDeveloper?: boolean;
};

import { usePathname } from "next/navigation";



const Header = ({
  initialUser,
  initialCredits,
  isDeveloper,
}: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { user } = useKindeBrowserClient();
  const pathname = usePathname();
  const resolvedUser = user ?? initialUser;
  const isDark = theme === "dark";

  const isActive = (path: string) => pathname === path;

  return (
    <div className="sticky top-0 right-0 left-0 z-30">
      <header className="h-16 border-b bg-background/80 backdrop-blur-md py-4 transition-all">
        <div
          className="w-full max-w-6xl mx-auto
         flex items-center justify-between px-6"
        >
          <Logo />

          <div
            className="hidden flex-1 items-center
          justify-center gap-2 md:flex"
          >
            {[
              { name: "Home", href: "/" },
              { name: "Explore", href: "/explore" },
              { name: "Docs", href: "/docs" },
              { name: "Credits", href: "/pricing" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300",
                  isActive(link.href)
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.name}
                {isActive(link.href) && (
                  <span className="absolute inset-0 rounded-full ring-1 ring-primary/20 pointer-events-none" />
                )}
              </Link>
            ))}
          </div>

          <div
            className="flex flex-1 items-center
           justify-end gap-3"
          >
            {resolvedUser && (
              <CreditDisplay
                initialUserId={resolvedUser.id ?? null}
                initialCredits={initialCredits}
                isDeveloper={isDeveloper}
              />
            )}
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
            {resolvedUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <Avatar className="h-8 w-8 bg-muted text-foreground">
                      <AvatarImage
                        src={resolvedUser?.picture ?? undefined}
                        alt={resolvedUser?.given_name ?? "User profile"}
                      />
                      <AvatarFallback>
                        {resolvedUser?.given_name?.charAt(0) ||
                        resolvedUser?.family_name?.charAt(0) ? (
                          <>
                            {resolvedUser?.given_name?.charAt(0)}
                            {resolvedUser?.family_name?.charAt(0)}
                          </>
                        ) : (
                          <UserIcon className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/account" className="w-full text-sm">
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/billing" className="w-full text-sm">
                      Credits
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogoutLink className="w-full flex items-center gap-2">
                      <LogOutIcon className="size-4" />
                      Logout
                    </LogoutLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginLink>
                <Button>Sign in</Button>
              </LoginLink>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
