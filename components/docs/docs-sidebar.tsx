"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Book,
  PlayCircle,
  LayoutGrid,
  FolderKanban,
  Users,
  MessageSquare,
  Share2,
  UserCircle,
  CreditCard,
  Shield,
  HelpCircle
} from "lucide-react";

export function DocsSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/docs/about" ? pathname === "/docs" || pathname === href : pathname === href;

  const navItems = [
    { href: "/docs/about", label: "About Us", icon: Book },
    { href: "/docs/getting-started", label: "Getting Started", icon: PlayCircle },
    { href: "/docs/workspace-basics", label: "Workspace Basics", icon: LayoutGrid },
    { href: "/docs/projects-organization", label: "Projects & Organization", icon: FolderKanban },
    { href: "/docs/collaboration", label: "Collaboration", icon: Users },
    { href: "/docs/reviews-feedback", label: "Reviews & Feedback", icon: MessageSquare },
    { href: "/docs/sharing-presentation", label: "Sharing & Presentation", icon: Share2 },
    { href: "/docs/account-profile", label: "Account & Profile", icon: UserCircle },
    { href: "/docs/billing-credits", label: "Billing & Credits", icon: CreditCard },
    { href: "/docs/privacy-security", label: "Privacy & Security", icon: Shield },
    { href: "/docs/support", label: "Support", icon: HelpCircle }
  ];

  return (
    <aside className={cn("hidden lg:block", className)}>
      <nav className="flex flex-col gap-6">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all",
                active
                  ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-background transition-colors">
                <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground/50 group-hover:text-foreground")} />
              </div>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

