import prisma from "@/lib/prisma";
import { isDeveloper } from "@/lib/developers";
import {
  publishCreditSummaryUpdate,
  publishCreditTransaction,
  publishUserCredits,
} from "@/lib/convex-client";

export const INITIAL_CREDITS = 200;
export const PROJECT_CREATION_COST = 50;
export const MIN_PROMPT_CREDITS = 10;
export const TOKENS_PER_CREDIT = 10;

type UsageLike = {
  totalTokens?: number;
  total_tokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
};

export const getUsageTokenBreakdown = (usage?: UsageLike | null) => {
  const promptTokens =
    usage?.promptTokens ?? usage?.prompt_tokens ?? 0;
  const completionTokens =
    usage?.completionTokens ?? usage?.completion_tokens ?? 0;
  const totalTokens =
    usage?.totalTokens ??
    usage?.total_tokens ??
    promptTokens + completionTokens;
  return { promptTokens, completionTokens, totalTokens };
};

export const getUsageTokenCount = (usage?: UsageLike | null) => {
  const { totalTokens } = getUsageTokenBreakdown(usage);
  return totalTokens;
};

export const calculatePromptCost = (usageTokens: number) => {
  const normalized = Math.max(usageTokens, 0);
  if (!normalized) return MIN_PROMPT_CREDITS;
  return Math.max(
    MIN_PROMPT_CREDITS,
    Math.ceil(normalized / TOKENS_PER_CREDIT)
  );
};

export const calculateTokenCost = (usageTokens: number) => {
  const normalized = Math.max(usageTokens, 0);
  if (!normalized) return 0;
  return Math.ceil(normalized / TOKENS_PER_CREDIT);
};

export const reserveMinimumCredits = async ({
  kindeId,
  reason,
  publishRealtime = true,
  recordTransaction = true,
}: {
  kindeId: string;
  reason: string;
  publishRealtime?: boolean;
  recordTransaction?: boolean;
}) =>
  deductCredits({
    kindeId,
    amount: MIN_PROMPT_CREDITS,
    reason,
    publishRealtime,
    recordTransaction,
  });

export const settleUsageCharge = async ({
  kindeId,
  usageTokens,
  promptTokens,
  completionTokens,
  minimumCharged = MIN_PROMPT_CREDITS,
  reason,
  publishRealtime = true,
  recordTransaction = true,
}: {
  kindeId: string;
  usageTokens: number;
  promptTokens?: number;
  completionTokens?: number;
  minimumCharged?: number;
  reason: string;
  publishRealtime?: boolean;
  recordTransaction?: boolean;
}) => {
  const total = calculatePromptCost(usageTokens);
  const extra = Math.max(0, total - minimumCharged);
  if (!extra) {
    return { ok: true, total, charged: minimumCharged, extra: 0 };
  }
  const result = await deductCredits({
    kindeId,
    amount: extra,
    reason,
    modelTokens: usageTokens,
    promptTokens,
    completionTokens,
    publishRealtime,
    recordTransaction,
  });
  return {
    ok: result.ok,
    total,
    charged: minimumCharged + extra,
    extra,
    credits: result.credits,
  };
};

export const ensureUserCredits = async (kindeId: string) => {
  const user = await prisma.user.findUnique({
    where: { kindeId },
    select: { credits: true },
  });
  if (!user) {
    const created = await prisma.user.create({
      data: {
        kindeId,
        credits: INITIAL_CREDITS,
      },
      select: { credits: true },
    });
    await publishUserCredits({ userId: kindeId, credits: created.credits });
    return created;
  }
  if (user.credits == null) {
    const updated = await prisma.user.update({
      where: { kindeId },
      data: { credits: INITIAL_CREDITS },
      select: { credits: true },
    });
    await publishUserCredits({ userId: kindeId, credits: updated.credits });
    return updated;
  }
  await publishUserCredits({ userId: kindeId, credits: user.credits });
  return user;
};

export const deductCredits = async ({
  kindeId,
  amount,
  reason,
  modelTokens,
  promptTokens,
  completionTokens,
  publishRealtime = true,
  recordTransaction = true,
}: {
  kindeId: string;
  amount: number;
  reason: string;
  modelTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  publishRealtime?: boolean;
  recordTransaction?: boolean;
}) => {
  if (amount <= 0) {
    return { ok: true, credits: null };
  }
  const developer = await isDeveloper(kindeId);
  if (developer) {
    return { ok: true, credits: null };
  }
  await ensureUserCredits(kindeId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { kindeId, credits: { gte: amount } },
        data: { credits: { decrement: amount } },
      });
      if (updated.count === 0) {
        const existing = await tx.user.findUnique({
          where: { kindeId },
          select: { credits: true },
        });
        return { ok: false, credits: existing?.credits ?? 0 };
      }
      const transaction = recordTransaction
          ? await tx.creditTransaction.create({
            data: {
              userId: kindeId,
              amount: -amount,
              reason,
              modelTokens,
              promptTokens,
              completionTokens,
            },
            select: {
              id: true,
              amount: true,
              reason: true,
              modelTokens: true,
              promptTokens: true,
              completionTokens: true,
              createdAt: true,
            },
          })
        : null;
      const user = await tx.user.findUnique({
        where: { kindeId },
        select: { credits: true },
      });
      return { ok: true, credits: user?.credits ?? 0, transaction };
    });
    if (publishRealtime && result.ok && typeof result.credits === "number") {
      await publishUserCredits({ userId: kindeId, credits: result.credits });
      if (result.transaction) {
        await publishCreditTransaction({
          userId: kindeId,
          transactionId: result.transaction.id,
          amount: result.transaction.amount,
          reason: result.transaction.reason,
          modelTokens: result.transaction.modelTokens ?? undefined,
          promptTokens: result.transaction.promptTokens ?? undefined,
          completionTokens: result.transaction.completionTokens ?? undefined,
          createdAt: result.transaction.createdAt.getTime(),
        });
      }
    }
    return result;
  } catch {
    const fallback = await prisma.user.findUnique({
      where: { kindeId },
      select: { credits: true },
    });
    return { ok: false, credits: fallback?.credits ?? 0 };
  }
};

