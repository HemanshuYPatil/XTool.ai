"use client";
 
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  ArrowUpRightIcon, 
  ArrowDownLeftIcon, 
  ClockIcon, 
  CoinsIcon,
  SearchIcon,
  FilterIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreditHistoryItem = {
  _id: string;
  transactionId: string;
  amount: number;
  reason: string;
  modelTokens?: number | null;
  promptTokens?: number | null;
  completionTokens?: number | null;
  details?: { amount: number; reason: string; modelTokens?: number | null }[] | null;
  createdAt: number;
};

const formatNumber = (value?: number | null) => {
  if (value == null) return "--";
  return value.toLocaleString("en-US");
};

const buildTokenSplit = (item: CreditHistoryItem) => {
  const promptTokens = item.promptTokens ?? 0;
  const completionTokens = item.completionTokens ?? 0;
  const totalTokens = item.modelTokens ?? promptTokens + completionTokens;
  return {
    promptTokens,
    completionTokens,
    totalTokens,
    hasBreakdown: promptTokens + completionTokens > 0,
  };
};

export const CreditHistory = ({
  initialTransactions = [],
  initialUser,
  isDeveloper = false,
}: {
  initialTransactions?: any[];
  initialUser?: any;
  isDeveloper?: boolean;
}) => {
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState<CreditHistoryItem | null>(null);
  const [cachedTransactions, setCachedTransactions] = React.useState<CreditHistoryItem[]>(
    initialTransactions as CreditHistoryItem[]
  );
  const { user: kindeUser, isLoading } = useKindeBrowserClient();

  const user = kindeUser ?? initialUser;
  const transactionsData = useQuery(
    api.realtime.getUserCreditTransactions,
    user ? { limit: 50 } : "skip"
  );

  React.useEffect(() => {
    if (transactionsData && transactionsData.length > 0) {
      setCachedTransactions(transactionsData as CreditHistoryItem[]);
      return;
    }
    if (!cachedTransactions.length && initialTransactions.length) {
      setCachedTransactions(initialTransactions as CreditHistoryItem[]);
    }
  }, [transactionsData, initialTransactions, cachedTransactions.length]);

  const transactions =
    transactionsData && transactionsData.length > 0
      ? (transactionsData as CreditHistoryItem[])
      : cachedTransactions;

  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];
    return (transactions as CreditHistoryItem[])
      .filter(
        (tx) =>
          tx.reason.toLowerCase().includes(search.toLowerCase()) ||
          tx.transactionId.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [transactions, search]);

  const selectedBreakdown = React.useMemo(
    () => (selected ? buildTokenSplit(selected) : null),
    [selected]
  );

  if (isLoading && !user) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-border/60 bg-muted/5">
        <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center">
          <ClockIcon className="size-8 text-muted-foreground/40" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold">Sign in to view history</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Your credit usage appears here once you are signed in.
          </p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md animate-in fade-in zoom-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-breathing-glow" />
          <div className="relative size-20 rounded-2xl bg-background/80 flex items-center justify-center shadow-xl border border-border/50 animate-floating">
            {isDeveloper ? (
              <CoinsIcon className="size-10 text-primary" />
            ) : (
              <ClockIcon className="size-10 text-primary" />
            )}
          </div>
        </div>
        <div className="space-y-2 max-w-md mx-auto px-4">
          <h3 className="text-xl font-bold tracking-tight">
            {isDeveloper ? "Unlimited Access" : "No transactions found"}
          </h3>
          <p className="text-muted-foreground">
            {isDeveloper
              ? "Developer accounts have unlimited credits and do not generate transaction history."
              : "Your credit usage history will appear here once you start using AI features."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card/40 p-2 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="relative w-full sm:w-80 group">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search transactions..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 rounded-xl bg-background/50 border-transparent focus:bg-background focus:border-primary/20 transition-all duration-300"
          />
        </div>
        <Button variant="ghost" size="sm" className="rounded-xl gap-2 hover:bg-background/80 h-10 px-4 text-muted-foreground hover:text-foreground">
          <FilterIcon className="size-4" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredTransactions.map((tx) => {
          const isDeduction = tx.amount < 0;
          return (
            <button
              key={tx._id}
              type="button"
              onClick={() => setSelected(tx)}
              className="group relative flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card/40 hover:bg-accent/50 hover:border-primary/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "size-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 shadow-sm",
                  isDeduction 
                    ? "bg-orange-500/10 text-orange-600 group-hover:bg-orange-500/20" 
                    : "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/20"
                )}>
                  {isDeduction ? (
                    <ArrowUpRightIcon className="size-5" />
                  ) : (
                    <ArrowDownLeftIcon className="size-5" />
                  )}
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="font-semibold text-sm leading-none group-hover:text-primary transition-colors">
                    {tx.reason}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80">
                    <span className="font-medium" suppressHydrationWarning>{format(tx.createdAt, "MMM d, yyyy • HH:mm")}</span>
                    <span className="size-1 rounded-full bg-border" />
                    <span className="font-mono uppercase tracking-wider opacity-60 text-[10px]">#{tx.transactionId.slice(-6)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className={cn(
                  "text-lg font-bold tracking-tight flex items-center justify-end gap-1.5 font-mono",
                  isDeduction ? "text-orange-600" : "text-emerald-600"
                )}>
                  {isDeduction ? "-" : "+"}{Math.abs(tx.amount).toLocaleString()}
                  <CoinsIcon className="size-4 opacity-50" />
                </div>
                {tx.modelTokens && (
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest bg-muted/50 px-1.5 py-0.5 rounded-md">
                      {tx.modelTokens.toLocaleString()} Tokens
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Credit deduction details</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border bg-background/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Credits
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    {Math.abs(selected.amount).toLocaleString("en-US")}
                  </p>
                </div>
                <div className="rounded-2xl border bg-background/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Total tokens
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    {formatNumber(selectedBreakdown?.totalTokens)}
                  </p>
                </div>
                <div className="rounded-2xl border bg-background/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Reason
                  </p>
                  <p className="mt-2 text-sm font-semibold">{selected.reason}</p>
                </div>
              </div>

              <div className="rounded-2xl border bg-background/60 p-5 space-y-4">
                <div>
                  <p className="text-sm font-semibold">Token distribution</p>
                  <p className="text-xs text-muted-foreground">
                    Input vs. output tokens for this deduction.
                  </p>
                </div>
                {selectedBreakdown?.hasBreakdown ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Input tokens</span>
                      <span>{formatNumber(selectedBreakdown.promptTokens)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (selectedBreakdown.promptTokens /
                                selectedBreakdown.totalTokens) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>Output tokens</span>
                      <span>
                        {formatNumber(selectedBreakdown.completionTokens)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (selectedBreakdown.completionTokens /
                                selectedBreakdown.totalTokens) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Token breakdown is not available for this transaction.
                  </p>
                )}
              </div>

              {selected.details?.length ? (
                <div className="rounded-2xl border bg-background/60 p-5 space-y-3">
                  <p className="text-sm font-semibold">Deduction breakdown</p>
                  <div className="space-y-2 text-sm">
                    {selected.details.map((detail, index) => (
                      <div
                        key={`${detail.reason}-${index}`}
                        className="flex items-center justify-between border-b border-border/60 pb-2 last:border-b-0 last:pb-0"
                      >
                        <span>{detail.reason}</span>
                        <span className="font-semibold">
                          {Math.abs(detail.amount).toLocaleString("en-US")} credits
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};
