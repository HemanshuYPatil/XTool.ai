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

const Header = ({
  initialUser,
  initialCredits,
  isDeveloper,
}: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { user } = useKindeBrowserClient();
  const resolvedUser = user ?? initialUser;
  const isDark = theme === "dark";

  return (
    <div className="sticky top-0 right-0 left-0 z-30">
      <header className="h-16 border-b bg-background py-4">
        <div
          className="w-full max-w-6xl mx-auto
         flex items-center justify-between"
        >
          <Logo />

          <div
            className="hidden flex-1 items-center
          justify-center gap-8 md:flex"
          >
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-foreground-muted text-sm transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="rounded-full px-3 py-1.5 text-foreground-muted text-sm transition-colors hover:bg-muted/70 hover:text-foreground"
            >
              Credits
            </Link>
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
