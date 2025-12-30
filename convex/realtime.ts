import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const resolveServerSecret = () =>
  process.env.CONVEX_SERVER_SECRET ?? process.env.NEXT_PUBLIC_CONVEX_SERVER_SECRET;

const requireAuthorizedUser = async (
  ctx: { auth: { getUserIdentity: () => Promise<{ subject?: string } | null> } },
  userId: string,
  serverSecret?: string
) => {
  const identity = await ctx.auth.getUserIdentity();
  if (identity?.subject) {
    if (identity.subject !== userId) {
      throw new Error("Unauthorized");
    }
    return;
  }

  const expectedSecret = resolveServerSecret();
  if (!serverSecret) {
    throw new Error("Unauthorized");
  }

  if (expectedSecret && serverSecret !== expectedSecret) {
    throw new Error("Unauthorized");
  }

  if (!expectedSecret && process.env.NODE_ENV !== "production") {
    console.warn(
      "Convex server secret is not configured; allowing dev request with provided secret."
    );
  }
};

export const getProjectState = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return null;

    const record = await ctx.db
      .query("realtimeProjects")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .first();

    if (!record || record.userId !== identity.subject) return null;
    return record;
  },
});

export const getProjectFrames = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return [];

    const frames = await ctx.db
      .query("realtimeFrames")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    return frames.filter((frame) => frame.userId === identity.subject);
  },
});

export const getUserCredits = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return null;

    return ctx.db
      .query("realtimeCredits")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();
  },
});

export const getUserCreditTransactions = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) return [];

    const transactions = await ctx.db
      .query("realtimeCreditTransactions")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(limit ?? 10);

    return transactions;
  },
});

export const setProjectStatus = mutation({
  args: {
    projectId: v.string(),
    userId: v.string(),
    status: v.union(
      v.literal("idle"),
      v.literal("running"),
      v.literal("analyzing"),
      v.literal("generating"),
      v.literal("completed"),
      v.literal("failed")
    ),
    themeId: v.optional(v.string()),
    totalScreens: v.optional(v.number()),
    message: v.optional(v.string()),
    serverSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx, args.userId, args.serverSecret);
    const existing = await ctx.db
      .query("realtimeProjects")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    const payload = {
      projectId: args.projectId,
      userId: args.userId,
      status: args.status,
      themeId: args.themeId,
      totalScreens: args.totalScreens,
      message: args.message,
      updatedAt: Date.now(),
    };

    if (!existing) {
      await ctx.db.insert("realtimeProjects", payload);
      return;
    }

    await ctx.db.patch(existing._id, payload);
  },
});

export const setUserCredits = mutation({
  args: {
    userId: v.string(),
    credits: v.number(),
    serverSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx, args.userId, args.serverSecret);
    const existing = await ctx.db
      .query("realtimeCredits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing && existing.credits === args.credits) {
      return;
    }

    const payload = {
      userId: args.userId,
      credits: args.credits,
      updatedAt: Date.now(),
    };

    if (!existing) {
      await ctx.db.insert("realtimeCredits", payload);
      return;
    }

    await ctx.db.patch(existing._id, payload);
  },
});

export const addCreditTransaction = mutation({
  args: {
    userId: v.string(),
    transactionId: v.string(),
    amount: v.number(),
    reason: v.string(),
    modelTokens: v.optional(v.number()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    details: v.optional(
      v.array(
        v.object({
          amount: v.number(),
          reason: v.string(),
          modelTokens: v.optional(v.number()),
        })
      )
    ),
    createdAt: v.number(),
    serverSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx, args.userId, args.serverSecret);

    const existing = await ctx.db
      .query("realtimeCreditTransactions")
      .withIndex("by_transaction", (q) => q.eq("transactionId", args.transactionId))
      .first();
    if (existing) return;

    await ctx.db.insert("realtimeCreditTransactions", {
      userId: args.userId,
      transactionId: args.transactionId,
      amount: args.amount,
      reason: args.reason,
      modelTokens: args.modelTokens,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      details: args.details,
      createdAt: args.createdAt,
    });
  },
});

export const upsertCreditSummary = mutation({
  args: {
    userId: v.string(),
    transactionId: v.string(),
    amount: v.number(),
    reason: v.string(),
    modelTokens: v.optional(v.number()),
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    details: v.optional(
      v.array(
        v.object({
          amount: v.number(),
          reason: v.string(),
          modelTokens: v.optional(v.number()),
        })
      )
    ),
    createdAt: v.number(),
    serverSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx, args.userId, args.serverSecret);

    const existing = await ctx.db
      .query("realtimeCreditTransactions")
      .withIndex("by_transaction", (q) =>
        q.eq("transactionId", args.transactionId)
      )
      .first();

    const payload = {
      userId: args.userId,
      transactionId: args.transactionId,
      amount: args.amount,
      reason: args.reason,
      modelTokens: args.modelTokens,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      details: args.details,
      createdAt: existing?.createdAt ?? args.createdAt,
      updatedAt: Date.now(),
    };

    if (!existing) {
      await ctx.db.insert("realtimeCreditTransactions", payload);
      return;
    }

    await ctx.db.patch(existing._id, payload);
  },
});

export const upsertFrame = mutation({
  args: {
    projectId: v.string(),
    userId: v.string(),
    frameId: v.string(),
    title: v.string(),
    htmlContent: v.string(),
    isLoading: v.boolean(),
    order: v.optional(v.number()),
    replaceFrameId: v.optional(v.string()),
    serverSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx, args.userId, args.serverSecret);

    if (args.replaceFrameId) {
      const old = await ctx.db
        .query("realtimeFrames")
        .withIndex("by_frame", (q) => q.eq("frameId", args.replaceFrameId))
        .first();
      if (old) {
        await ctx.db.delete(old._id);
      }
    }

    const existing = await ctx.db
      .query("realtimeFrames")
      .withIndex("by_frame", (q) => q.eq("frameId", args.frameId))
      .first();

    const payload = {
      projectId: args.projectId,
      userId: args.userId,
      frameId: args.frameId,
      title: args.title,
      htmlContent: args.htmlContent,
      isLoading: args.isLoading,
      order: args.order,
      updatedAt: Date.now(),
    };

    if (!existing) {
      await ctx.db.insert("realtimeFrames", payload);
      return;
    }

    await ctx.db.patch(existing._id, payload);
  },
});

export const deleteFrame = mutation({
  args: {
    projectId: v.string(),
    userId: v.string(),
    frameId: v.string(),
    serverSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthorizedUser(ctx, args.userId, args.serverSecret);

    const existing = await ctx.db
      .query("realtimeFrames")
      .withIndex("by_frame", (q) => q.eq("frameId", args.frameId))
      .first();

    if (!existing || existing.projectId !== args.projectId) return;
    await ctx.db.delete(existing._id);
  },
});
