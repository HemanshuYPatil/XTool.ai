"use client";

import React, { useMemo } from "react";
import { CoinsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRealtimeCredits } from "./realtime-credits";

interface CreditDisplayProps {
  className?: string;
  initialUserId?: string | null;
  initialCredits?: number | null;
  isDeveloper?: boolean;
}

export const CreditDisplay = ({
  className,
  initialUserId,
  initialCredits,
  isDeveloper = false,
}: CreditDisplayProps) => {
  const { user } = useKindeBrowserClient();
  const credits = useRealtimeCredits({
    initialCredits: initialCredits ?? null,
    isDeveloper,
  });

  const creditsLabel = useMemo(() => {
    if (isDeveloper) return "Unlimited";
    if (typeof credits === "number") {
      return credits.toLocaleString();
    }
    return "--";
  }, [credits, isDeveloper]);

  if (!user && !initialUserId) return null;

  if (credits === undefined && !isDeveloper) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 animate-pulse border border-border", className)}>
        <div className="h-3.5 w-3.5 rounded-full bg-muted" />
        <div className="h-3 w-10 rounded bg-muted" />
      </div>
    );
  }

  return (
    <Link
      href="/billing/history"
      className={cn(
        "group flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all duration-300",
        "bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/30",
        className
      )}
    >
      <div className="flex items-center justify-center">
        <CoinsIcon className="size-3.5 text-primary transition-transform duration-300 group-hover:scale-110" />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold tracking-tight text-primary">
          {creditsLabel}
        </span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Credits
        </span>
      </div>
    </Link>
  );
};
