import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  realtimeProjects: defineTable({
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
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),
  realtimeFrames: defineTable({
    projectId: v.string(),
    userId: v.string(),
    frameId: v.string(),
    title: v.string(),
    htmlContent: v.string(),
    isLoading: v.boolean(),
    order: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_frame", ["frameId"]),
  realtimeCredits: defineTable({
    userId: v.string(),
    credits: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
  realtimeCreditTransactions: defineTable({
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
    updatedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_transaction", ["transactionId"]),
});
