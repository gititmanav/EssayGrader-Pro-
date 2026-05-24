import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getForSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const rubric = await ctx.db
      .query("rubrics")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    return rubric;
  },
});

export const upsert = mutation({
  args: {
    sessionId: v.id("sessions"),
    content: v.string(),
    maxScore: v.optional(v.number()),
    gradeScale: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rubrics")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        maxScore: args.maxScore ?? existing.maxScore,
        gradeScale: args.gradeScale ?? existing.gradeScale,
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return await ctx.db.insert("rubrics", {
      sessionId: args.sessionId,
      content: args.content,
      maxScore: args.maxScore ?? 100,
      gradeScale: args.gradeScale,
      updatedAt: Date.now(),
    });
  },
});

export const setExtracted = mutation({
  args: {
    sessionId: v.id("sessions"),
    extractedCriteria: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rubrics")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    if (!existing) {
      await ctx.db.insert("rubrics", {
        sessionId: args.sessionId,
        content: "",
        extractedCriteria: args.extractedCriteria,
        maxScore: 100,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(existing._id, {
        extractedCriteria: args.extractedCriteria,
        updatedAt: Date.now(),
      });
    }
  },
});
