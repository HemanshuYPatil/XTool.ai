"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  const { user } = useKindeBrowserClient();
  const data = useQuery(
    api.realtime.getUserCredits,
    user && !isDeveloper ? {} : "skip"
  );
  if (isDeveloper) return null;
  return typeof data?.credits === "number" ? data.credits : initialCredits;
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
  const { user } = useKindeBrowserClient();
  const data = useQuery(
    api.realtime.getUserCreditTransactions,
    user ? { limit } : "skip"
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
      {transactions.map((tx) => (
        <div key={tx.id} className="grid grid-cols-3 items-center">
          <div className="px-6 py-4 font-medium">
            {toDate(tx.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="px-6 py-4 font-medium">{tx.reason}</div>
          <div className="px-6 py-4 text-right font-medium">{tx.amount}</div>
        </div>
      ))}
    </>
  );
};
