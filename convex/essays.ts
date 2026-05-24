import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const listForSession = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("essays")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listByType = query({
  args: {
    sessionId: v.id("sessions"),
    type: v.union(
      v.literal("reference"),
      v.literal("ungraded"),
      v.literal("holdout")
    ),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("essays")
      .withIndex("by_session_and_type", (q) =>
        q.eq("sessionId", args.sessionId).eq("type", args.type)
      )
      .collect();
    return rows.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { essayId: v.id("essays") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.essayId);
  },
});

export const addReference = mutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.string(),
    content: v.string(),
    professorGrade: v.string(),
    professorFeedback: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("essays", {
      sessionId: args.sessionId,
      title: args.title,
      content: args.content,
      type: "reference",
      status: "complete",
      professorGrade: args.professorGrade,
      professorFeedback: args.professorFeedback,
      createdAt: Date.now(),
    });
  },
});

export const addUngraded = mutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.string(),
    content: v.string(),
    s3Key: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("essays", {
      sessionId: args.sessionId,
      title: args.title,
      content: args.content,
      type: "ungraded",
      status: "pending",
      s3Key: args.s3Key,
      createdAt: Date.now(),
    });
  },
});

export const markGrading = internalMutation({
  args: { essayId: v.id("essays") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.essayId, { status: "grading" });
  },
});

export const saveAIGrade = internalMutation({
  args: {
    essayId: v.id("essays"),
    aiGrade: v.string(),
    aiFeedback: v.string(),
    aiReasoning: v.string(),
    aiConfidence: v.number(),
    aiCriteriaBreakdown: v.optional(
      v.array(
        v.object({
          criterion: v.string(),
          score: v.string(),
          comment: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.essayId, {
      status: "complete",
      aiGrade: args.aiGrade,
      aiFeedback: args.aiFeedback,
      aiReasoning: args.aiReasoning,
      aiConfidence: args.aiConfidence,
      aiCriteriaBreakdown: args.aiCriteriaBreakdown,
      gradedAt: Date.now(),
    });
  },
});

export const markError = internalMutation({
  args: {
    essayId: v.id("essays"),
    errorMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.essayId, {
      status: "error",
      errorMessage: args.errorMessage,
    });
  },
});

export const approve = mutation({
  args: { essayId: v.id("essays") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.essayId, { professorApproved: true });
  },
});

export const overrideGrade = mutation({
  args: {
    essayId: v.id("essays"),
    adjustedGrade: v.optional(v.string()),
    adjustedFeedback: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.essayId, {
      professorAdjustedGrade: args.adjustedGrade,
      professorAdjustedFeedback: args.adjustedFeedback,
      professorNotes: args.notes,
      professorApproved: args.adjustedGrade ? false : undefined,
    });
  },
});

export const remove = mutation({
  args: { essayId: v.id("essays") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.essayId);
  },
});

export const convertToHoldout = mutation({
  args: { essayId: v.id("essays") },
  handler: async (ctx, args) => {
    const essay = await ctx.db.get(args.essayId);
    if (!essay || essay.type !== "reference") return;
    await ctx.db.patch(args.essayId, {
      type: "holdout",
      status: "pending",
      aiGrade: undefined,
      aiFeedback: undefined,
      aiReasoning: undefined,
      aiConfidence: undefined,
      aiCriteriaBreakdown: undefined,
      gradedAt: undefined,
    });
  },
});

export const convertToReference = mutation({
  args: { essayId: v.id("essays") },
  handler: async (ctx, args) => {
    const essay = await ctx.db.get(args.essayId);
    if (!essay) return;
    await ctx.db.patch(args.essayId, {
      type: "reference",
      status: "complete",
    });
  },
});

export const stats = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("essays")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const reference = all.filter((e) => e.type === "reference").length;
    const ungraded = all.filter((e) => e.type === "ungraded");
    const holdout = all.filter((e) => e.type === "holdout");

    const graded = ungraded.filter((e) => e.status === "complete");
    const pending = ungraded.filter((e) => e.status === "pending");
    const inProgress = ungraded.filter((e) => e.status === "grading");
    const errors = ungraded.filter((e) => e.status === "error");

    const approved = graded.filter((e) => e.professorApproved === true).length;
    const overridden = graded.filter((e) => e.professorAdjustedGrade).length;

    const avgConfidence =
      graded.length > 0
        ? graded.reduce((s, e) => s + (e.aiConfidence ?? 0), 0) / graded.length
        : 0;

    return {
      reference,
      ungraded: ungraded.length,
      holdout: holdout.length,
      graded: graded.length,
      pending: pending.length,
      inProgress: inProgress.length,
      errors: errors.length,
      approved,
      overridden,
      avgConfidence,
    };
  },
});
