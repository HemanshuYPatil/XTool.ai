"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { splitCreditReason } from "@/lib/credit-reason";

type CreditHistoryItem = {
  id: string;
  amount: number;
  reason: string;
  modelTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  details?: { amount: number; reason: string; modelTokens?: number }[];
  createdAt: Date | string | number;
};

const toDate = (value: Date | string | number) =>
  value instanceof Date ? value : new Date(value);

const formatNumber = (value?: number | null) => {
  if (value == null) return "--";
  return value.toLocaleString("en-US");
};

const buildTokenSplit = (item: CreditHistoryItem) => {
  const promptTokens = item.promptTokens ?? 0;
  const completionTokens = item.completionTokens ?? 0;
  const totalTokens =
    item.modelTokens ?? promptTokens + completionTokens;
  return {
    promptTokens,
    completionTokens,
    totalTokens,
    hasBreakdown: promptTokens + completionTokens > 0,
  };
};

export const CreditHistoryList = ({
  initialTransactions,
  limit = 10,
}: {
  initialTransactions: CreditHistoryItem[];
  limit?: number;
}) => {
  const { user } = useKindeBrowserClient();
  const [selected, setSelected] = useState<CreditHistoryItem | null>(null);
  const [cachedTransactions, setCachedTransactions] = useState<CreditHistoryItem[]>(
    initialTransactions
  );

  const data = useQuery(
    api.realtime.getUserCreditTransactions,
    user ? { limit } : "skip"
  );
  useEffect(() => {
    if (data && data.length) {
      setCachedTransactions(
        data.map((tx) => ({
          id: tx.transactionId,
          amount: tx.amount,
          reason: tx.reason,
          modelTokens: tx.modelTokens ?? undefined,
          promptTokens: tx.promptTokens ?? undefined,
          completionTokens: tx.completionTokens ?? undefined,
          details: Array.isArray(tx.details) ? tx.details : undefined,
          createdAt: tx.createdAt,
        }))
      );
      return;
    }
    if (!cachedTransactions.length && initialTransactions.length) {
      setCachedTransactions(initialTransactions);
    }
  }, [data, initialTransactions, cachedTransactions.length]);

  const transactions: CreditHistoryItem[] =
    data && data.length
      ? data.map((tx) => ({
          id: tx.transactionId,
          amount: tx.amount,
          reason: tx.reason,
          modelTokens: tx.modelTokens ?? undefined,
          promptTokens: tx.promptTokens ?? undefined,
          completionTokens: tx.completionTokens ?? undefined,
          details: Array.isArray(tx.details) ? tx.details : undefined,
          createdAt: tx.createdAt,
        }))
      : cachedTransactions;

  const selectedBreakdown = useMemo(
    () => (selected ? buildTokenSplit(selected) : null),
    [selected]
  );
  const selectedReason = useMemo(
    () => (selected ? splitCreditReason(selected.reason) : null),
    [selected]
  );

  if (!transactions.length) {
    return (
      <div className="px-6 py-6 text-sm text-muted-foreground">
        No credit usage yet.
      </div>
    );
  }

  return (
    <>
      {transactions.map((tx) => {
        const { baseReason, projectName } = splitCreditReason(tx.reason);
        return (
          <button
            key={tx.id}
            type="button"
            onClick={() => setSelected(tx)}
            className="grid w-full grid-cols-3 items-center text-left transition-colors hover:bg-muted/40"
          >
            <div className="px-6 py-4 font-medium">
              {toDate(tx.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="px-6 py-4 font-medium">
              <div>{baseReason}</div>
              {projectName ? (
                <div className="text-xs text-muted-foreground">
                  Project: {projectName}
                </div>
              ) : null}
            </div>
            <div className="px-6 py-4 text-right font-medium">{tx.amount}</div>
          </button>
        );
      })}

      <Dialog open={Boolean(selected)} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
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
                  <p className="mt-2 text-sm font-semibold">
                    {selectedReason?.baseReason ?? selected.reason}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border bg-background/60 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Token distribution</p>
                    <p className="text-xs text-muted-foreground">
                      Prompt vs. completion tokens for this deduction.
                    </p>
                  </div>
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
              {selectedReason?.projectName ? (
                <div className="rounded-2xl border bg-background/60 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Project
                  </p>
                  <p className="mt-2 text-sm font-semibold">
                    {selectedReason.projectName}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};
