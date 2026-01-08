"use client";

import { useEffect, useMemo, useState } from "react";
import { useConvex } from "convex/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { api } from "@/convex/_generated/api";
import { BellIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationsList } from "@/components/notifications/notifications-list";
import Link from "next/link";

const STORAGE_KEY = "xtool:lastSeenNotificationAt";

export const NotificationBell = () => {
  const { user } = useKindeBrowserClient();
  const convex = useConvex();
  const [listItems, setListItems] = useState<
    | {
        _id: string;
        amount: number;
        reason: string;
        modelTokens?: number | null;
        promptTokens?: number | null;
        completionTokens?: number | null;
        details?: { amount: number; reason: string; modelTokens?: number }[] | null;
        createdAt: number;
      }[]
    | undefined
  >(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setListItems([]);
      return;
    }

    setListItems(undefined);
    convex
      .query(api.realtime.getUserCreditTransactions, { limit: 20 })
      .then((result) => {
        if (!cancelled) {
          setListItems(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setListItems([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [convex, user?.id]);

  const latestCreatedAt = useMemo(() => {
    if (!listItems || listItems.length === 0) return null;
    return listItems.reduce(
      (latest, item) => Math.max(latest, item.createdAt),
      0
    );
  }, [listItems]);

  const [lastSeen, setLastSeen] = useState<number>(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : 0;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastSeen(Number.isFinite(parsed) ? parsed : 0);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!latestCreatedAt) return;
    const next = Math.max(lastSeen, latestCreatedAt);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastSeen(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    }
  }, [latestCreatedAt, lastSeen, open]);

  const hasNew = Boolean(
    latestCreatedAt && latestCreatedAt > (lastSeen || 0)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <BellIcon className="h-5 w-5" />
          {hasNew ? (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h4 className="font-bold">Notifications</h4>
        </div>
        <div className="max-h-[320px] overflow-y-auto p-4">
          <NotificationsList
            items={listItems ?? undefined}
            useRealtime={false}
          />
        </div>
        <div className="p-2 text-center border-t">
          <Button variant="ghost" size="sm" className="w-full text-xs text-primary font-bold" asChild>
            <Link href="/xtool/notifications">
              View notification full screen
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
