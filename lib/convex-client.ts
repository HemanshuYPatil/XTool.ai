import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL;
const convexServerSecret =
  process.env.CONVEX_SERVER_SECRET ?? process.env.NEXT_PUBLIC_CONVEX_SERVER_SECRET;
const convexClient = convexUrl ? new ConvexHttpClient(convexUrl) : null;
const api = anyApi;

const withConvex = async <T>(fn: (client: ConvexHttpClient) => Promise<T>) => {
  if (!convexClient || !convexServerSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Convex server credentials are not configured.");
    }
    console.warn(
      "Convex publish skipped: missing CONVEX_URL or CONVEX_SERVER_SECRET."
    );
    return null;
  }
  return fn(convexClient);
};

export const publishProjectStatus = async ({
  projectId,
  userId,
  status,
  themeId,
  totalScreens,
  message,
}: {
  projectId: string;
  userId: string;
  status: "idle" | "running" | "analyzing" | "generating" | "completed" | "failed";
  themeId?: string;
  totalScreens?: number;
  message?: string;
}) =>
  withConvex((client) =>
    client.mutation(api.realtime.setProjectStatus, {
      projectId,
      userId,
      status,
      themeId,
      totalScreens,
      message,
      serverSecret: convexServerSecret,
    })
  );

export const publishFrame = async ({
  projectId,
  userId,
  frameId,
  title,
  htmlContent,
  isLoading,
  order,
  replaceFrameId,
}: {
  projectId: string;
  userId: string;
  frameId: string;
  title: string;
  htmlContent: string;
  isLoading: boolean;
  order?: number;
  replaceFrameId?: string;
}) =>
  withConvex((client) =>
    client.mutation(api.realtime.upsertFrame, {
      projectId,
      userId,
      frameId,
      title,
      htmlContent,
      isLoading,
      order,
      replaceFrameId,
      serverSecret: convexServerSecret,
    })
  );

export const publishFrameDeletion = async ({
  projectId,
  userId,
  frameId,
}: {
  projectId: string;
  userId: string;
  frameId: string;
}) =>
  withConvex((client) =>
    client.mutation(api.realtime.deleteFrame, {
      projectId,
      userId,
      frameId,
      serverSecret: convexServerSecret,
    })
  );

export const publishUserCredits = async ({
  userId,
  credits,
}: {
  userId: string;
  credits: number;
}) =>
  withConvex((client) =>
    client.mutation(api.realtime.setUserCredits, {
      userId,
      credits,
      serverSecret: convexServerSecret,
    })
  );

export const publishCreditTransaction = async ({
  userId,
  transactionId,
  amount,
  reason,
  modelTokens,
  promptTokens,
  completionTokens,
  createdAt,
  details,
}: {
  userId: string;
  transactionId: string;
  amount: number;
  reason: string;
  modelTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  createdAt: number;
  details?: { amount: number; reason: string; modelTokens?: number }[];
}) =>
  withConvex((client) =>
    client.mutation(api.realtime.addCreditTransaction, {
      userId,
      transactionId,
      amount,
      reason,
      modelTokens,
      promptTokens,
      completionTokens,
      createdAt,
      details,
      serverSecret: convexServerSecret,
    })
  );

export const publishCreditSummaryUpdate = async ({
  userId,
  transactionId,
  amount,
  reason,
  modelTokens,
  promptTokens,
  completionTokens,
  createdAt,
  details,
}: {
  userId: string;
  transactionId: string;
  amount: number;
  reason: string;
  modelTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  createdAt: number;
  details?: { amount: number; reason: string; modelTokens?: number }[];
}) =>
  withConvex((client) =>
    client.mutation(api.realtime.upsertCreditSummary, {
      userId,
      transactionId,
      amount,
      reason,
      modelTokens,
      promptTokens,
      completionTokens,
      createdAt,
      details,
      serverSecret: convexServerSecret,
    })
  );