export const chargeForUsage = async ({
  kindeId,
  usage,
  reason,
  publishRealtime = true,
  recordTransaction = true,
}: {
  kindeId: string;
  usage?: UsageLike | null;
  reason: string;
  publishRealtime?: boolean;
  recordTransaction?: boolean;
}) => {
  const { totalTokens } = getUsageTokenBreakdown(usage);
  const amount = calculatePromptCost(totalTokens);
  const result = await deductCredits({
    kindeId,
    amount,
    reason,
    modelTokens: totalTokens,
    promptTokens: usage?.promptTokens ?? usage?.prompt_tokens,
    completionTokens: usage?.completionTokens ?? usage?.completion_tokens,
    publishRealtime,
    recordTransaction,
  });
  return { ...result, amount, modelTokens: totalTokens };
};

export const syncRealtimeCredits = async ({
  kindeId,
  transactionLimit = 50,
}: {
  kindeId: string;
  transactionLimit?: number;
}) => {
  const developer = await isDeveloper(kindeId);
  if (developer) return;

  const [user, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { kindeId },
      select: { credits: true },
    }),
    getCreditTransactionsForUser({
      kindeId,
      limit: transactionLimit,
    }),
  ]);

  if (typeof user?.credits === "number") {
    await publishUserCredits({ userId: kindeId, credits: user.credits });
  }

  await Promise.all(
    transactions.map((tx) =>
      publishCreditTransaction({
        userId: kindeId,
        transactionId: tx.id,
        amount: tx.amount,
        reason: tx.reason,
        modelTokens: tx.modelTokens ?? undefined,
        promptTokens: tx.promptTokens ?? undefined,
        completionTokens: tx.completionTokens ?? undefined,
        details: Array.isArray(tx.details) ? tx.details : undefined,
        createdAt: tx.createdAt.getTime(),
      })
    )
  );
};

export const getCreditTransactionsForUser = async ({
  kindeId,
  limit = 50,
}: {
  kindeId: string;
  limit?: number;
}) => {
  const user = await prisma.user.findUnique({
    where: { kindeId },
    select: { id: true },
  });
  const userIds = [kindeId, user?.id].filter(Boolean) as string[];
  return prisma.creditTransaction.findMany({
    where: { userId: { in: userIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      amount: true,
      reason: true,
      modelTokens: true,
      promptTokens: true,
      completionTokens: true,
      details: true,
      createdAt: true,
    },
  });
};

export const recordCreditSummary = async ({
  kindeId,
  amount,
  reason,
  modelTokens,
  promptTokens,
  completionTokens,
  details,
  transactionId,
}: {
  kindeId: string;
  amount: number;
  reason: string;
  modelTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  details: { amount: number; reason: string; modelTokens?: number }[];
  transactionId?: string;
}) => {
  if (amount >= 0) return { ok: true };
  await ensureUserCredits(kindeId);
  let transaction;
  try {
    transaction = await prisma.creditTransaction.create({
      data: {
        userId: kindeId,
        amount,
        reason,
        modelTokens,
        promptTokens,
        completionTokens,
        details,
      },
      select: {
        id: true,
        amount: true,
        reason: true,
        modelTokens: true,
        promptTokens: true,
        completionTokens: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to record credit summary with details.", error);
    transaction = await prisma.creditTransaction.create({
      data: {
        userId: kindeId,
        amount,
        reason,
        modelTokens,
        promptTokens,
        completionTokens,
      },
      select: {
        id: true,
        amount: true,
        reason: true,
        modelTokens: true,
        promptTokens: true,
        completionTokens: true,
        createdAt: true,
      },
    });
  }
  const user = await prisma.user.findUnique({
    where: { kindeId },
    select: { credits: true },
  });
  if (typeof user?.credits === "number") {
    await publishUserCredits({ userId: kindeId, credits: user.credits });
  }
  const convexTransactionId = transactionId ?? transaction.id;
  try {
    await publishCreditSummaryUpdate({
      userId: kindeId,
      transactionId: convexTransactionId,
      amount: transaction.amount,
      reason: transaction.reason,
      modelTokens: transaction.modelTokens ?? undefined,
      promptTokens: transaction.promptTokens ?? undefined,
      completionTokens: transaction.completionTokens ?? undefined,
      createdAt: transaction.createdAt.getTime(),
      details,
    });
  } catch (error) {
    console.error("Failed to publish credit summary details to Convex.", error);
    await publishCreditSummaryUpdate({
      userId: kindeId,
      transactionId: convexTransactionId,
      amount: transaction.amount,
      reason: transaction.reason,
      modelTokens: transaction.modelTokens ?? undefined,
      promptTokens: transaction.promptTokens ?? undefined,
      completionTokens: transaction.completionTokens ?? undefined,
      createdAt: transaction.createdAt.getTime(),
    });
  }
  return { ok: true, credits: user?.credits ?? 0, transaction };
};
