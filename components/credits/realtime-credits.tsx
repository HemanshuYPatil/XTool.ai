"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { splitCreditReason } from "@/lib/credit-reason";

type CreditTransactionItem = {
  id: string;
  amount: number;
  reason: string;
  modelTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  details?: { amount: number; reason: string; modelTokens?: number }[];
  createdAt: Date | string | number;
};

const formatCredits = (credits: number | null | undefined) => {
  if (credits == null) return "--";
  return credits.toLocaleString("en-US");
};

const toDate = (value: Date | string | number) => {
  if (value instanceof Date) return value;
  return new Date(value);
};

export const useRealtimeCredits = ({
  initialCredits,
  isDeveloper,
}: {
  initialCredits: number | null;
  isDeveloper: boolean;
}) => {
  const [cachedCredits, setCachedCredits] = useState<number | null>(initialCredits);
  const data = useQuery(
    api.realtime.getUserCredits,
    isDeveloper ? "skip" : {}
  );

  useEffect(() => {
    if (typeof initialCredits === "number" && cachedCredits === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCachedCredits(initialCredits);
    }
  }, [initialCredits, cachedCredits]);

  useEffect(() => {
    if (typeof data?.credits === "number") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCachedCredits(data.credits);
    }
  }, [data?.credits]);

  if (isDeveloper) return null;

  return typeof data?.credits === "number" ? data.credits : (cachedCredits ?? initialCredits);
};

export const RealtimeCreditsValue = ({
  initialCredits,
  isDeveloper,
}: {
  initialCredits: number | null;
  isDeveloper: boolean;
}) => {
  const credits = useRealtimeCredits({ initialCredits, isDeveloper });
  if (isDeveloper) return <>Unlimited</>;
  return <>{formatCredits(credits)}</>;
};

export const RealtimeCreditTransactionsList = ({
  initialTransactions,
  limit = 10,
}: {
  initialTransactions: CreditTransactionItem[];
  limit?: number;
}) => {
  const data = useQuery(
    api.realtime.getUserCreditTransactions,
    { limit }
  );
  const transactions =
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
      : initialTransactions;

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
          <div key={tx.id} className="grid grid-cols-3 items-center">
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
          </div>
        );
      })}
    </>
  );
};
