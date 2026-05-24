import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

function parseGrade(grade: string): number | null {
  const trimmed = grade.trim();
  const pct = trimmed.match(/^-?(\d+(?:\.\d+)?)\s*%?$/);
  if (pct) return parseFloat(pct[1]);

  const letterMap: Record<string, number> = {
    "A+": 98, A: 95, "A-": 92,
    "B+": 88, B: 85, "B-": 82,
    "C+": 78, C: 75, "C-": 72,
    "D+": 68, D: 65, "D-": 62,
    F: 50,
  };
  const upper = trimmed.toUpperCase();
  if (upper in letterMap) return letterMap[upper];

  const score = trimmed.match(/(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)/);
  if (score) {
    const [, num, denom] = score;
    return (parseFloat(num) / parseFloat(denom)) * 100;
  }
  return null;
}

export function compareGrades(profGrade: string, aiGrade: string) {
  const matchExact =
    profGrade.trim().toLowerCase() === aiGrade.trim().toLowerCase();
  const p = parseGrade(profGrade);
  const a = parseGrade(aiGrade);
  const diff = p !== null && a !== null ? Math.abs(p - a) : null;
  return { matchExact, diff };
}

export const recordResult = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    holdoutEssayId: v.id("essays"),
    professorGrade: v.string(),
    aiGrade: v.string(),
  },
  handler: async (ctx, args) => {
    const { matchExact, diff } = compareGrades(
      args.professorGrade,
      args.aiGrade
    );
    await ctx.db.insert("evaluations", {
      sessionId: args.sessionId,
      holdoutEssayId: args.holdoutEssayId,
      professorGrade: args.professorGrade,
      aiGrade: args.aiGrade,
      gradeMatch: matchExact,
      gradeDifference: diff ?? undefined,
      createdAt: Date.now(),
    });
  },
});

export const summarize = query({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const holdouts = await ctx.db
      .query("essays")
      .withIndex("by_session_and_type", (q) =>
        q.eq("sessionId", args.sessionId).eq("type", "holdout")
      )
      .collect();

    const completed = holdouts.filter(
      (e) => e.status === "complete" && e.aiGrade && e.professorGrade
    );

    const rows = completed.map((e) => {
      const { matchExact, diff } = compareGrades(
        e.professorGrade!,
        e.aiGrade!
      );
      return {
        essayId: e._id,
        title: e.title,
        professorGrade: e.professorGrade!,
        aiGrade: e.aiGrade!,
        matchExact,
        diff,
        aiConfidence: e.aiConfidence,
      };
    });

    const exactMatches = rows.filter((r) => r.matchExact).length;
    const avgDiff =
      rows.length > 0
        ? rows.reduce((s, r) => s + (r.diff ?? 0), 0) /
          rows.filter((r) => r.diff !== null && r.diff !== undefined).length
        : 0;
    const within5 = rows.filter((r) => r.diff !== null && r.diff! <= 5).length;
    const within10 = rows.filter((r) => r.diff !== null && r.diff! <= 10).length;

    return {
      total: rows.length,
      exactMatches,
      avgDiff: isNaN(avgDiff) ? 0 : avgDiff,
      within5,
      within10,
      rows,
      pendingCount: holdouts.filter((e) => e.status !== "complete").length,
    };
  },
});

export const moveToHoldout = mutation({
  args: {
    sessionId: v.id("sessions"),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    const refs = await ctx.db
      .query("essays")
      .withIndex("by_session_and_type", (q) =>
        q.eq("sessionId", args.sessionId).eq("type", "reference")
      )
      .collect();

    if (refs.length < args.count + 2) {
      throw new Error(
        `Need at least ${args.count + 2} reference essays to hold out ${args.count} (keeps minimum 2 for calibration). Currently have ${refs.length}.`
      );
    }

    const shuffled = [...refs].sort(() => Math.random() - 0.5);
    const toHoldout = shuffled.slice(0, args.count);
    for (const e of toHoldout) {
      await ctx.db.patch(e._id, {
        type: "holdout",
        status: "pending",
        aiGrade: undefined,
        aiFeedback: undefined,
        aiReasoning: undefined,
        aiConfidence: undefined,
        aiCriteriaBreakdown: undefined,
        gradedAt: undefined,
      });
    }
    return { movedCount: toHoldout.length };
  },
});

export const restoreAllHoldouts = mutation({
  args: { sessionId: v.id("sessions") },
  handler: async (ctx, args) => {
    const holdouts = await ctx.db
      .query("essays")
      .withIndex("by_session_and_type", (q) =>
        q.eq("sessionId", args.sessionId).eq("type", "holdout")
      )
      .collect();
    for (const e of holdouts) {
      await ctx.db.patch(e._id, {
        type: "reference",
        status: "complete",
      });
    }
    const evals = await ctx.db
      .query("evaluations")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    for (const ev of evals) await ctx.db.delete(ev._id);
  },
});
