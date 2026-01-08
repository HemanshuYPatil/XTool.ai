"use client";

import { useEffect, useMemo, useState } from "react";
import { useConvex, useQuery } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { api } from "@/convex/_generated/api";
import { BellIcon, ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  formatCreditsDelta,
  formatNotificationReason,
} from "@/components/notifications/notification-utils";
import { splitCreditReason } from "@/lib/credit-reason";

type NotificationsListProps = {
  limit?: number;
  className?: string;
  items?: {
    _id: string;
    amount: number;
    reason: string;
    modelTokens?: number | null;
    promptTokens?: number | null;
    completionTokens?: number | null;
    details?: { amount: number; reason: string; modelTokens?: number }[] | null;
    createdAt: number;
  }[];
  useRealtime?: boolean;
};

export const NotificationsList = ({
  limit = 20,
  className,
  items,
  useRealtime = false,
}: NotificationsListProps) => {
  const { user } = useKindeBrowserClient();
  const convex = useConvex();

  const queryArgs = useMemo(
    () =>
      useRealtime && items === undefined && user?.id ? { limit } : "skip",
    [items, limit, useRealtime, user?.id]
  );
  const data = useQuery(api.realtime.getUserCreditTransactions, queryArgs);
  const [staticData, setStaticData] = useState<typeof data>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!useRealtime && items === undefined) {
      if (!user?.id) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStaticData([]);
        return;
      }
      setStaticData(undefined);
      convex
        .query(api.realtime.getUserCreditTransactions, { limit })
        .then((result) => {
          if (!cancelled) {
            setStaticData(result);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setStaticData([]);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [convex, items, limit, useRealtime, user?.id]);

  const source =
    items !== undefined
      ? items
      : useRealtime
        ? data
        : staticData;

  const notifications = useMemo(() => {
    if (!source || source.length === 0) return [];
    return [...source].sort((a, b) => b.createdAt - a.createdAt);
  }, [source]);

  if (source === undefined) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
        <div className="size-12 rounded-full bg-muted/40 flex items-center justify-center">
          <BellIcon className="size-5 text-muted-foreground/60" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          No notifications yet.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {notifications.map((item) => {
        const isDeduction = item.amount < 0;
        const { baseReason, projectName } = splitCreditReason(item.reason);
        const title = projectName ?? (isDeduction ? "Token spent" : "Token received");
        const detail = baseReason ? formatNotificationReason(baseReason) : null;
        return (
          <div
            key={item._id}
            className="flex items-start gap-3 rounded-2xl border border-border/50 bg-background/60 p-4"
          >
            <div
              className={cn(
                "size-9 rounded-full flex items-center justify-center shrink-0",
                isDeduction ? "bg-orange-500/10 text-orange-600" : "bg-emerald-500/10 text-emerald-600"
              )}
            >
              {isDeduction ? (
                <ArrowUpRightIcon className="size-4" />
              ) : (
                <ArrowDownLeftIcon className="size-4" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold">{title}</p>
              {projectName && detail ? (
                <p className="text-xs text-muted-foreground">{detail}</p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {formatCreditsDelta(item.amount)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {format(item.createdAt, "MMM d, yyyy - h:mm a")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
